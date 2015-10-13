var express = require('express'),
    router = express.Router(),
    init = require("../server/init.js"),
    crypto = require('crypto'),
    moment = require("moment"),
    config = require("../server/config");

var Other = {};
// 其他连接的跳转
Other.url = function(req, res, next) {
    var id = req.params.id;

    // 单页面路由检测
    archiveModel.getOne({
        key: "Article_crumb",
        body: {
            url: id
        }
    }, function (err, data) {
        var tpl;
        if (err) {
            next();
        }

        if (data && data.url) {
            tpl = data.template || "article_crumbs";
            // 输出单页面模板
            res.render('article/'+tpl, {
                title: "",
                result: data
            });

            // 记录点击
            archiveModel.update({
                    url: data.url
                }, {
                key: "Article_crumb",
                body: {
                    click: data.click + 1
                }
            }, function (err, data) {});

            return;
        }
        next();
    });
    
};



module.exports = Other;
