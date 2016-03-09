var express = require('express'),
    mongo = require('mongodb'),
    router = express.Router(),
    init = require("../../server/init.js"),
    goBack = init.goBack,
    crypto = require('crypto'),
    ObjectId = mongo.ObjectID,
    config = require("../../server/config"),
    URL = require('url');


var active = require('./active.js');


/**
 * path:  /manage
 * 后台首页
 */
router.get('/', function(req, res) {
    var avtive = false,
        article = false;

    var pathname = URL.parse(req.originalUrl, true).pathname;
    // 请求活动数据
    getActiveList (req, res, {aStatus:{'$ne':'0'}}, {page:1, pagesize:5, pathname:pathname}, function(data) {
        avtive = data;
        gosend();
        return;
    });
    // 请求文章数据
    getArticleList (req, res, {type:1}, {page:1, pagesize:5, pathname:pathname}, function(data) {
        article = data;
        gosend();
        return;
    });

    function gosend() {
        if ( avtive && article ) {
            res.render('manages/index', {
                title: '后台首页调用活动模块',
                avtive:avtive,
                article:article
            });
        }
    };
});

/**
 * 获取列表内容
 * @param  {Object} o 限制条件
 * @param  {Object} pages 分页参数对象
 * @param  {Function} callback 回调函数
 * @return
 */
function getActiveList(req, res, o, pages, callback) {
    activeModel.getSort({
        key: "Active",
        body:o,// 筛选内容
        pages: pages,// 分页信息
        occupation: "aAddDate"// 排序字段
    }, function (err, data) {
        var channelCount = 0,
            joinCount = 0,
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
                    activeModel.getOne({
                        key: "Active_channel",
                        body: {
                            _id: data[i].aClass
                        }
                    }, function (err, channelData) {
                        if (err) {
                            res.send("服务器错误，请重试！");
                            return;
                        }

                        if (channelData && channelData.name) {
                            data[i].channel = channelData.name;
                            channelCount++;
                            gosend();
                            return;
                        }
                        res.send("未知错误，请重试！");
                    });

                    // 获取报名信息
                    activeModel.getAll({
                        key: "Active_join",
                        body: {
                            aid: data[i]._id
                        }
                    }, function (err, joins) {
                        if (err) {
                            res.send("服务器错误，请重试！");
                            return;
                        }

                        if (joins) {
                            data[i].joins = joins.length;
                            joinCount++
                            gosend();
                            return;
                        }
                        res.send("未知错误，请重试！");
                    });
                })(i);
            }

            // 获取总数【用于分页】
            activeModel.getAll({// 查询分类，为添加文章做准备
                key: "Active",
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
            activeModel.getAll({
                key: "Active_channel"
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
           if ( channelCount == data.length && joinCount == data.length && allCount >= 0 && channelItem ) {
                _page.sum = allCount;
                callback({
                    title: "精彩活动",
                    result: data,
                    channel: channelItem,
                    pages: _page
                })
           }
        };
    });
};

/**
 * 获取文章列表内容
 * @param  {Object} o 限制条件
 * @param  {Object} pages 分页参数对象
 * @param  {Function} callback 回调函数
 * @return
 */
function getArticleList(req, res, o, pages, callback) {
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
                callback({
                    title: "精彩文章",
                    result: data,
                    channel: channelItem,
                    pages: _page
                })
           }
        };
    });
};



/**
 * path:  /manage/addManage
 * 添加管理员
 */
router.get('/addManage', function(req, res) {
    var manageuser = req.session.manageuser;
    // 检测权限
    if (manageuser.rank > 0) {
        res.send("权限不足");
    }

    res.render('manages/user/user_create', {
        title: "添加管理员"
    });
});
// 修改和添加共用
router.post('/addManage', function(req, res) {
    var manageuser = req.session.manageuser;
    // 检测权限
    if (manageuser.rank > 0) {
        res.send("权限不足");
    }

    var username = req.body.username,
        password = req.body.password,
        passwordHash = crypto.createHash("sha1").update(new Buffer(password, "binary")).digest('hex'),
        rank = req.body.rank,
        lock = req.body.lock,
        lockHash = lock === "0" ? false : true,
        lockTime = lockHash ? (new Date()).getTime() : "",
        lockMessage = req.body.lockMessage,
        id = req.body.mid;

    if ( id ) {// 修改
        var setParam = {
                rank: rank,
                lock: lockHash,
                lockTime: lockTime,
                lockMessage : lockMessage
            };
        // 密码有值的时候才进行修改
        if ( password ) {
            setParam.password = passwordHash;
        };

        manageModel.update({
                _id: id
            }, {
            key: "Manage_user",
            body: setParam
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
        manageModel.getOne({
            key: "Manage_user",
            body: {
                username: username
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

            if (data && data.username) {
                res.send({
                    status: 200,
                    code: 0,
                    message: "该管理员已存在！"
                });
                return;
            }

            manageModel.save({
                key: "Manage_user",
                body: {
                    username: username,
                    password: passwordHash,
                    rank: rank,
                    // lastLoginIp: req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                    // lastLoginTime: (new Date()).getTime(),
                    lock: lockHash,
                    lockTime: lockTime,
                    lockMessage : lockMessage
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
 * path:  /manage/editManage/:id
 * 修改管理员
 */
router.get('/editManage/:id', function(req, res) {
    var manageuser = req.session.manageuser;
    // 检测权限
    if (manageuser.rank > 0) {
        res.send("权限不足");
    }

    var id = req.params.id;
    manageModel.getOne({
        key: "Manage_user",
        body: {
            _id: id
        }
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/user/user_edit', {
                title: "修改管理员",
                result: data
            });
            return;
        }

        res.send("未知错误，请重试！");

    });
});

/**
 * path:  /manage/delManage/:id
 * 删除管理员
 */
router.get('/delManage/:id', function(req, res) {
    var id = req.params.id;
    manageModel.remove({
        key: "Manage_user",
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
 * path:  /manage/manageUsers
 * 管理员列表
 */
router.get('/manageUsers', function(req, res) {
    var manageuser = req.session.manageuser;
    // 检测权限
    if (manageuser.rank > 0) {
        res.send("权限不足");
    }

    manageModel.getAll({
        key: "Manage_user"
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/user/user_list', {
                title: "管理员列表",
                result: data
            });
            return;
        }

        res.send("未知错误，请重试！");
    });
});


/**
 * path:  /manage/login
 * 后台登陆
 */
router.get('/login', function(req, res) {
    if (req.session.manageuser) { // 如果登录直接跳至管理首页
        res.redirect("/manage");
    }

    
    console.log(req.session.captcha);
    console.log(req.session.manageLoginIsShowCaptcha);
    // req.session.manageLoginIsShowCaptcha = 0;
    if ( req.session.manageLoginIsShowCaptcha && req.session.manageLoginIsShowCaptcha >= config.isShowCaptcha ) {// 显示验证码
        res.render('manages/login', {
            title: "后台登陆",
            captcha:true
        });
    } else {
        // 不显示验证码时需要清空验证码session
        req.session.captcha = null;
        res.render('manages/login', {
            title: "后台登陆"
        });
    }
});
router.post('/login', function(req, res) {
    "use strict";
    if (req.session.manageuser) {
        res.send({
            status: 403,
            code: 0,
            message: "请不要重复登录！"
        });
    }
    var username = req.body.username,
        password = req.body.password,
        code = req.body.code,
        hash = crypto.createHash("sha1").update(new Buffer(password, "binary")).digest('hex');

    // 验证码错误
    if ( req.session.manageLoginIsShowCaptcha >= config.isShowCaptcha ) {//需要检查验证码的正确性
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
    if ( req.session.manageLoginIsShowCaptcha ) {
        req.session.manageLoginIsShowCaptcha++;
    } else {
        req.session.manageLoginIsShowCaptcha = 1;
    }

    manageModel.getOne({
        key: "Manage_user",
        body: {
            username: username,
            password: hash
        }
    }, function (err, data) {

        // 通过验证请求时清空验证码session
        req.session.captcha = null;
        
        if (err) {
            res.send({
                status: 200,
                code: 0,
                message: "登录失败，服务器错误，请重试！"
            });
        }
        if (data && "username" in data) {
            // 检测是否被锁定
            if ( data.lock ) {
                res.send({
                    status: 200,
                    code: 0,
                    message: "登录失败，你的帐号被锁定！\r锁定原因：" +data.lockMessage+ "\r联系管理员：manage@wdshare.org"
                });
            } else {
                req.session.manageuser = data;

                // 更新最后登录日期和IP
                // console.log(req.session.user.email);
                manageModel.update({
                    username: username
                }, {
                    key: "Manage_user",
                    body: {
                        lastLoginIp: req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                        lastLoginTime: (new Date()).getTime()
                    }
                }, function (err, num, data) {});

                // 向页面输出信息
                res.send({
                    status: 200,
                    code: 1,
                    message: "登录成功！"
                });
            }            
        } else {
            res.send({
                status: 200,
                code: 0,
                message: "登录失败，用户或密码错误，请重试！"
            });
        }
    });
});
// 退出
router.get('/logout', function (req, res) {
    "use strict";
    if (req.session.manageuser) {
        req.session.manageuser = null;
    }
    res.redirect("/manage/login");
});





/**
 * path:  /manage/tags
 * 获取标签
 */
router.get('/tags', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getTagsList(req, res, {}, {page:page, pagesize:pagesize, pathname:pathname}, 'manages/tag/tag_list', "所有标签");
});
router.get('/tags/article', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getTagsList(req, res, {model:"article"}, {page:page, pagesize:pagesize, pathname:pathname}, 'manages/tag/tag_list', "文章标签");
});
router.get('/tags/member', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getTagsList(req, res, {model:"member"}, {page:page, pagesize:pagesize, pathname:pathname}, 'manages/tag/tag_list', "会员标签");
});

/**
 * 获取Tag列表内容
 * @param  {Object} o 限制条件
 * @param  {Object} pages 分页参数对象
 * @param  {String} mod 模板路径
 * @param  {String} channelName 分类名称
 * @return
 */
function getTagsList(req, res, o, pages, mod, channelName) {
    tagModel.getSort({
        key: "Tag",
        body:o,// 仅读取文章类型的档案
        pages:pages, // 分页信息
        occupation: "level"// 排序字段
    }, function (err, data) {
        var allCount;
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            // 获取总数【用于分页】
            tagModel.getAll({// 查询分类，为添加文章做准备
                key: "Tag",
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
            _page.sum = allCount;
            res.render(mod, {
                title: channelName || "所有标签",
                result: data,
                pages:_page
            });
        };
    });
};


/**
 * path:  /manage/tag/create
 * 添加标签
 */
router.get('/tag/create', function(req, res) {
    res.render('manages/tag/tag_create', {
        title: "添加标签"
    });
});
// 修改和添加共用
router.post('/tag/create', function(req, res) {
    var name = req.body.name,
        level = req.body.level,
        model = req.body.model,
        id = req.body.aid;

    if ( id ) {// 修改
        tagModel.update({
                _id: id
            }, {
            key: "Tag",
            body: {
                name: name,
                level: level,
                model: model,
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
        tagModel.getOne({
            key: "Tag",
            body: {
                name: name
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

            if (data && data.name) {
                res.send({
                    status: 200,
                    code: 0,
                    message: "标签已存在！"
                });
                return;
            }

            tagModel.save({
                key: "Tag",
                body: {
                    name: name,
                    level: level,
                    model: model,
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
 * path:  /manage/tag/edit/:id
 * 修改标签
 */
router.get('/tag/edit/:id', function(req, res) {
    var id = req.params.id;
    tagModel.getOne({
        key: "Tag",
        body: {
            _id: id
        }
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/tag/tag_edit', {
                title: "修改标签",
                result: data
            });
            return;
        }

        res.send("未知错误，请重试！");

    });
});

/**
 * path:  /manage/tag/del/:id
 * 删除标签
 */
router.get('/tag/del/:id', function(req, res) {
    var id = req.params.id;
    tagModel.remove({
        key: "Tag",
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
 * path:  /manage/importdata
 * 导入旧网站的活动报名数据
 */
router.get('/importdata', function(req, res) {
    var data = [],// 旧网站的活动报名数据写在这里
        count = 0,
        ok = 0,
        repeat = 0;

    for ( var i=0; i<data.length; i++ ) {
        var _data = data[i];
        _data.addDate = new Date(_data.addDate).getTime() + 1000*60*60*8
        save(req, res, _data);
    }


    // 保存报名信息
    function save(req, res, data) {
        activeModel.getOne({
            key: "Active_join",
            body: {
                aid: data.aid,
                mail: data.mail
            }
        }, function (err, join) {
            if (err) {
                res.send({
                    status: false,
                    msg: "查询失败！"
                });
            }
            if ( join && join.mail ) {
                count++;
                repeat++;
                send(req, res);
            } else {
                activeModel.save({
                    key: "Active_join",
                    body: {
                        aid: data.aid,
                        mail: data.mail,
                        name: data.name,
                        com: data.com,
                        web: data.web,
                        content: data.content,
                        chi: data.chi,
                        addDate: +data.addDate,
                        invite: +data.state > 1 ? 0 : 1,// 除了被屏蔽的人都认为被邀请了
                        state: +data.state,
                        code: "",
                        joinMailState: true,
                        inviteState: +data.state > 1 ? false : true// 除了被屏蔽的人都认为已发邀请函
                    }
                }, function (err, data) {

                    if (err) {
                        res.send({
                            status: false,
                            msg: "失败，请重来！"
                        });
                    }

                    count++;
                    ok++;
                    send(req, res);
                });
            }
        });
        
    }

    function send(req, res) {
        if ( count == data.length ) {
            res.send('共有数据 '+data.length+' 条，剔除重复的 '+repeat+' 条，成功导入 '+ok+' 条！');
        }
    };
});







module.exports = router;
