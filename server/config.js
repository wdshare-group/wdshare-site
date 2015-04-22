var config = {
    "url":"http://wdshare.com",
    "socketIO" : "http://wdshare.com",
    "title":"wdshare",  //网站名称
    "description":"为新而生 新一代极简论坛系统",  //网站描述
    "changeTimes":3,     // 可以更改邮箱次数
    "activeDuration":5,  // 获取激活邮件的间隔时间，分钟
    "favicon":"o.ico",   //网站小图标
    "logo":"/images/logo.png",   //网站Logo
    "theme":"default",
    "itemsPerPage":10,   //每页显示多少条
    "cookieParser":"wdshare",  //cookie 加密字符串
    "cookieSession":{          //session 加密字符串
        key:'wdshare',
        secret: 'wdshare',
        name  :'wdshare',
        cookie: { path: '/', httpOnly: true, maxAge: null }
    },
    "mail":{
        "sendMail":"no-reply@ospring.pw",
        "service":"Mailgun",
        "user":"postmaster@koajs.cn",
        "pass":"4-kx7d3lgtd2"
    },
    "db":"wdshare",
    "locale":"zh-cn"
};

module.exports = config;