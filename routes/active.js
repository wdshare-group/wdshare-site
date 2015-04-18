var express = require('express');
var util = require('util');
var acCon = require('../controllers/active.js');
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res) {
    res.render('active/list', { title: 'Express' });
});

/* GET home page. */
router.get('/join/', function(req, res,next) {
    res.render('active/join', { title: 'Express',errors:undefined });
});

router.get('/create/', function(req, res,next) {
    res.render('active/create', { title: 'Express',errors:undefined });
});

router.post('/create/', function(req, res,next) {
    req.checkBody('name', '活动名称不能为空').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.render('active/join', {errors:errors});
    }else{
        var params = req.body;

        acCon.create(params).then(function(result){

        },function(err){

        });
    }
});

router.post('/joinControl/', function(req, res,next) {
    req.checkBody('name', '活动名称不能为空').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.end(JSON.stringify({status:false,errors:errors}));
    }else{
        var params = req.body;
        acCon.create(params).then(function(result){
        },function(err){
            res.end(JSON.stringify({status:true}));
        });
    }
});

router.post('/createControl/', function(req, res,next) {
    req.checkBody('name', '活动名称不能为空').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.end(JSON.stringify({status:false,errors:errors}));
    }else{
        var params = req.body;
        acCon.create(params).then(function(result){
        },function(err){
            res.end(JSON.stringify({status:true}));
        });
    }
});


router.post('/sign/',function(req,res,next){
    console.log(req.body);
    req.checkBody('mail', '邮件不正确').notEmpty().isEmail();
    req.checkBody('name', '姓名不能为空').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.render('active/join', {errors:errors});
    }else{
        var params = req.body;
        var joinObj = {
            mail:params['mail'],
            name:params['name'],
            com:params['com'],
            web:params['web'],
            other:params['other'],
            content:params['content'],
            oContent:params['content_temp']
        }
        acCon.sign(joinObj).then(function(result){

        },function(err){

        });
    }
});

module.exports = router;
