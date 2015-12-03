var express = require('express'),
    fs = require('fs'),
    path = require('path'),
    sendMail = require("../../server/sendMail.js"),
    router = express.Router(),
    init = require("../../server/init.js"),
    authorize = init.authorize,
    goBack = init.goBack,
    crypto = require('crypto'),
    moment = require("moment"),
    config = require("../../server/config"),
    URL = require('url');

/**
 * path:  /manage/article
 * 获取所有文章
 */
router.get('/', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;
    var pages = {page:page, pagesize:pagesize, pathname:pathname};
    getList (req, res, {type:1}, pages, 'manages/article/article_list');
});

/**
 * path:  /manage/article/notaudit
 * 获取所有未审核文章
 */
router.get('/notaudit', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;
    var pages = {page:page, pagesize:pagesize, pathname:pathname};
    getList (req, res, {type:1, audit:false}, pages, 'manages/article/article_list', "未审核文章");
});

/**
 * path:  /manage/article/channellist/:url
 * 获取单个分类文章
 */
router.get('/channellist/:url', function(req, res) {
    var url = req.params.url;
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;

    archiveModel.getOne({
        key: "Article_channel",
        body: {
            url: url
        }
    }, function (err, data) {
        if (err) {
            res.send("请求发生意外！");
        }
        
        if (data) {
            getList(req, res, {type:1, channelId:data._id}, {page:page, pagesize:pagesize, pathname:pathname}, 'manages/article/article_list', data.name);
            return false;
        }

        res.render('404');
    });
});

/**
 * 获取列表内容
 * @param  {Object} o 限制条件
 * @param  {Object} pages 分页参数对象
 * @param  {String} mod 模板路径
 * @param  {String} channelName 分类名称
 * @return
 */
function getList(req, res, o, pages, mod, channelName) {
    archiveModel.getSort({
        key: "Archive",
        body:o,// 仅读取文章类型的档案
        pages: pages,// 分页信息
        occupation: "addDate"// 排序字段
    }, function (err, data) {
        var channelCount = 0,
            userCount = 0,
            allCount,
            channelItem;
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
                            data[i].usermail = userData.email;
                        } else {
                            data[i].user = "";
                            data[i].usermail = "";
                        }
                        userCount++;
                        gosend();
                        return;
                    });
                })(i);
            }

            // 获取总数【用于分页】
            archiveModel.getAll({
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

            // 获取分类信息，列表页显示分类
            archiveModel.getAll({
                key: "Article_channel"
            }, function (err, data) {
                if (err) {
                    res.send("服务器错误，请重试！");
                    return;
                }

                if (data) {
                    channelItem = data;
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
           if ( channelCount == data.length && userCount == data.length && allCount >= 0 && channelItem ) {
                _page.sum = allCount;
                res.render(mod, {
                    title: channelName || "所有文章",
                    result: data,
                    channel: channelItem,
                    pages: _page
                });
           }
        };
    });
};


/**
 * path:  /manage/article/create
 * 添加文章
 */
router.get('/create', function(req, res) {
    archiveModel.getAll({// 查询分类，为添加文章做准备
        key: "Article_channel"
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/article/article_create', {
                title: "添加文章",
                result: data// 返回分类信息
            });
            return;
        }

        res.send("未知错误，请重试！");
    });
});
// 修改和添加共用
router.post('/create', function(req, res) {
    console.log(typeof req.body.diyType);
    var type = 1,// 数据模型：1为文章、2为项目、3为招聘
        title = req.body.title,
        linkUrl = req.body.linkUrl,
        cover = req.body.cover,
        channelId = req.body.channelId,
        tag = req.body.tag,
        source = req.body.source,
        sourceUrl = req.body.sourceUrl,
        email = req.body.email || "wdshare@163.com",// 没有填写用户时归入管理员名下
        content = req.body.content,
        diyType = req.body.diyType ? (typeof req.body.diyType == "string" ? req.body.diyType : req.body.diyType.join(",")) : "",// 1头条、2推荐、3加粗
        keywords = req.body.keywords,
        description = req.body.description,
        color = req.body.color,
        tpl = req.body.tpl,
        rank = req.body.rank,
        sortup = req.body.sortup == "1" ? true : false,
        click = req.body.click,
        zan = req.body.zan,
        notComment = req.body.notComment == "1" ? true : false,
        audit =  req.body.audit == "1" ? true : false,
        rejected = req.body.rejected,

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

    usersModel.getOne({
        key: "User",
        body: {
            email: email
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

        if (!data || !data.username) {
            res.send({
                status: 200,
                code: 0,
                message: "作者邮箱不是本站的会员，不能发布文章！"
            });
            return;
        }
        var userId = data._id;

        if ( id ) {// 修改
            archiveModel.update({
                    _id: id
                }, {
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
                    editDate: (new Date()).getTime(),
                    click: click,
                    userId: userId,
                    zan: zan,
                    notComment: notComment,
                    audit: audit,
                    rejected: rejected
                }
            }, function (err, data) {
                if (err) {
                    res.send({
                        status: 200,
                        code: 0,
                        message: err
                    });
                }
                
                res.send({
                    status: 200,
                    code: 1,
                    message: "修改成功！"
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
                
                res.send({
                    status: 200,
                    code: 1,
                    message: "添加成功！"
                });
            });
        }
        
    });
});
/**
 * path:  /manage/article/edit/:id
 * 修改文章
 */
router.get('/edit/:id', function(req, res) {
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

                if (aricle) {
                    usersModel.getOne({// 获取会员信息，以便显示会员邮箱
                        key: "User",
                        body: {
                            _id: aricle.userId
                        }
                    }, function (err, mamber) {
                        if (err) {
                            res.send("服务器错误，请重试！");
                            return;
                        }
                        res.render('manages/article/article_edit', {
                            title: "修改文章",
                            result: aricle,
                            channels: data,
                            mamber: mamber || {}
                        });
                        return;
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
 * path:  /manage/article/del/:id
 * 删除文章
 */
router.get('/del/:id', function(req, res) {
    var id = req.params.id;
    archiveModel.remove({
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

        if (data) {
            res.send({
                status: 200,
                code: 1,
                message: "删除成功！"
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
/**
 * path:  /manage/article/audit
 * 审核文章
 */
router.post('/audit', function(req, res) {
    var id = req.body.id,
        name = req.body.name,
        mail = req.body.mail,
        title = req.body.title;

    archiveModel.update({
            _id: id
        }, {
        key: "Archive",
        body: {
            audit: true,
            rejected: ""
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

        if (data) {
            // 除管理员外发送邮件通知
            if ( mail != "wdshare@163.com" ) {
                var _html = '亲爱的，'+ name +'：<br /><br />';
                _html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;恭喜！<br /><br />';
                _html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;你在WDShare发布的文章<b>《'+ title +'》</b>已通过审核，可以向朋友推荐你的文章了。<br /><br />'
                _html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;网址：<a href="'+ config.url + '/article/'+ id +'">'+ config.url + '/article/'+ id +'</a><br />';
                _html += '<br /><br /><br /><br /><br /><br /><br /><br /><span style="color:#666;">WDShare筹委会<br />官网：<a href="http://www.wdshare.org/" target="_blank" style="color:#666;">http://www.wdshare.org</a><br />系统邮件，无需回复。 &nbsp;&nbsp;&nbsp; 联系我们：wdshare@163.com</span><br />';
                sendMail({
                    from: config.mail.sendMail,
                    to: mail,
                    subject: 'WDShare 文章审核成功通知',
                    html: _html
                });
            }
            res.send({
                status: 200,
                code: 1,
                message: "审核成功！"
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

/**
 * path:  /manage/article/noaudit
 * 文章驳回审核
 */
router.post('/noaudit', function(req, res) {
    var id = req.body.id,
        name = req.body.name,
        mail = req.body.mail,
        title = req.body.title,
        msg = req.body.msg;
    archiveModel.update({
            _id: id
        }, {
        key: "Archive",
        body: {
            rejected: msg,
            rejectedData: (new Date()).getTime()
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

        if (data) {
            // 除管理员外发送邮件通知
            if ( mail != "wdshare@163.com" ) {
                var _html = '亲爱的，'+ name +'：<br /><br />';
                _html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;很抱歉的通知你，文章审核失败！<br /><br />';
                _html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;你在WDShare发布的文章<b>《'+ title +'》</b>审核失败的原因如下：<br /><br />'
                _html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+ msg +'<br /><br />';
                _html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;请在会员中心修改文章内容，系统会自动帮您提审。<br />';
                _html += '<br /><br /><br /><br /><br /><br /><br /><br /><span style="color:#666;">WDShare筹委会<br />官网：<a href="http://www.wdshare.org/" target="_blank" style="color:#666;">http://www.wdshare.org</a><br />系统邮件，无需回复。 &nbsp;&nbsp;&nbsp; 联系我们：wdshare@163.com</span><br />';
                sendMail({
                    from: config.mail.sendMail,
                    to: mail,
                    subject: 'WDShare 文章审核 失败 通知',
                    html: _html
                });
            }

            res.send({
                status: 200,
                code: 1,
                message: "驳回处理完成！"
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


/**
 * path:  /manage/article/channel
 * 获取文章分类
 */
router.get('/channel', function(req, res) {
    archiveModel.getAll({
        key: "Article_channel"
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/article/article_channel_list', {
                title: "文章分类",
                result: data
            });
            return;
        }

        res.send("未知错误，请重试！");
    });
});

/**
 * path:  /manage/article/channel/create
 * 添加文章分类
 */
router.get('/channel/create', function(req, res) {
    archiveModel.getAll({
        key: "Article_channel"
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/article/article_channel_create', {
                title: "添加文章分类",
                result: data
            });
            return;
        }

        res.send("未知错误，请重试！");
    });
});
// 修改和添加共用
router.post('/channel/create', function(req, res) {
    var name = req.body.name,
        url = req.body.url,
        parent = req.body.parent,
        end_tpl = req.body.end_tpl,
        keywords = req.body.keywords,
        description = req.body.description,
        id = req.body.aid;

    if ( id ) {// 修改
        archiveModel.update({
                _id: id
            }, {
            key: "Article_channel",
            body: {
                name: name,
                parent: parent,
                end_tpl: end_tpl,
                keywords: keywords,
                description: description,
                editDate: (new Date()).getTime()
            }
        }, function (err, data) {
            if (err) {
                res.send({
                    status: 200,
                    code: 0,
                    message: err
                });
            }
            
            res.send({
                status: 200,
                code: 1,
                message: "修改成功！"
            });
        });
    } else {// 添加
        archiveModel.getOne({
            key: "Article_channel",
            body: {
                url: url
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

            if (data && data.url) {
                res.send({
                    status: 200,
                    code: 0,
                    message: "URL标识已存在！"
                });
                return;
            }

            archiveModel.save({
                key: "Article_channel",
                body: {
                    name: name,
                    url: url,
                    parent: parent,
                    end_tpl: end_tpl,
                    keywords: keywords,
                    description: description,
                    addDate: (new Date()).getTime(),
                    editDate: (new Date()).getTime()
                }
            }, function (err, data) {
                if (err) {
                    res.send({
                        status: 200,
                        code: 0,
                        message: err
                    });
                }
                
                res.send({
                    status: 200,
                    code: 1,
                    message: "添加成功！"
                });
            });
            
        });
    }
});

/**
 * path:  /manage/article/channel/edit/:id
 * 修改文章分类
 */
router.get('/channel/edit/:id', function(req, res) {
    var id = req.params.id;
    archiveModel.getOne({
        key: "Article_channel",
        body: {
            _id: id
        }
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/article/article_channel_edit', {
                title: "修改文章分类",
                result: data
            });
            return;
        }

        res.send("未知错误，请重试！");

    });
});

/**
 * path:  /manage/article/channel/del/:id
 * 删除文章分类
 */
router.get('/channel/del/:id', function(req, res) {
    var id = req.params.id;
    archiveModel.remove({
        key: "Article_channel",
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

        if (data) {
            res.send({
                status: 200,
                code: 1,
                message: "删除成功！"
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
