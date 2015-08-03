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
    // acCon.find({"aStatus":"1"}).then(function(result){// 获取开启状态的活动
    acCon.find({}).then(function(result) {
        /*
        // 区分开始状态与其他状态
        var openArr = [],disArr = [];
        result.forEach(function(item){
            if(item.aStatus == '1'){
                openArr.push(item);
            }else{
                disArr.push(item);
            }
        });*/

        res.render('index', {
            title: '官网首页',
            result: result
        });
    },function(err){
        res.render('502', { title: '出错啦',error:err});
    })

});



module.exports = router;
