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
 * path:  /manage/member
 * 获取所有会员
 */
router.get('/', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;
    var pages = {page:page, pagesize:pagesize, pathname:pathname};
    getUsersList(req, res, {}, pages, "manages/member/member_list");
});

/**
 * path:  /manage/member/notactive
 * 获取所有未激活会员
 */
router.get('/notactive', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;
    var pages = {page:page, pagesize:pagesize, pathname:pathname};
    getUsersList(req, res, {isActive: false}, pages, "manages/member/member_list", "未激活会员");
});

/**
 * path:  /manage/member/lock
 * 获取所有被锁定会员
 */
router.get('/lock', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;
    var pages = {page:page, pagesize:pagesize, pathname:pathname};
    getUsersList(req, res, {lock: true}, pages, "manages/member/member_lock_list", "被锁定会员");
});

/**
 * path:  /manage/member/active
 * 获取所有活跃会员
 */
router.get('/active', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;
    var pages = {page:page, pagesize:pagesize, pathname:pathname};
    getUsersList(req, res, {lastLoginTime:{'$gte':new Date().getTime()-1000*60*60*24*15}}, pages, "manages/member/member_list", "活跃会员");
});

/**
 * path:  /manage/member/vip
 * 获取所有VIP会员
 */
router.get('/vip', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;
    var pages = {page:page, pagesize:pagesize, pathname:pathname};
    getUsersList(req, res, {vip:/[a-z]+/i}, pages, "manages/member/member_list", "VIP会员");
});

/**
 * 获取会员列表
 * @param  {Object} o 限制条件
 * @param  {Object} pages 分页参数对象
 * @param  {String} mod 模板
 * @param  {String} channelName 类型名称
 * @return
 */
function getUsersList(req, res, o, pages, mod, channelName) {
    usersModel.getSort({
        key: "User",
        body:o,// 筛选内容
        pages: pages,// 分页信息
        occupation: "regTime"// 排序字段
    }, function (err, data) {
        var articleCount = 0,
            userInfoCount = 0,
            allCount;
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            for ( var i=0; i<data.length; i++ ) {
                (function(i) {
                    // 获取文章数
                    archiveModel.getAll({
                        key: "Archive",
                        body: {
                            userId: data[i]._id
                        }
                    }, function (err, article) {
                        if (err) {
                            res.send("服务器错误，请重试！");
                            return;
                        }

                        if (article) {
                            data[i].article = article.length;
                            articleCount++
                            gosend();
                            return;
                        }
                        res.send("未知错误，请重试！");
                    });

                    // 获取用户详细信息
                    usersInfosModel.getOne({
                        key: "User_info",
                        body: {
                            userid: data[i]._id
                        }
                    }, function (err, userInfo) {
                        if (err) {
                            res.send("服务器错误，请重试！");
                            return;
                        }
                        
                        data[i].userInfo = userInfo || {};
                        userInfoCount++;
                        gosend();
                        return;
                    });
                })(i);
            }

            // 获取总数
            usersModel.getAll({
                key: "User",
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
           if ( articleCount == data.length && userInfoCount == data.length && allCount >= 0 ) {
                _page.sum = allCount;
                res.render(mod, {
                    title: channelName || "所有会员",
                    result: data,
                    pages: _page
                });
           }
        };
    });
};

/**
 * path:  /manage/member/edit/:id
 * 修改会员帐号
 */
router.route('/edit/:id').get(function (req, res) {
    "use strict";
    var id = req.params.id;
    // 先查用户信息
    usersModel.getOne({
        key: "User",
        body: {
            _id: id
        }
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }
        if (data && data.email) {
            // 获取用户信息【为了确认是否显示修改信息按钮】
            usersInfosModel.getOne({
                key: "User_info",
                body: {
                    userid: id
                }
            }, function (err, userInfo) {
                if (err) {
                    res.send("服务器错误，请重试！");
                    return;
                }
                res.render("manages/member/member_edit", {
                    title: "修改会员帐号",
                    result: data,
                    userInfo: userInfo || {}
                });
                return;
            });
            return;
        }
        res.send("未知错误，请重试！");
    });
});
/**
 * path:  /manage/member/edit
 * 修改会员帐号提交
 */
router.route('/edit').post(function (req, res) {
    "use strict";
    var id = req.body.aid,
        email = req.body.email,
        username = req.body.username,
        password = req.body.password,
        lock = req.body.lock == "1" ? true : false,
        lockMessage = req.body.lockMessage,
        vip = req.body.vip,
        passwordHash,
        _body;
    
    _body = {
        email:email,
        username: username,
        lock: lock,
        lockMessage: lockMessage,
        vip: vip
    };
    if ( password ) {
        _body.password = crypto.createHash("sha1").update(new Buffer(password, "binary")).digest('hex');
    }
    if ( lock ) {
        _body.lockTime = (new Date()).getTime();
    }

    // 修改信息
    usersModel.update({
        _id: id
    }, {
        key: "User",
        body: _body
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
});

/**
 * path:  /manage/member/editinfo/:id
 * 编辑用户资料  user_infos表操作
 */
router.route('/editinfo/:id').get(function (req, res) {
    "use strict";
    var id = req.params.id;
    // 先查用户信息
    usersInfosModel.getOne({
        key: "User_info",
        body: {
            userid: id
        }
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }
        if (data && data.email) {
            res.render("manages/member/member_editinfo", {
                title: "修改会员信息",
                result: data
            });
            return;
        }
        res.send("未知错误，请重试！");
    });
});
/**
 * path:  /manage/member/editinfo
 * 修改会员信息提交
 */
router.route('/editinfo').post(function (req, res) {
    "use strict";
    console.log("info");
    var id = req.body.aid,
        mood = req.body.mood,
        sex = req.body.sex,
        realname = req.body.realname,
        tag = req.body.tag,
        jobstate = req.body.jobstate,
        com = req.body.com,
        jobs = req.body.jobs,
        school = req.body.school,
        isPartTime = req.body.isPartTime == "1" ? true : false,
        phone = req.body.phone,
        qq = req.body.qq,
        wechat = req.body.wechat,
        www = req.body.www,
        weibo = req.body.weibo,
        github = req.body.github,
        introduction = req.body.introduction,
        zan = req.body.zan,
        offer = req.body.offer,
        _body;
    if ( www == "http://" ) {
        www = "";
    }
    if ( weibo == "http://" ) {
        weibo = "";
    }
    if ( github == "http://" ) {
        github = "";
    }

    // tag内容进行优化
    // 避免两个重复的逗号
    tag = tag.replace(/,,/g, ",");
    // 最后一个字符为逗号时清除掉
    if ( tag.lastIndexOf(",") == tag.length-1 ) {
        tag = tag.substring(0, tag.lastIndexOf(","));
    }

    _body = {
        mood: mood,
        sex: sex,
        realname: realname,
        tag: tag,
        jobstate: jobstate,
        com: com,
        jobs: jobs,
        school: school,
        isPartTime: isPartTime,
        phone: phone,
        qq: qq,
        wechat: wechat,
        www: www,
        weibo: weibo,
        github: github,
        introduction: introduction,
        zan: zan,
        offer: offer
    };

    // 修改信息
    usersInfosModel.update({
        _id: id
    }, {
        key: "User_info",
        body: _body
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
        tagsCheck(tag);
    });

    // 对标签进行检查，存在的增加计数，不存在的添加
    function tagsCheck(tags) {
        var tags = tags.split(",");
        for ( var i=0,l=tags.length; i<l; i++ ) {
            (function(i) {
                var count;
                // 获取翻个标签，检查是否存在
                tagModel.getOne({
                    key: "Tag",
                    body: {
                        name: tags[i],
                        model: "member"
                    }
                }, function (err, data) {
                    if (err) {
                        res.send("服务器错误，请重试！");
                        return;
                    }
                    
                    if ( data && data.name ) {// 存在
                        count = data.level + 1;
                        tagModel.update({
                            name: data.name,
                            model: "member"
                        }, {
                            key: "Tag",
                            body: {
                                level: count,
                                editDate: (new Date()).getTime()
                            }
                        }, function (err, data) {});
                    } else {// 不存在
                        if ( !tags[i] ) {
                            return;
                        }
                        count = 1;
                        tagModel.save({
                            key: "Tag",
                            body: {
                                name: tags[i],
                                level: count,
                                model: "member",
                                addDate: (new Date()).getTime(),
                                editDate: (new Date()).getTime()
                            }
                        }, function (err, data) {});
                    }
                    return;
                });
            })(i);
        }
    };
});




module.exports = router;
