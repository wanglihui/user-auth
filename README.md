user-auth
=========

nodejs auth middleware

---

###### 主要组件及功能

>1. 验证用户是否登录（中间件) (开发中)
>2. 用户注册 (开发中)
>3. 用户登录 (开发中)
>4. 找回密码 (开发中)

###### 使用
>1.  声明user对象继承UserMini,实现必须的方法
>2.  声明符合自己程序的config
>2.  实例化AuthManager对象，注册登录注册地址
>3.  使用中间件验证需要登录的地址

```
//声明User对象
function User(){
  UserMini(this);
}

User.prototype = new UserMini();

User.prototype.loadUser = function(id, callback){
  var user = new User();
  user.id = id;
  user.username = 'test';
  user.pwd = 'test';
  callback(null, user);
}

User.prototype.authentication = function(username, pwd, callback){
  if (username == 'test' && pwd == 'test'){
    var user = new User();
    user.id = 1;
    user.username = 'test';
    user.pwd = 'test';
    callback(null, user);
  } else {
    callback(null,null);
  }
}

//声明配置文件
var config = {
  loginView : '/login',
  loginAction: '/login',
  userModel: User
}

//实例化AuthManager
var authManager = new AuthManager(config);

//注册登录地址，如果用户没有登录自动跳转到配置文件中loginView地址
//登录信息提交到loginAction地址
authManager.registerRouter(app);

//使用中间件,验证是否登录
app.get("/list", authManager.requireAuthentication, function(req, res, next){
  res.send("这个网址需要登录以后才能看到");
}
```
