/**
 * Created by think on 2014/8/28.
 */
var users = [
    {id:1, username:"test", pwd:"test", email:"wanglihui.sjz@gmail.com"}
];

function UserMini(){
}

/**
 * 通过ID加载用户
 * @param {String or ObjectId or Number} id
 * @param callback
 * @example
 * ```
 *  function User(){
 *      UserMini.call(this)
 *  }
 *
 *  User.loadUser = function(id, callback){
 *      return {id:1, username:"1234", pwd:"123"}
 *  }
 * ```
 */
UserMini.loadUser = function(id, callback) {
    var user = null;
    for(var i=0;i<users.length;i++) {
        if (users[i].id == id) {
            user = users[i];
            break;
        }
    }
    callback(null, user);
}

/**
 * 用户认证
 * @param callback
 * @example
 * ```
 * User.authentication = function(username, pwd, callback){
 *      if (username === '123' && pwd ==='123'){
 *          callback(null, true);
 *      }
 * }
 * ```
 */
UserMini.authentication = function(username, pwd, callback) {
    var user = null;
    for(var i=0;i<users.length;i++) {
        if (users[i].username === username && users[i].pwd === pwd) {
            user = users[i];
            break;
        }
    }
    callback(null, user);
}

UserMini.save = function(user, callback) {
    if (user && user.username && user.pwd && user.email) {
        user.id = users.length+1;
        users.push(user);
        callback(null, user);
    } else {
        callback(null, null);
    }
}

/**
 * 默认配置
 * @type {{loginView: string, registryView: string}}
 */
var basicConfig = {
    //登录地址
    loginUrl: '/login',
    //登录页面地址
    loginViewPath: 'login',
    //是否开启登录验证码
    loginVerificationCode:false,
    //注册页面地址
    registerViewPath: 'register',
    //注册地址
    registerUrl: '/register',
    //是否开启注册验证码
    registerVerificationCode:false,
    //找回密码
    findPwdUrl: "/find-pwd",
    //找回密码页面
    findPwdViewPath: "findPwd",
    //是否开启找回密码验证码
    findPwdVerificationCode: false,
    //用户容器类
    userModel:UserMini
}

/**
 * 认证管理器
 * @param config
 * @constructor
 * @example
 * ```
 * var config = {
 *      loginView:"/user/login",
 *      registryView:"/user/registry"
 * }
 * var authManager = new AuthManager(config);
 * authManager.registerRouter(app);
 * ```
 */
function AuthManager(config){
    this._authenticated = false;
    if (config && config.loginUrl) {
        this.loginUrl = config.loginUrl;
    } else {
        this.loginUrl = basicConfig.loginUrl;
    }

    if (config && config.loginViewPath) {
        this.loginViewPath = config.loginViewPath;
    } else {
        this.loginViewPath = basicConfig.loginViewPath;
    }
    this.registerUrl = config.registerUrl?config.registerUrl:basicConfig.registerUrl;
    this.registerViewPath = config.registerViewPath ? config.registerViewPath : basicConfig.registerViewPath;
    this.findPwdUrl = config.findPwdUrl?config.findPwdUrl:basicConfig.findPwdUrl;
    this.findPwdViewPath = config.findPwdViewPath?config.findPwdViewPath:basicConfig.findPwdViewPath;

    if (config && config.userModel) {
        this.userModel = config.userModel;
    } else {
        this.userModel = basicConfig.userModel;
    }
}

AuthManager.prototype.isAuthenticate = function() {
    return this._authenticated;
}

AuthManager.prototype.requireAuthenticate = function(){
    var loginUrl = this.loginUrl;
    return function(req, res, next) {
        if (req.session.isAuthenticate) {
            next();
        } else {
            var backUrl = req.originalUrl;
            res.redirect(loginUrl+"?backUrl="+backUrl);
        }
    }
}

/**
 * 注册登录地址到app
 * @param app
 */
AuthManager.prototype.registerRouter = function(app) {
    app.post(this.loginUrl, this.login());
    app.get(this.loginUrl, this.loginView());
    app.get(this.registerUrl, this.registerView());
    app.post(this.registerUrl, this.register());
    app.get(this.findPwdUrl, this.findPwdView());
    app.post(this.findPwdUrl, this.findPwd());
}

AuthManager.prototype.loginView = function(options) {
    var loginViewPath = this.loginViewPath;
    if (!options) {
        options = {};
    }
    return function(req, res, next) {
        var submit = req.body || {};
        options.submit = submit;
        res.render(loginViewPath, options);
    }
}

AuthManager.prototype.login = function(){
    var loginUrl = this.loginUrl;
    var login_view = this.loginView;
    var userModel = this.userModel;
    var authManager = this;
    return function(req, res, next) {
        if (userModel) {
            var backUrl = req.query.backUrl || "/";
            var username = req.body.username;
            var pwd = req.body.pwd;
            userModel.authentication(username, pwd, function(err, user) {
                if (err) {
                    next(err);
                } else if (user){
                    req.session.isAuthenticate = true;
                    req.session._user = user.id;
                    res.redirect(backUrl);
                } else {
                    res.locals.error = '用户名或密码错误';
                    login_view.call(authManager)(req, res, next);
                }
            });
        } else {
            var error = new Error("UserModel must instanceOf UserMini");
            next(error);
        }
    }
}

AuthManager.prototype.register = function() {
    var authManager = this;
    return function(req, res, next) {
        var user = req.body.user || req.body;
        if (user && user.username && user.pwd && user.email) {
            authManager.userModel.save(user, function(err, user) {
                if (err) {
                    next(err);
                } else if (user){
                    res.locals.success = '注册成功';
                    authManager.registerView()(req, res, next);
                } else {
                    res.locals.error = '参数不完整';
                    authManager.registerView()(req, res, next);
                }
            })
        }
    }
}

AuthManager.prototype.registerView = function(options) {
    var authManager = this;
    return function(req, res, next) {
        var submit = req.body.user || req.body;
        if (!options) {
            options = {};
        }
        options.submit = submit;
        res.render(authManager.registerViewPath, options);
    }
}

AuthManager.prototype.findPwdView = function(options) {
    var authManager = this;
    return function(req, res, next) {
        if (!options) {
            options = {};
        }
        options.submit = req.body.email;
        res.render(authManager.findPwdViewPath, options);
    }
}

AuthManager.prototype.findPwd = function() {
    var authManager = this;
    return function(req, res, next) {
        var email = req.body.email;
        if (email) {
            res.send("待实现发送找回密码邮件");
        } else {
            res.locals.error = '邮箱不能为空';
            authManager.findPwdView()(req, res, next);
        }
    }
}

module.exports.UserMin = UserMini;
module.exports.AuthManager = AuthManager;