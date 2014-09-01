/**
 * Created by think on 2014/8/28.
 */

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
    var err = new Error("need to rewrite loadUser()");
    callback(err);
}

/**
 * 用户认证
 * @param callback
 * @example
 * ```
 * User.prototype.authentication = function(username, pwd, callback){
 *      if (username === '123' && pwd ==='123'){
 *          callback(null, true);
 *      }
 * }
 * ```
 */
UserMini.authentication = function(username, pwd, callback) {
    var err = new Error("need to rewrite authentication()");
    callback(err);
}

/**
 * 默认配置
 * @type {{loginView: string, registryView: string}}
 */
var basicConfig = {
    loginUrl: '/login',
    registryUrl: '/register',
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
    if (config && config.loginView) {
        this.loginUrl = config.loginUrl;
    } else {
        this.loginUrl = basicConfig.loginUrl;
    }

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
    app.get(this.loginUrl, this.loginView);
}

AuthManager.prototype.loginView = function(req, res, next) {
    res.send("<form action=\"\" method=\"post\"><input type=\"text\" name=\"username\"/>" +
        "<input type='text' name='pwd'/><input type=\"submit\" value=\"sign in\"/>");
}

AuthManager.prototype.login = function(){
    var loginUrl = this.loginUrl;
    var login_view = this.loginView;
    var userModel = this.userModel;
    return function(req, res, next) {
        if (userModel) {
            var backUrl = req.query.backUrl || "/";
            var username = req.body.username;
            var pwd = req.body.pwd;
            userModel.authentication(username, pwd, function(err, user) {
                if (err) {
                    next(err);
                } else if (user){
                    console.info("login success");
                    req.session.isAuthenticate = true;
                    req.session._user = user.id;
                    res.redirect(backUrl);
                } else {
                    req.locals.error = '用户名或密码错误';
                    login_view(req, res, next);
                }
            });
        } else {
            var error = new Error("UserModel must instanceOf UserMini");
            next(error);
        }
    }
}

module.exports.UserMin = UserMini;
module.exports.AuthManager = AuthManager;