var express = require('express');
var util = require('util');
var mongo = require('mongodb');
var acCon = require('../controllers/active.js');
var router = express.Router();
var ObjectId = mongo.ObjectID;

/**
 * path:  /active
 * 显示所有活动
 */
router.get('/', function(req, res) {
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

/**
 * path:  /active/create/
 * 创建一个活动
 * 需要迁移至后台
 */
router.get('/create/', function(req, res,next) {
    res.render('active/create', { title: 'Express',activeInfo:false });
});

router.get('/update/:aId', function(req, res,next) {
    if(req.params.aId){
        var aId = req.params.aId;
        acCon.find({_id:new ObjectId(aId)}).then(function(result){
            if(result&&result[0]){
                res.render('active/update', { title: '更新活动',activeInfo:result[0]});
            }else{
                res.render('active/update', { title: '没有活动',activeInfo:{}});
            }
        },function(err){
            res.end(JSON.stringify({status:true}));
        });
    }else{
        res.render('404');
    }
});

/**
 * path:  /active/updateControl/
 * 更新活动接口（创建也使用此接口）
 * 需要迁移至后台
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
                    msg:'创建成功'
                }));
            },function(err){
                res.end(JSON.stringify({status:false,error:err}));
            });
        }else{
            acCon.create(params).then(function(result){
                res.end(JSON.stringify({
                    status:true,
                    msg:'更新成功'
                }));
            },function(err){
                res.end(JSON.stringify({status:false,error:err}));
            });
        }

    }
});


/**
 * path:  /active/{活动id}
 * 参加活动页面
 */
router.get('/:aId', function(req, res,next) {
    if(req.params.aId){
        var aId = req.params.aId;
        acCon.find({_id:new ObjectId(aId)}).then(function(result){
            if(result&&result[0]){
                var tpl = result[0].aTpl || "index";
                res.render('active/end/' + tpl, { title: '活动详情',activeInfo:result[0]});
                // 记录活动点击
                acCon.click(result[0]._id, result[0].aClick);
            }else{
                res.render('active/end/404', { title: '没有活动',activeInfo:{}});
            }
        },function(err){
            res.render('502',{status:false,error:err});
        });
    }else{
        res.render('404');
    }

});

/**
 * path:  /active/joinOk/{活动id}
 * 参加活动页面
 * 暂时没用
 */
router.get('/joinOk/:aId', function(req, res,next) {
    if(req.params.aId){
        var aId = req.params.aId;
        acCon.find({_id:new ObjectId(aId)}).then(function(result){
            if(result&&result[0]){
                res.render('active/joinOk', { title: '报名成功',activeInfo:result[0]});
            }else{
                res.render('active/joinOk', { title: '没有发现活动',activeInfo:{}});
            }
        },function(err){
            res.render('502',{status:false,error:err});
        });
    }else{
        res.render('404');
    }

});

/**
 * path:  /active/join/
 * AJAX 请求
 * 参加活动接口
 */
router.post('/join/', function(req, res, next) {
    req.checkBody('mail', '邮件不正确').notEmpty().isEmail();
    req.checkBody('name', '姓名不能为空').notEmpty();
    var errors = req.validationErrors();

    if (errors) {
        res.end(JSON.stringify(errors));
    }else{
        var params = req.body;
        var joinObj = {
            aid:params['aid'],
            mail:params['mail'],
            name:params['name'],
            com:params['com'],
            web:params['web'],
            content:params['content'],
            chi:params['chi']
        };
        acCon.join(joinObj).then(function(result){
            if ( result.repeat ) {// 重复报名
                res.end(JSON.stringify({status:true,msg:'报名成功',activeid:joinObj.aid, repeat:true}));
            } else {// 首次报名
                res.end(JSON.stringify({status:true,msg:'报名成功',activeid:joinObj.aid}));
            }
        },function(err){
            res.end(JSON.stringify({status:false,msg:err}));
        });
    }
});


/**
 * path:  /active/users/{活动id}
 * 参加活动页面
 * 暂时不清楚怎么使用
 */

router.get('/users/:aId', function(req, res,next) {
    if(req.params.aId){
        var aId = req.params.aId;
        acCon.find({_id:new ObjectId(aId)}).then(function(result){
            if(result&&result[0]){
                res.render('active/users', { title: '活动用户列表',activeInfo:result[0]});
            }else{
                res.render('active/users', { title: '无活动',activeInfo:null});
            }
        },function(err){
            res.render('502',{status:false,error:err});
        });
    }else{
        res.render('404');
    }
});

module.exports = router;
