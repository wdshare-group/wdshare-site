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
var article = require('./routes/article');
var other = require('./routes/other');
var captcha = require('./routes/captcha');// 验证码
var comment = require('./routes/comment');
var tags = require('./routes/tags');
var donation = require('./routes/donation');

var app = express();

// 会员数据模型
var Users     = require('./model/users.js');
var usersModel     = new Users();
// 会员信息数据模型
var UserInfos     = require('./model/user_infos.js');
var usersInfosModel     = new UserInfos();
// 所有档案相关数据模型
var Archives     = require('./model/archives.js');
var archiveModel     = new Archives();
// 活动相关数据模型
var Actives     = require('./model/new_actives.js');
var activeModel     = new Actives();
// 评论相关数据模型
var Comment     = require('./model/comment.js');
var commentModel     = new Comment();
// 标签数据模型
var Tags_mode     = require('./model/tags.js');
var tagModel     = new Tags_mode();
// 捐赠数据模型
var Donation_mode     = require('./model/donation.js');
var donationModel     = new Donation_mode();
// 后台数据模型
var Manage_mode     = require('./manage/model/manage.js');
var manageModel     = new Manage_mode();

var moment    = require('moment');



// 数据库连接，其他页面只需要引用mongooose操作，无需connect链接
var mongoose = require('mongoose'),
    dataBase = require("./server/config.js").db;
mongoose.connect('mongodb://localhost/'+dataBase);
global.mongoose = mongoose;


app.locals.moment     = moment;
app.locals.session    = {};
global.moment   = app.locals.moment   = moment;
global.usersModel = usersModel;
global.usersInfosModel = usersInfosModel;
global.archiveModel = archiveModel;
global.activeModel = activeModel;
global.manageModel = manageModel;
global.commentModel = commentModel;
global.tagModel = tagModel;
global.donationModel = donationModel;


global.siteDir = __dirname;
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
    res.locals.manageuser = req.session.manageuser;
    res.locals.captcha = req.session.captcha;// 验证码
    next();
});


// 首页
app.use('/', index);
// 活动
app.use('/active', active);
// 文章
app.use('/article', article);
// 用户
app.use('/user/', users);
// 验证码
app.use('/captcha/', captcha);
// 验证码
app.use('/comment/', comment);
// 标签
app.use('/tags/', tags);
// 捐赠
app.use('/donation/', donation);


/**
 * 管理后台相关
 */
// 后台登录拦截器
app.use(function (req, res, next) {
    var url = req.originalUrl;
    if (url != "/manage/login" && url.indexOf("/manage") > -1 && !req.session.manageuser) {
        return res.redirect("/manage/login");
    }
    next();
});

var manage = require('./manage/routes/index');
var manage_active = require('./manage/routes/active');
var manage_article = require('./manage/routes/article');
var manage_articleCrumbs = require('./manage/routes/articleCrumbs');
var manage_member = require('./manage/routes/member');
var manage_comment = require('./manage/routes/comment');
var manage_donation = require('./manage/routes/donation');

// 后台首页
app.use('/manage/', manage);
// 活动管理
app.use('/manage/active', manage_active);
// 文章管理
app.use('/manage/article', manage_article);
// 单页面管理
app.use('/manage/articleCrumbs', manage_articleCrumbs);
// 会员管理
app.use('/manage/member', manage_member);
// 评论管理
app.use('/manage/comment', manage_comment);
// 捐赠管理
app.use('/manage/donation', manage_donation);


// ueditor相关
var ueditor = require('ueditor-nodejs');
app.use('/static/ueditor/ue', ueditor({//这里的/ueditor/ue是因为文件件重命名为了ueditor,如果没改名，那么应该是/ueditor版本号/ue
    // configFile: '/static/ueditor/php/config.json',//如果下载的是jsp的，就填写/ueditor/jsp/config.json
    configFile: '/static/ueditor/config.json',//如果下载的是jsp的，就填写/ueditor/jsp/config.json
    mode: 'local', //本地存储填写local
    accessKey: 'Adxxxxxxx',//本地存储不填写，bcs填写
    secrectKey: 'oiUqt1VpH3fdxxxx',//本地存储不填写，bcs填写
    staticPath: path.join(__dirname, 'public'), //一般固定的写法，静态资源的目录，如果是bcs，可以不填
    // dynamicPath: '/upload' //动态目录，以/开头，bcs填写buckect名字，开头没有/.路径可以根据req动态变化，可以是一个函数，function(req) { return '/xx'} req.query.action是请求的行为，uploadimage表示上传图片，具体查看config.json.
    dynamicPath: function (req) {
        /**
         * 会员用自己ID的图片上传目录，管理员用images
         */
        // 管理员
        if (req.session.manageuser) {//如果是管理员
            return '/upload/images';
        }

        // 会员
        if (req.session.user) {//如果是会员
            return '/upload/'+ req.session.user._id;
        }
    }
}));



// Other url
app.use('/:id', function(req, res, next) {
    other.url(req, res, next);
});




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