var express = require('express');
var util = require('util');
var mongo = require('mongodb');
var acCon = require('../controllers/active.js');
var router = express.Router();
var ObjectId = mongo.ObjectID;


var active = require('./active.js');


/**
 * path:  /manage/active
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
                res.render('manages/active/list', {
                    title: '管理活动列表页',
                    result:result,
                    joinLength:joinLength
                });
            }
        };
        
    }

});


/**
 * path:  /manage/active/create/
 * 创建一个活动
 */
router.get('/create/', function(req, res,next) {
    res.render('manages/active/create', { title: '创建活动' });
});

/**
 * path:  /manage/active/update/:id
 * 更新一个活动
 * Ajax
 */
router.get('/update/:aId', function(req, res,next) {
    if(req.params.aId){
        var aId = req.params.aId;
        acCon.find({_id:new ObjectId(aId)}).then(function(result){
            if(result&&result[0]){
                res.render('manages/active/update', { title: '更新活动',activeInfo:result[0]});
            }else{
                res.render('manages/active/create', { title: '没有活动'});
            }
        },function(err){
            res.end(JSON.stringify({status:true}));
        });
    }else{
        res.end(JSON.stringify({status:false,error:"404"}));
    }
});

/**
 * path:  /manage/active/del/:id
 * 删除一个活动
 * Ajax
 */
router.get('/del/:aId', function(req, res,next) {
    if(req.params.aId){
        var aId = req.params.aId;
        acCon.del({_id:new ObjectId(aId)}).then(function(result){
            res.end(JSON.stringify({
                status:true,
                msg:'删除活动成功'
            }));
        },function(err){
            res.end(JSON.stringify({status:false,error:err}));
        });
    }else{
        res.end(JSON.stringify({status:false,error:"404"}));
    }
});


/**
 * path:  /manage/active/updateControl/
 * 更新活动接口（创建也使用此接口）用于提交数据
 * Ajax
 */
router.post('/updateControl/', function(req, res,next) {
    req.checkBody('aName', '活动名称不能为空').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.end(JSON.stringify({status:false,error:errors}));
    }else{
        var params = req.body;

        if(params.aId){
            acCon.update(params.aId,params).then(function(result){
                res.end(JSON.stringify({
                    status:true,
                    msg:'更新成功'
                }));
            },function(err){
                res.end(JSON.stringify({status:false,error:err}));
            });
        }else{
            acCon.create(params).then(function(result){
                res.end(JSON.stringify({
                    status:true,
                    msg:'创建成功'
                }));
            },function(err){
                res.end(JSON.stringify({status:false,error:err}));
            });
        }

    }
});



/**
 * path:  /manage/active/join/:id
 * 显示指定活动的报名列表
 */
router.get('/join/:aId', function(req, res) {
    if(req.params.aId){
        var aId = req.params.aId,
            active;
        
        // 获取活动信息
        acCon.find({_id:new ObjectId(aId)}).then(function(result) {
            if (result&&result[0]) {
                active = result[0];
                getJoin();
            } else {
                res.render('active/502', { title: '活动不存在',error:err});
            }
        },function(err){
            res.render('active/502', { title: '出错啦',error:err});
        });
        
        function getJoin() {
            // 获取报名信息
            acCon.findJoin({aid:aId}).then(function(result){
                res.render('manages/active/join', {
                    title: '报名信息',
                    result:result,
                    active:active
                });
            },function(err){
                res.render('active/502', { title: '出错啦',error:err});
            })
        };
        
    }else{
        res.end(JSON.stringify({status:false,error:"404"}));
    }
});

/**
 * path:  /manage/active/joinprint/:id
 * 打印指定活动的报名列表
 */
router.get('/joinprint/:aId', function(req, res) {
    if(req.params.aId){
        var aId = req.params.aId,
            active;
        
        // 获取活动信息
        acCon.find({_id:new ObjectId(aId)}).then(function(result) {
            if (result&&result[0]) {
                active = result[0];
                getJoin();
            } else {
                res.render('active/502', { title: '活动不存在',error:err});
            }
        },function(err){
            res.render('active/502', { title: '出错啦',error:err});
        });
        
        function getJoin() {
            // 获取报名信息
            acCon.findJoinprint({aid:aId}).then(function(result){
                res.render('manages/active/joinprint', {
                    title: '报名信息',
                    result:result,
                    active:active
                });
            },function(err){
                res.render('active/502', { title: '出错啦',error:err});
            })
        };
        
    }else{
        res.end(JSON.stringify({status:false,error:"404"}));
    }
});


/**
 * path:  /manage/active/join/death/:id
 * 屏蔽某个报名信息
 * Ajax
 */
router.get('/join/death/:aId', function(req, res) {
    if(req.params.aId){
        var aId = req.params.aId;
        acCon.joinUpdate(aId, {"state":0}).then(function(result){
            res.end(JSON.stringify({
                status:true,
                msg:'屏蔽成功'
            }));
        },function(err){
            res.end(JSON.stringify({status:false,error:err}));
        });
    }else{
        res.end(JSON.stringify({status:false,error:"404"}));
    }
});

/**
 * path:  /manage/active/join/life/:id
 * 开启被屏蔽的某个报名信息
 * Ajax
 */
router.get('/join/life/:aId', function(req, res) {
    if(req.params.aId){
        var aId = req.params.aId;
        acCon.joinUpdate(aId, {"state":1}).then(function(result){
            res.end(JSON.stringify({
                status:true,
                msg:'开启成功'
            }));
        },function(err){
            res.end(JSON.stringify({status:false,error:err}));
        });
    }else{
        res.end(JSON.stringify({status:false,error:"404"}));
    }
});

/**
 * path:  /manage/active/join/del/:id
 * 删除某个报名信息
 * Ajax
 */
router.get('/join/del/:aId', function(req, res) {
    if(req.params.aId){
        var aId = req.params.aId;
        acCon.joindel({_id:new ObjectId(aId)}).then(function(result){
            res.end(JSON.stringify({
                status:true,
                msg:'删除报名成功'
            }));
        },function(err){
            res.end(JSON.stringify({status:false,error:err}));
        });
    }else{
        res.end(JSON.stringify({status:false,error:"404"}));
    }
});

/**
 * path:  /manage/active/join/createcode/:id
 * 生成报名邀请码  :id 活动ID
 * Ajax
 */
router.get('/join/createcode/:aId', function(req, res) {
    if(req.params.aId){
        var aId = req.params.aId;
        
        // 获取报名信息
        acCon.findJoin({aid:aId}).then(function(result){
            setCode(result);
        },function(err){
            res.end(JSON.stringify({status:false,error:err}));
        })
        
    }else{
        res.end(JSON.stringify({status:false,error:"404"}));
    }

    function setCode(result) {
        var yes = 0,
            no = 0,
            max = result.length;
        for ( var i=0,l=max; i<l; i++ ) {
            acCon.joinUpdate(result[i]._id, {"code":max-i}).then(function(result) {
                yes++;
                callback();
            },function(err){
                no++;
                callback();
            });
        }

        // 每次执行完了都检查有没有全部写完
        function callback() {
            if ( yes + no == result.length ) {
                res.end(JSON.stringify({
                    status:true,
                    msg:'生成code完成，成功'+ yes +'个，失败'+ no +'个！'
                }));
            }
        }
    }
    
});


module.exports = router;
