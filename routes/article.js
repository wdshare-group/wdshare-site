var express = require('express'),
    fs = require('fs'),
    path = require('path'),
    sendMail = require("../server/sendMail.js"),
    router = express.Router(),
    init = require("../server/init.js"),
    authorize = init.authorize,
    goBack = init.goBack,
    crypto = require('crypto'),
    moment = require("moment"),
    config = require("../server/config"),
    URL = require('url');

/**
 * path:  /article
 * 获取所有文章
 */
router.get('/', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;
    getList (req, res, {type:1, audit:true}, {page:page, pagesize:pagesize, pathname:pathname}, 'article/article_list');
});

/**
 * 获取列表内容
 * @param  {Object} o 限制条件
 * @param  {Object} pages 分页参数对象
 * @param  {String} mod 模板路径
 * @param  {String} channelName 分类名称
 * @param  {String} channelKeywords 分类关键字
 * @param  {String} channelDescription 分类描述
 * @return
 */
function getList(req, res, o, pages, mod, channelName, channelKeywords, channelDescription) {
    archiveModel.getSort({
        key: "Archive",
        body:o,// 仅读取文章类型的档案
        pages:pages, // 分页信息
        occupation: "addDate"// 排序字段
    }, function (err, data) {
        var channelCount = 0,
            userCount = 0,
            allCount;
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            for ( var i=0; i<data.length; i++ ) {
                (function(i) {
                    // 获取分类信息
                    archiveModel.getOne({
                        key: "Article_channel",
                        body: {
                            _id: data[i].channelId
                        }
                    }, function (err, channelData) {
                        if (err) {
                            res.send("服务器错误，请重试！");
                            return;
                        }

                        if (channelData && channelData.name) {
                            // console.log(channelData.name);
                            data[i].channel = channelData.name;
                            data[i].channelUrl = channelData.url;
                            channelCount++;
                            gosend();
                            return;
                        }
                        res.send("未知错误，请重试！");
                    });

                    // 获取会员信息
                    usersModel.getOne({
                        key: "User",
                        body: {
                            _id: data[i].userId
                        }
                    }, function (err, userData) {
                        if (err) {
                            res.send("服务器错误，请重试！");
                            return;
                        }

                        if (userData) {
                            data[i].user = userData.username;
                            data[i].userId = userData._id;
                        } else {
                            data[i].user = "";
                            data[i].userId = "";
                        }
                        userCount++;
                        gosend();
                        return;
                    });
                })(i);
            }

            // 获取总数【用于分页】
            archiveModel.getAll({// 查询分类，为添加文章做准备
                key: "Archive",
                body: o
            }, function (err, data) {
                if (err) {
                    res.send("服务器错误，请重试！");
                    return;
                }

                if (data) {
                    allCount = data.length;
                    gosend();
                    return;
                }

                res.send("未知错误，请重试！");
            });            

            return;
        }

        res.send("未知错误，请重试！");

        // 所有数据都获取完成后执行返回
        function gosend() {
           var _page = pages;
           if ( channelCount == data.length && userCount == data.length && allCount >= 0 ) {
                _page.sum = allCount;
                res.render(mod, {
                    title: channelName || "精彩文章",
                    result: data,
                    pages:_page,
                    keywords: channelKeywords,
                    description: channelDescription
                });
           }
        };
    });
};

/**
 * path:  /article/create
 * 添加文章
 */
router.get('/create', function(req, res) {
    "use strict";
    if (!req.session.user) {
        res.redirect("/user/login");
        return false;
    }
    // 未激活用户不允许进入
    if (!req.session.user.isActive) {
        res.redirect("/user/activeAccount");
        return false;
    }

    // 先看信息是否完整
    usersInfosModel.getOne({
        key: "User_info",
        body: {
            userid: req.session.user._id
        }
    }, function (err, data) {
        if (err || !data) {
            res.render('users/empty', {title:'发布文章提示', content:'先完善信息后才有权限添加文章。<br /><a href="/user/editInfo">点击完善信息</a>'});
        }
        
        archiveModel.getAll({// 查询分类，为添加文章做准备
            key: "Article_channel"
        }, function (err, data) {
            if (err) {
                res.send("服务器错误，请重试！");
                return;
            }

            if (data) {
                
                console.log(req.session.captcha);
                console.log(req.session.addArticleIsShowCaptcha);
                // req.session.addArticleIsShowCaptcha = 2;
                if ( req.session.addArticleIsShowCaptcha && req.session.addArticleIsShowCaptcha >= config.isShowCaptcha ) {// 显示验证码
                    res.render('article/article_create', {
                        title: "添加文章",
                        captcha:true,
                        result: data// 返回分类信息
                    });
                } else {
                    // 不显示验证码时需要清空验证码session
                    req.session.captcha = null;
                    res.render('article/article_create', {
                        title: "添加文章",
                        result: data// 返回分类信息
                    });
                }
                return;
            }

            res.send("未知错误，请重试！");
        });
    });
});
// 修改和添加共用
router.post('/create', function(req, res) {
    var code = req.body.code;

    if (!req.session.user) {
        res.redirect("/user/login");
        return false;
    }
    // 未激活用户不允许进入
    if (!req.session.user.isActive) {
        res.redirect("/user/activeAccount");
        return false;
    }

    // 验证码错误
    if ( req.session.addArticleIsShowCaptcha >= config.isShowCaptcha ) {//需要检查验证码的正确性
        if ( !code ) {
            res.send({
                status: 200,
                code: 0,
                message: "请输入验证码！",
                reload: true
            });
            return false;
        }
        if ( !req.session.captcha ) {
            res.send({
                status: 200,
                code: 0,
                message: "系统出现异常，请稍后再试！"
            });
            return false;
        }
        if (code.toUpperCase() != req.session.captcha.toUpperCase() ) {
            res.send({
                status: 200,
                code: 0,
                message: "验证码错误，请重试！"
            });
            return false;
        }
    }

    // 记录该用户登录的次数
    if ( req.session.addArticleIsShowCaptcha ) {
        req.session.addArticleIsShowCaptcha++;
    } else {
        req.session.addArticleIsShowCaptcha = 1;
    }

    usersModel.getOne({
        key: "User",
        body: {
            _id: req.session.user._id
        }
    }, function (err, member) {
        
        // 通过验证请求时清空验证码session
        req.session.captcha = null;

        if (err || !member) {
            res.send({
                status: 200,
                code: 0,
                message: "会员账户发生故障！"
            });
        } else {
            if ( member.lock ) {// 被锁定账号发布文章时强退
                req.session.user = null;
                res.send({
                    status: 200,
                    code: 0,
                    message: "该账户被锁定！\n\n原因：" + member.lockMessage + "\n\n请联系管理员开通帐号，邮箱：wdshare@163.com"
                });
                return;
            }

            action();
        }
    });

    function action() {
        var type = 1,// 数据模型：1为文章、2为项目、3为招聘
            title = req.body.title,
            linkUrl = req.body.linkUrl,
            cover = "",
            channelId = req.body.channelId,
            tag = req.body.tag,
            source = req.body.source,
            sourceUrl = req.body.sourceUrl,
            userId = req.session.user._id,
            content = req.body.content,
            diyType = "",// 1头条、2推荐、3加粗
            keywords = req.body.keywords,
            description = req.body.description,
            color = "",
            tpl = "",
            rank = 0,
            sortup = false,
            click = 0,
            zan = 0,
            notComment = true,
            audit = false,

            id = req.body.aid;

        if ( !title || !channelId ) {
            res.send({
                status: 200,
                code: 0,
                message: "文章标题、归属栏目必须填写"
            });
        }
        if ( !linkUrl && !content ) {
            res.send({
                status: 200,
                code: 0,
                message: "文章内容必须填写"
            });
        }

        if ( linkUrl == "http://" ) {
            linkUrl = "";
        }
        if ( sourceUrl == "http://" ) {
            sourceUrl = "";
        }

        if ( id ) {// 修改
            archiveModel.update({
                    _id: id
                }, {
                key: "Archive",
                body: {
                    channelId:channelId,
                    title: title,
                    linkUrl: linkUrl,
                    content: content,
                    keywords: keywords,
                    description: description,
                    tag: tag,
                    source: source,
                    sourceUrl: sourceUrl,
                    editDate: (new Date()).getTime(),
                    audit: audit,
                    rejected: ""
                }
            }, function (err, data) {
                if (err) {
                    res.send({
                        status: 200,
                        code: 0,
                        message: err
                    });
                }
                // 发送邮件通知管理员
                sendArticleChangeMail(req, res, "修改", title);
                res.send({
                    status: 200,
                    code: 1,
                    message: "修改成功！文章进入审核状态，审核后显示在官网"
                });
            });
        } else {// 添加
            archiveModel.save({
                key: "Archive",
                body: {
                    type: type,
                    channelId:channelId,
                    title: title,
                    linkUrl: linkUrl,
                    diyType: diyType,
                    color: color,
                    cover: cover,
                    content: content,
                    keywords: keywords,
                    description: description,
                    tpl: tpl,
                    tag: tag,
                    source: source,
                    sourceUrl: sourceUrl,
                    rank: rank,
                    sortup: sortup,
                    addDate: (new Date()).getTime(),
                    editDate: (new Date()).getTime(),
                    click: click,
                    userId: userId,
                    zan: zan,
                    notComment: notComment,
                    audit: audit
                }
            }, function (err, data) {
                if (err) {
                    res.send({
                        status: 200,
                        code: 0,
                        message: err
                    });
                }
                // 发送邮件通知管理员
                sendArticleChangeMail(req, res, "添加", title);
                res.send({
                    status: 200,
                    code: 1,
                    message: "添加成功！审核后才会出现在官网"
                });
            });
        }
    };
    
});
/**
 * path:  /article/edit/:id
 * 修改文章
 */
router.get('/edit/:id', function(req, res) {
    if (!req.session.user) {
        res.redirect("/user/login");
        return false;
    }
    // 未激活用户不允许进入
    if (!req.session.user.isActive) {
        res.redirect("/user/activeAccount");
        return false;
    }
    var id = req.params.id;
    archiveModel.getAll({// 查询分类，为修改文章做准备
        key: "Article_channel"
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }
        if (data) {
            archiveModel.getOne({// 读取文章信息
                key: "Archive",
                body: {
                    _id: id
                }
            }, function (err, aricle) {
                if (err) {
                    res.send("服务器错误，请重试！");
                    return;
                }

                // 不是自己的文章不能编辑
                if (aricle && aricle.userId == req.session.user._id) {
                    console.log(req.session.captcha);
                    console.log(req.session.addArticleIsShowCaptcha);
                    // req.session.addArticleIsShowCaptcha = 0;
                    if ( req.session.addArticleIsShowCaptcha && req.session.addArticleIsShowCaptcha >= config.isShowCaptcha ) {// 显示验证码
                        res.render('article/article_edit', {
                            title: "修改文章",
                            captcha:true,
                            result: aricle,
                            channels: data
                        });
                    } else {
                        // 不显示验证码时需要清空验证码session
                        req.session.captcha = null;
                        res.render('article/article_edit', {
                            title: "修改文章",
                            result: aricle,
                            channels: data
                        });
                    }
                    return;
                } else {
                    res.render('article/article_edit', {
                        title: "修改文章",
                        error: "权限不足或其他错误"
                    });
                    return;
                }
                res.send("未知错误，请重试！");
            });
            return;
        }
        res.send("未知错误，请重试！");
    });
});
/**
 * 文章被添加或修改后邮件通知管理员
 * @param  {String} user  会员昵称
 * @param  {String} state 修改还是添加
 * @param  {String} title 文章标题
 * @return
 */
function sendArticleChangeMail(req, res, state, title) {
    sendMail({
        from: config.mail.sendMail,
        to: "wdshare@163.com",//需要通知的管理员邮箱
        subject: "[需审批]"+req.session.user.username +" "+ state +" 《"+ title +"》",
        html: '管理员，你好：<br /> 会员【' + req.session.user.username + "】 刚才 " + state +"了 《"+ title +"》，请尽快进行审批。"
    });
};

/**
 * path:  /article/:id
 * 文章终极页及分类列表
 */
router.get('/:id', function(req, res) {
    var id = req.params.id,
        article,
        mamber,
        channel,
        tpl = "article_end";// 默认模板
    archiveModel.getOne({// 读取终极页信息
        key: "Archive",
        body: {
            _id: id
        }
    }, function (err, data) {
        if (err) {// 没有查询到文章时查询分类
            getChannelList(id);
            // res.send("参数错误，请重试！");
            return;
        }

        if (data) {
            article = data;
            getUser();
            getChannel();
            return;
        }

        res.send("获取文章信息时未知错误，请重试！");
    });
    // 获取作者信息
    function getUser() {
        usersModel.getOne({// 读取作者信息
            key: "User",
            body: {
                _id: article.userId
            }
        }, function (err, data) {
            if (err) {
                res.send("服务器错误，请重试！");
                return;
            }

            if (data) {
                mamber = data; 
            } else {// 用户被删掉了
                mamber = {}
            }
            send();
            return;
        });
    };
    // 获取分类信息
    function getChannel() {
        archiveModel.getOne({// 读取分类
            key: "Article_channel",
            body: {
                _id: article.channelId
            }
        }, function (err, data) {
            if (err) {
                res.send("服务器错误，请重试！");
                return;
            }

            if (data) {
                channel = data;
                send();
                return;
            }

            res.send("获取分类时未知错误，请重试！");
        });
    };
    // 返回信息
    function send() {
        if ( article && mamber && channel ) {
            // 未审核文章被非发布者浏览时【后台管理员例外】
            if ( !article.audit && (!req.session.user || req.session.user._id != mamber._id) && !req.session.manageuser ) {
                res.render('article/error', {
                    title: "错误提示",
                    msg: "该文章未审核，请稍后进行浏览！"
                });
                return;
            }

            if ( channel.end_tpl ) {// 分类有指定模板时设置分类模板【优先于默认模板】
                tpl = channel.end_tpl;
            }
            if ( article.tpl ) {// 终极页有指定模板时设置终极页模板【优先于分类模板】
                tpl = article.tpl;
            }

            if ( !article.linkUrl ) {// 没有外链时返回文章信息
                res.render('article/'+tpl, {
                    title: "文章终极页",
                    article: article,
                    member: mamber,
                    channel: channel
                });
            };

            // 记录点击
            archiveModel.update({
                    _id: id
                }, {
                key: "Archive",
                body: {
                    click: article.click + 1
                }
            }, function (err, data) {
                // 有外链时进行跳转
                if ( article.linkUrl ) {
                    res.redirect(article.linkUrl);
                }
            });
        }
        return;
    };


    // 列表信息
    /**
     * 获取分类列表
     * @return
     */
    function getChannelList() {
        var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;

        archiveModel.getOne({
            key: "Article_channel",
            body: {
                url: id
            }
        }, function (err, data) {
            if (err) {
                res.send("请求发生意外！");
            }
            // console.log(data);
            if (data) {
                getList(req, res, {type:1, audit:true, channelId:data._id}, {page:page, pagesize:pagesize, pathname:pathname}, 'article/article_list', data.name, data.keywords, data.description);
                return false;
            }

            res.render('404');
        });
    };
});

// 文章点赞功能
router.get('/setzan/:id', function(req, res) {
    var id = req.params.id,
        referer = req.headers['referer'];

    // 利用referer来检测是不是从本站来的点赞
    if ( !referer || referer.indexOf("/article/"+id) < 0 ) {
        res.send("哥！别闹，服务器太差，经不起您折腾");
        return false;
    }
    archiveModel.getOne({// 查询当前赞
        key: "Archive",
        body: {
            _id: id
        }
    }, function (err, data) {
        if (err) {
            res.send({
                status: 200,
                code: 0,
                message: "服务器错误，请重试！"
            });
            return;
        }

        if (data && data.zan) {
            // 增加文章点赞
            var newzan = parseInt(data.zan) + 1;
            archiveModel.update({
                    _id: id
                }, {
                key: "Archive",
                body: {
                    zan: newzan
                }
            }, function (err, __data) {
                if (err) {
                    res.send({
                        status: 200,
                        code: 0,
                        message: "服务器错误，请重试！"
                    });
                    return;
                }

                // 写入会员收集赞
                // 先查询会员现有赞
                usersInfosModel.getOne({
                    key: "User_info",
                    body: {
                        userid: data.userId
                    }
                }, function (err, userData) {
                    if (err) {
                        res.send({
                            status: 200,
                            code: 0,
                            message: "服务器错误，请重试！"
                        });
                        return;
                    }
                    var newzan = parseInt(userData.zan || 0) + 1;
                    console.log("zan:"+newzan);
                    // 再写入会员收集赞
                    usersInfosModel.update({
                            userid: data.userId
                        }, {
                        key: "User_info",
                        body: {
                            zan: newzan
                        }
                    }, function (err, __data) {
                        res.send({
                            status: 200,
                            code: 1,
                            message: "点赞成功！"
                        });
                    });
                });
                
            });
            return;
        }

        res.send({
            status: 200,
            code: 0,
            message: "未知错误，请重试！"
        });
    });
});


module.exports = router;
