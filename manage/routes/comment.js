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
 * path:  /manage/articleCrumbs
 * 单页面管理列表
 */
router.get('/', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getCommentList(req, res, {}, {page:page, pagesize:pagesize, pathname:pathname}, 'manages/comment/comment_list');
});


/**
 * 获取参与的评论
 * @param  {Object} o 限制条件
 * @param  {Object} pages 分页参数对象
 * @param  {String} mod 模板路径
 * @return
 */
function getCommentList(req, res, o, pages, mod) {
    commentModel.getSort({// 获取报名信息
        key: "Comment",
        body:o,// 仅读取当前会员
        pages: pages,// 分页信息
        occupation: "addDate"// 排序字段
    }, function (err, data) {
        var _page = pages;
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            if ( data.length < 1 ) {
                _page.sum = 0;
                res.render(mod, {
                    title: "所有评论",
                    result: [],
                    today: 0,
                    pages: _page
                });
                return false;
            }

            // 获取总数【用于分页】
            commentModel.getAll({
                key: "Comment",
                body: o
            }, function (err, comment) {
                if (err) {
                    res.send("服务器错误，请重试！");
                    return;
                }

                if (comment) {
                    _page.sum = comment.length;
                    var year = new Date().getFullYear(),
                        month = new Date().getMonth() + 1,
                        day = new Date().getDate();

                    commentModel.getAll({
                        key: "Comment",
                        body: {addDate:{'$gte':new Date(year+"/"+month+"/"+day+" 00:00:00").getTime()}}
                    }, function (err, _comment) {
                        if (err) {
                            res.send("服务器错误，请重试！");
                            return;
                        }

                        if (_comment) {
                            var today = _comment.length;
                            // 替换 @谁 为链接后返回数据
                            replaceUserLink(data, function(newData) {
                                res.render(mod, {
                                    title: "会员参与的评论",
                                    result: newData,
                                    today: today,
                                    pages: _page
                                });
                            });
                            return;
                        }

                        res.send("未知错误，请重试！");
                    });
                    
                    return;
                }

                res.send("未知错误，请重试！");
            });

            return;
        }

        res.send("未知错误，请重试！");
    });

    // 会员昵称转ID【get专属，与公共方法略有不同】
    function nameToID(items, callback) {
        var ids = {},
            c = 0;
        for ( var i=0,l=items.length; i<l; i++ ) {
            usersModel.getOne({
                key: "User",
                body: {
                    username: items[i].replace("@", "")
                }
            }, function (err, user) {
                if (err) {
                    c++;
                    go();
                    return false;
                }
                if ( user && user.username ) {
                    ids["@"+user.username] = user._id;
                    c++;
                    go();
                    return false;
                }
                c++;
                go();
                return false;
            });
        }
        function go() {
            if ( c == items.length && callback ) {
                callback(ids);
            }
        }
    };
    // 替换 @谁 为链接  以及发送邮箱字段解析
    function replaceUserLink(data, callback) {
        var c = 0;
        for ( var i=0,l=data.length; i<l; i++ ) {
            (function(i) {
                
                // 发送邮箱字段解析
                var send
                if ( data[i].notice ) {
                    send = eval(data[i].notice);// 将字符串转换为js对象
                } else {
                    send = [];
                }
                data[i].send = send;// 解析后的发送邮件结果
                // data[i].sendSum = send.length;


                if ( data[i].content.indexOf("@") < 0 ) {
                    c++;
                    go();
                } else {
                    var usernameList = data[i].content.match(/@\S+/g);
                    nameToID(usernameList, function(ids) {
                        for ( var j=0,le=usernameList.length; j<le; j++ ) {
                            if ( ids[usernameList[j]] ) {
                                data[i].content = data[i].content.replace(usernameList[j], '<a href="/user/'+ids[usernameList[j]]+'" target="_blank">'+usernameList[j]+'</a>');
                            }
                        }
                        c++;
                        go();
                    });
                }
            })(i);
        }

        function go() {
            if ( c == data.length && callback ) {
                callback(data);
            }
        };
    };
};

/**
 * path:  /manage/comment/hide/:id
 * 隐藏评论
 */
router.get('/hide/:id', function(req, res) {
    var id = req.params.id;

    // 先查询，检查条件是否满足
    commentModel.getOne({
        key: "Comment",
        body: {
            _id: id
        }
    }, function (err, data) {
        if ( err ) {
            res.send({
                status: 200,
                code: 0,
                message: "服务器错误，请重试！"
            });
            return false;
        }

        if ( data && data.userid ) {
            hide();
            return;
        }

        res.send({
            status: 200,
            code: 0,
            message: "未知错误，请重试！"
        });
    });

    // 隐藏评论
    function hide() {
        commentModel.update({
                _id: id
            }, {
            key: "Comment",
            body: {
                hide: true
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
                message: "隐藏成功！"
            });
        });
    };
});

/**
 * path:  /manage/comment/show/:id
 * 显示评论
 */
router.get('/show/:id', function(req, res) {
    var id = req.params.id;

    // 先查询，检查条件是否满足
    commentModel.getOne({
        key: "Comment",
        body: {
            _id: id
        }
    }, function (err, data) {
        if ( err ) {
            res.send({
                status: 200,
                code: 0,
                message: "服务器错误，请重试！"
            });
            return false;
        }

        if ( data && data.userid ) {
            show();
            return;
        }

        res.send({
            status: 200,
            code: 0,
            message: "未知错误，请重试！"
        });
    });

    // 隐藏评论
    function show() {
        commentModel.update({
                _id: id
            }, {
            key: "Comment",
            body: {
                hide: false
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
                message: "显示成功！"
            });
        });
    };
});

/**
 * path:  /manage/comment/del/:id
 * 删除评论
 */
router.get('/del/:id', function(req, res) {
    var id = req.params.id;

    // 先查询，检查条件是否满足
    commentModel.getOne({
        key: "Comment",
        body: {
            _id: id
        }
    }, function (err, data) {
        if ( err ) {
            res.send({
                status: 200,
                code: 0,
                message: "服务器错误，请重试！"
            });
            return false;
        }

        if ( data && data.userid ) {
            remove();
            return;
        }

        res.send({
            status: 200,
            code: 0,
            message: "未知错误，请重试！"
        });
    });

    // 移除评论
    function remove() {
        commentModel.remove({
            key: "Comment",
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
                // 接着删除被引用的子评论
                commentModel.remove({
                    key: "Comment",
                    body: {
                        quote: id
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
                return;
            }

            res.send({
                status: 200,
                code: 0,
                message: "未知错误，请重试！"
            });
        });
    };
});

module.exports = router;
