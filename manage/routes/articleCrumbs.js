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
 * path:  /manage/articleCrumbs
 * 单页面管理列表
 */
router.get('/', function(req, res) {
    archiveModel.getAll({
        key: "Article_crumb"
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/article/article_crumbs_list', {
                title: "单页面管理",
                result: data
            });
            return;
        }

        res.send("未知错误，请重试！");
    });
});



/**
 * path:  /manage/articleCrumbs/create
 * 添加单页面
 */
router.get('/create', function(req, res) {
    res.render('manages/article/article_crumbs_create', {
        title: "添加单页面"
    });
});
// 修改和添加共用
router.post('/create', function(req, res) {
    var title = req.body.title,
        url = req.body.url,
        template = req.body.template,
        content = req.body.content,
        id = req.body.aid;

    if ( id ) {// 修改
        archiveModel.update({
                _id: id
            }, {
            key: "Article_crumb",
            body: {
                title: title,
                template: template,
                content: content,
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
            console.log(data);
            res.send({
                status: 200,
                code: 1,
                message: "修改成功！"
            });
        });
    } else {// 添加
        archiveModel.getOne({
            key: "Article_crumb",
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
                key: "Article_crumb",
                body: {
                    title: title,
                    url: url,
                    template: template,
                    content: content,
                    addDate: (new Date()).getTime(),
                    editDate: (new Date()).getTime(),
                    click: 0
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
 * path:  /manage/articleCrumbs/edit/:id
 * 修改单页面
 */
router.get('/edit/:id', function(req, res) {
    var id = req.params.id;
    archiveModel.getOne({
        key: "Article_crumb",
        body: {
            _id: id
        }
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/article/article_crumbs_edit', {
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
router.get('/del/:id', function(req, res) {
    var id = req.params.id;
    archiveModel.remove({
        key: "Article_crumb",
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
