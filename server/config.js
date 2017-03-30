var config = {
    "url":" http://127.0.0.1:3000",
    "socketIO" : "http://127.0.0.1:3000",
    "db": "******", // 数据库名称
    "dbUser": "******", // 数据库用户
    "dbPass": "******", // 数据库用户密码
    "locale": "zh-cn",
    "title": "WDShare",  //网站名称
    "description": "WDShare 为西安前端行业发展提供动力",  //网站描述
    "activeDuration": 5,  // 获取激活邮件的间隔时间，分钟
    "isShowCaptcha": 3,   //请求多少次以后显示验证码【小瑕疵：由于前台不能随意刷新，所以只有在第四次请求发现无验证码时才给刷新，所以第四次请求肯定是不能通过的】
    "isComment": true, // 是否允许评论 true 允许  false 不允许
    "commentDuration": 0.5, // 发表评论的间隔时间，分钟
    "commentMax": 500, // 评论内容最大字符数【多少个文字】
    "cookieParser": "wdshare",  //cookie 加密字符串
    "cookieSession": {          //session 加密字符串
        key: 'wdshare',
        secret: 'wdshare',
        name  :'wdshare',
        cookie: { path: '/', httpOnly: true, maxAge: null }
    },
    "mail":{
        "sendMail": "sent@wdshare.org",
        "service": "qq",
        "user": "sent@wdshare.org",
        "pass": "******"
    },
    // "mail": {
    //     "sendMail":"wdshare_sent@163.com",
    //     "service":"163",
    //     "user":"wdshare_sent@163.com",
    //     "pass":"vqjcadvqbnszanrg"
    // },
    "mailSignature": '<p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>微信：@wdshare</p><p>微博：@西安前端交流会</p><p>官网：<a href="http://www.wdshare.org" target="_blank">http://www.wdshare.org</a></p><p>联系我们：manage@wdshare.org</p><p>WDShare.org 2017 期待与您共同成长，为西安前端行业发展努力。</p><p style="color:#777777">(此信件为系统自动发送，无需回复）</p>',// 邮件签名
    "nullWordsCommon": ['<', '操你妈', '淫荡', '卖淫', '嫖娼', '强奸', '麻醉药', '麻醉乙醚', '出售假币', '麻醉钢枪', '蒙汗药'],// 被屏蔽的非法词汇--除用户昵称外的所有表单
    "nullWordsCommonHTML": ['操你妈', '淫荡', '卖淫', '嫖娼', '强奸', '麻醉药', '麻醉乙醚', '出售假币', '麻醉钢枪', '蒙汗药'],// 允许输入html的字段使用，被屏蔽的非法词汇--除用户昵称外的所有表单
    "nullWordsNickname": ['<', '>','admin', 'manage'],// 被屏蔽的非法词汇--用户昵称


    "static_path": "/static/skin2015"// 可以不带结束/斜杠［暂时没用］
};

module.exports = config;