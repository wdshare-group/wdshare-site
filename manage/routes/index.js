var express = require('express'),
    mongo = require('mongodb'),
    acCon = require('../model/active.js'),
    router = express.Router(),
    init = require("../../server/init.js"),
    goBack = init.goBack,
    crypto = require('crypto'),
    ObjectId = mongo.ObjectID,
    config = require("../../server/config");


var active = require('./active.js');


/**
 * path:  /manage
 * 后台首页
 */
router.get('/', function(req, res) {
    acCon.find({}).then(function(result){
        getJoin(result);
    },function(err){
        res.render('active/502', { title: '出错啦',error:err});
    })

    function getJoin(result) {
        var yes = 0,
            no = 0,
            max = result.length,
            joinLength = {};
        for (var i=0; i<max; i++) {
            (function() {
                var active = result[i],
                    aId = ""+active._id;
                // 获取报名信息
                acCon.findJoin({aid:aId}).then(function(data) {
                    joinLength[aId] = data.length;
                    yes++;
                    joinCallback();
                }, function(err) {
                    joinLength[aId] = "undefied";
                    no++;
                    joinCallback();
                })
            })(i);
            
        }

        function joinCallback() {
            if ( yes + no == max ) {
                res.render('manages/index', {
                    title: '后台首页调用活动模块',
                    result:result,
                    joinLength:joinLength
                });
            }
        };
        
    }

});


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

    res.render('manages/login', {
        title: "后台登陆"
    });
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
        hash = crypto.createHash("sha1").update(new Buffer(password, "binary")).digest('hex');

    manageModel.getOne({
        key: "Manage_user",
        body: {
            username: username,
            password: hash
        }
    }, function (err, data) {

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
                    message: "登录失败，你的帐号被锁定！\r锁定原因：" +data.lockMessage+ "\r联系管理员：wdshare@163.com"
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
    manageModel.getAll({
        key: "Tag"
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/tag/tag_list', {
                title: "标签",
                result: data
            });
            return;
        }

        res.send("未知错误，请重试！");
    });
});


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
        type = 0,
        id = req.body.aid;

    if ( id ) {// 修改
        manageModel.update({
                _id: id
            }, {
            key: "Tag",
            body: {
                name: name,
                level: level,
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
        manageModel.getOne({
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

            manageModel.save({
                key: "Tag",
                body: {
                    name: name,
                    level: level,
                    type: type,
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
    manageModel.getOne({
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
    manageModel.remove({
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











module.exports = router;
