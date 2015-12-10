var config = {
    "url":"http://127.0.0.1:3000",
    "socketIO" : "http://127.0.0.1:3000",
    "title":"WDShare",  //网站名称
    "description":"WDShare 为西安前端行业发展提供动力",  //网站描述
    "activeDuration":5,  // 获取激活邮件的间隔时间，分钟
    "favicon":"o.ico",   //网站小图标
    "isShowCaptcha":3,   //请求多少次以后显示验证码【小瑕疵：由于前台不能随意刷新，所以只有在第四次请求发现无验证码时才给刷新，所以第四次请求肯定是不能通过的】
    "itemsPerPage":10,   //每页显示多少条【暂时没用】
    "cookieParser":"wdshare",  //cookie 加密字符串
    "cookieSession":{          //session 加密字符串
        key:'wdshare',
        secret: 'wdshare',
        name  :'wdshare',
        cookie: { path: '/', httpOnly: true, maxAge: null }
    },
    "mail":{
        "sendMail":"wdshare_sent@163.com",
        "service":"163",
        "user":"wdshare_sent@163.com",
        "pass":"zfadrfpnyqiuypbx"
    },
    // "mail":{
    //     "sendMail":"no-reply@ospring.pw",
    //     "service":"Mailgun",
    //     "user":"postmaster@koajs.cn",
    //     "pass":"4-kx7d3lgtd2"
    // },
    "mailSignature":'<p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>微信：@wdshare</p><p>微博：@西安前端交流会</p><p>官网：<a href="http://www.wdshare.org" target="_blank">http://www.wdshare.org</a></p><p>联系我们：wdshare@163.com</p><p>WDShare.org 2016 期待与您共同成长，为西安前端行业发展努力。</p><p style="color:#777777">(此信件为系统自动发送，无需回复）</p>',// 邮件签名
    "db":"wdshare",
    "locale":"zh-cn",


    "static_path": "/static/skin2015"// 可以不带结束/斜杠
};

module.exports = config;