var express = require('express');
var util = require('util');
var mongo = require('mongodb');
var acCon = require('../controllers/active.js');
var router = express.Router();
var ObjectId = mongo.ObjectID;
/* GET home page. */
router.get('/', function(req, res) {
    console.log('list');
    console.log('fuck');
    acCon.find({}).then(function(result){
        var openArr = [],disArr = [];
        //console.log('each');
        result.forEach(function(item){
            if(item.aStatus == '1'){
                openArr.push(item);
            }else{
                disArr.push(item);
            }
        });

        res.render('active/list', {
            title: '活动列表',
            oActives:openArr,
            dActives:disArr
        });
    },function(err){
        res.render('active/502', { title: '出错啦',error:err});
    })

});


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


router.post('/updateControl/', function(req, res,next) {
    req.checkBody('aName', '活动名称不能为空').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.end(JSON.stringify({status:false,error:errors}));
    }else{
        var params = req.body;
        if(params.aId){
            acCon.update(params.aId,params).then(function(result){
                res.end(JSON.stringify(result));
            },function(err){
                res.render('502',{status:false,error:err});
            });
        }else{
            acCon.create(params).then(function(result){
                res.end(JSON.stringify(result));
            },function(err){
                res.end(JSON.stringify(err));
            });
        }

    }
});


/* GET home page. */
router.get('/join/:aId', function(req, res,next) {
    if(req.params.aId){
        var aId = req.params.aId;
        acCon.find({_id:new ObjectId(aId)}).then(function(result){
            if(result&&result[0]){
                res.render('active/join', { title: '参加活动',activeInfo:result[0]});
            }else{
                res.render('active/join', { title: '没有活动',activeInfo:{}});
            }
        },function(err){
            res.render('502',{status:false,error:err});
        });
    }else{
        res.render('404');
    }

});


router.post('/joinControl/', function(req, res,next) {
    console.log(req.body);
    req.checkBody('mail', '邮件不正确').notEmpty().isEmail();
    req.checkBody('name', '姓名不能为空').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        console.log(errors);
    }else{
        var params = req.body;
        var aId = params['aId'];
        var joinObj = {
            mail:params['mail'],
            name:params['name'],
            com:params['com'],
            web:params['web'],
            other:params['other'],
            content:params['content'],
            oContent:params['content_temp']
        }
        //console.log(aId);
        //console.log(joinObj);
        acCon.join(aId,joinObj).then(function(result){

            res.end(JSON.stringify(result));
        },function(err){
            res.end(JSON.stringify(err));
        });
    }
});


module.exports = router;
