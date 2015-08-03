var express = require('express');
var util = require('util');
var mongo = require('mongodb');
var acCon = require('../model/active.js');
var router = express.Router();
var ObjectId = mongo.ObjectID;


var active = require('./active.js');


/**
 * path:  /active
 * 显示所有活动
 */
router.get('/', function(req, res) {
    
    acCon.find({}).then(function(result){
        getJoin(result);
    },function(err){
        res.render('active/502', { title: '出错啦',error:err});
    })

    function getJoin(result) {
        var yes = 0,
            no = 0,
            max = result.length,
            joinLength = {};
        for (var i=0; i<max; i++) {
            (function() {
                var active = result[i],
                    aId = ""+active._id;
                // 获取报名信息
                acCon.findJoin({aid:aId}).then(function(data) {
                    joinLength[aId] = data.length;
                    yes++;
                    joinCallback();
                }, function(err) {
                    joinLength[aId] = "undefied";
                    no++;
                    joinCallback();
                })
            })(i);
            
        }

        function joinCallback() {
            if ( yes + no == max ) {
                res.render('manages/index', {
                    title: '管理活动列表页',
                    result:result,
                    joinLength:joinLength
                });
            }
        };
        
    }

});

module.exports = router;
