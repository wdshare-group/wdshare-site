var express = require('express');
var util = require('util');
var mongo = require('mongodb');
var acCon = require('../controllers/active.js');
var router = express.Router();
var ObjectId = mongo.ObjectID;


var active = require('./active.js');


/**
 * path:  /active
 * 显示所有活动
 */
router.get('/', function(req, res) {
    res.render('manages/index', {
        title: '管理后台首页'
    });
    return false;

    acCon.find({}).then(function(result){
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

        res.render('active/list', {
            title: '活动列表',
            result:result
        });
    },function(err){
        res.render('active/502', { title: '出错啦',error:err});
    })

});


module.exports = router;
