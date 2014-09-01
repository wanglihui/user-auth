var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var redis = require('redis');
var RedisStore = require('connect-redis')(expressSession);
var rClient = redis.createClient();
var sessionStore = new RedisStore({client:rClient});

var routes = require('./routes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(expressSession({secret:"example.com", store: sessionStore}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

var User = require('./model/user');
config = {}
var AuthManager = require('../lib').AuthManager;
var authManager = new AuthManager(config);

authManager.registerRouter(app);
app.get('/', routes.index);
app.get('/list',authManager.requireAuthenticate(), function(req, res, next){
    res.send("list");
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
