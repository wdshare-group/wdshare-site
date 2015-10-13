var express = require('express');
var util = require('util');
var mongo = require('mongodb');
var acCon = require('../model/index.js');
var router = express.Router();
var ObjectId = mongo.ObjectID;

/**
 * path:  /active
 * 显示所有活动
 */
router.get('/', function(req, res) {
    var affiche = false,
        active = false,
        users = false;
    // 读取活动
    acCon.find({}).then(function(result) {
        active = result;
        foo();
    },function(err){
        active = "error";
        foo();
    });

    // 读取users
    usersModel.getAll({
        key: "User"
    }, function (err, data) {
        if (err) {
            users = "error";
            foo();
        } else {
            users = data;
            foo();
        }
    });

    // 读取公告
    archiveModel.getOne({
        key: "Article_crumb",
        body: {
            url: "affiche"
        }
    }, function (err, data) {
        if (data && data.url) {
            affiche = data;
            foo();
        } else {
            affiche = "error";
            foo();
        }
    });

    function foo() {
        if ( active && affiche && users ) {
            res.render('index', {
                title: '官网首页',
                active: active,
                affiche: affiche,
                users: users
            });
        }
        
    }

});



module.exports = router;
