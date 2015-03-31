var express = require('express');
var util = require('util');
var acCon = require('../controllers/active.js');
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res) {
    res.render('active/list', { title: 'Express' });
});

/* GET home page. */
router.get('/join/', function(req, res) {
    res.render('active/join', { title: 'Express' });
});

router.post('/sign/',function(req,res){
    console.log(req);
    req.checkBody('mail', '邮件不正确').notEmpty().isEmail();
    req.checkBody('name', '姓名不能为空').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.send('There have been validation errors: ' + util.inspect(errors), 400);
        res.render('active/sign-error', errors);
    }else{
        res.render('active/sign-success', { title: 'Express' });
    }
});

module.exports = router;
