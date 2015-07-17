var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var cookieSession = require('cookie-session');

var index = require('./routes/index');
var users = require('./routes/users');
var active = require('./routes/active');

var app = express();

var Users     = require('./model/users.js');
var usersModel     = new Users();
var moment    = require('moment');





app.locals.moment     = moment;
app.locals.session    = {};
global.moment   = app.locals.moment   = moment;
global.usersModel = usersModel;



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(cookieParser("wdshare"));
app.use(cookieSession({          //session 加密字符串
    key:'wdshare',
    secret: 'wdshare',
    name  :'wdshare',
    cookie: { path: '/', httpOnly: true, maxAge: null }
}));

app.use('/files/', express.static(path.join(__dirname, 'files')));
app.use('/static/',express.static(path.join(__dirname, 'public')));


app.use(function(req,res,next){
    "use strict";
    res.locals.user = req.session.user;
    next();
});

// app.use('/', function(req,res,next){
//     //res.redirect('/active/');
//     if (req.url === '/') {
//         req.url = '/active/';
//     }
//     next();
// });
app.use('/', index);
app.use('/active', active);


// 管理后台首页
var manage = require('./manage/routes/index');
app.use('/manage/', manage);
// 管理活动相关
var manage_active = require('./manage/routes/active');
app.use('/manage/active', manage_active);



// 用户相关
// app.use('/user/', users);
app.use('/user/', users);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
    //var err = new Error('Not Found');
    //err.status = 404;
    //next(err);
    res.render('404.ejs');
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
