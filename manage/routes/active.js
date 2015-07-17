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
    acCon.find({}).then(function(result){
        res.render('manages/active/list', {
            title: '管理活动列表页',
            result:result
        });
    },function(err){
        res.render('active/502', { title: '出错啦',error:err});
    })

});


module.exports = router;
