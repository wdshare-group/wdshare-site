var express = require('express');
var util = require('util');
var mongo = require('mongodb');
var acCon = require('../model/active.js');
var sendMail  = require("../../server/sendMail.js");
var config    = require("../../server/config");
var router = express.Router();
var URL = require('url');


var active = require('./active.js');


/**
 * path:  /manage/activeJoinGetMail
 * 活动报名邮件提取工具
 */
router.get('/', function(req, res) {
    res.render('manages/active/activeJoinGetMail', {
        title: "获取报名邮件工具",
        message: "请点击提交获取信息！",
        result: []// 返回分类信息
    });
});

router.post('/', function(req, res) {
    var activid = req.body.activid,
        o = {},
        mails = [],
        mailobject = {};// 用于排重;

    if ( activid ) {
        o.aid = activid;
    }

    activeModel.getAll({// 查询分类，为添加文章做准备
        key: "Active_join",
        body: o
    }, function (err, data) {
        if (err) {
            res.render('manages/active/activeJoinGetMail', {
                title: "获取报名邮件工具",
                message: "服务器错误，请重试！",
                result: []// 返回分类信息
            });
            return;
        }

        if (data) {
            for ( var i=0,l=data.length; i<l; i++ ) {
                mailobject[data[i].mail] = "1";
            }
            for ( key in mailobject ) {
                mails.push(key);
            }

            res.render('manages/active/activeJoinGetMail', {
                title: "获取报名邮件工具",
                message: "",
                result: mails// 返回分类信息
            });
            return;
        }

        res.render('manages/active/activeJoinGetMail', {
            title: "获取报名邮件工具",
            message: "未知错误，请重试！",
            result: []// 返回分类信息
        });
    });
});


module.exports = router;
