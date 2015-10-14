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
    config = require("../../server/config");

/**
 * path:  /manage/article
 * 获取所有文章
 */
router.get('/', function(req, res) {
    archiveModel.getAll({
        key: "Archive"
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/article/article_list', {
                title: "文章列表",
                result: data
            });
            return;
        }

        res.send("未知错误，请重试！");
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
 * 修改单页面
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
                title: "修改单页面",
                result: data
            });
            return;
        }

        res.send("未知错误，请重试！");

    });
});

/**
 * path:  /manage/articleCrumbs/del/:id
 * 删除单页面
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
