var express = require('express');
var util = require('util');
var mongo = require('mongodb');
var acCon = require('../model/active.js');
var sendMail  = require("../server/sendMail.js");
var config    = require("../server/config");
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
 * path:  /active/open
 * 显示所有开放中的活动个数
 * AJAX
 */
router.get('/open', function(req, res) {
    acCon.find().then(function(result){
        // 筛选非关闭状态的活动
        var openArr = [];
        result.forEach(function(item){
            if(item.aStatus != '0'){
                openArr.push(item);
            }
        });

        res.end(JSON.stringify({status:true,count:openArr.length}));
    },function(err){
        res.end(JSON.stringify({status:false,msg:err}));
    })
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
        // 检测活动状态
        acCon.find({_id:new ObjectId(joinObj.aid)}).then(function(result) {
            if (result&&result[0]) {
                // 错误提示
                var activeStatus = '该活动状态异常，暂停报名!';
                if ( result[0].aStatus === "0" ) {
                    activeStatus = '该活动已关闭';
                } else if ( result[0].aStatus === "2" ) {
                    activeStatus = '该活动为暂停状态，请稍后再试';
                } else if ( result[0].aStatus === "3" ) {
                    activeStatus = '该活动筹备中，请密切关注';
                }
                
                if ( result[0].aStatus === "1" ) {// 允许报名
                    joinWrite(result[0]);
                } else {// 非开启状态
                    res.end(JSON.stringify({status:false, msg:activeStatus}));
                }
            } else {
                res.end(JSON.stringify({status:false, msg:"活动不存在"}));
            }
        },function(err){
            res.end(JSON.stringify({status:false,msg:err}));
        });
    }

    /**
     * 写入报名信息
     * @param  {Object} active 本次报名活动信息
     * @return {[type]}
     */
    function joinWrite(active) {
        // 写入报名
        acCon.join(joinObj).then(function(result){
            if ( result.repeat ) {// 重复报名
                res.end(JSON.stringify({status:true,msg:'无需重复报名',activeid:joinObj.aid, repeat:true}));
            } else {// 首次报名
                res.end(JSON.stringify({status:true,msg:'报名成功',activeid:joinObj.aid}));
                // 报名成功邮件发送
                sendMail({
                    from: config.mail.sendMail,
                    to: joinObj.mail,
                    subject: 'WDShare 报名成功',
                    html: '亲爱的 '+ joinObj.name +'：<br /><br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 恭喜您，“'+ active.aName +'” <strong>报名成功！</strong><br /><br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 会议时间：'+ active.aTime +'<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 会议地址：'+ active.aAddress +'<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 会议内容：请查阅官网<br /><br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>注意：</strong><span style="color:#ff0000;">邀请函需等到临近会议前两天发送，请注意查收邮件。</span><br /><br /><br /><br /><br /><br /><br /><br /><span style="color:#666;">WDShare筹委会<br />官网：<a href="http://www.wdshare.org/" target="_blank" style="color:#666;">http://www.wdshare.org</a><br />系统邮件，无需回复。 &nbsp;&nbsp;&nbsp; 联系我们：wdshare@163.com</span><br />'
                }, function() {// succeed
                    mailSucceed(joinObj.mail, active._id);
                    console.log("报名邮件发送成功");
                }, function() {// error
                    mailError(joinObj.mail, active._id);
                    console.log("报名邮件发送失败");
                });
            }
        },function(err){
            res.end(JSON.stringify({status:false,msg:err}));
        });
    };

    /**
     * 报名邮件发送成功更新数据库
     * @param  {String} mail 报名邮箱
     * @param  {String} aId  活动ID
     * @return
     */
    function mailSucceed(mail, aId) {
        var aId = "" + aId;
        acCon.joinUpdate({aid:aId, mail:mail}, {"joinMailState":true}).then(function(result){
            // console.log(mail + " 发送邮件成功");
            console.log(result);
        },function(err){});
    };

    /**
     * 报名邮件发送失败更新数据库
     * @param  {String} mail 报名邮箱
     * @param  {String} aId  活动ID
     * @return
     */
    function mailError(mail, aId) {
        var aId = "" + aId;
        acCon.joinUpdate({aid:aId, mail:mail}, {"joinMailState":false}).then(function(result){
            console.log(mail + " 发送邮件失败");
        },function(err){});
    };

});


/**
 * path:  /active/joinconfirm/{报名id}
 * 参加活动确认页面
 */
router.get('/joinconfirm/:id', function(req, res,next) {
    var id  = req.params.id,
        flag = false,
        text = '',
        aid;
    if( id && id.length == 24 ) {
        // 先查到活动ID
        acCon.findJoin({_id:new ObjectId(id)}).then(function(result){
            if ( result && result[0] ) {
                if ( result[0].state === 2 ) {
                    aid = result[0].aid;
                    getActive();
                } else if ( result[0].state === 3 ) {
                    flag = true;
                    text = "您已经确认过了，无需再确认";
                    callback();
                } else {
                    flag = false;
                    text = "报名信息状态异常！";
                    callback();
                }
            }
        },function(err){
            flag = false;
            text = "查询报名信息出错！";
            callback();
        });
    }else{
        res.render('404');
    }

    // 获取活动信息【用来验证该确认是否有效】
    function getActive() {
        acCon.find({_id:new ObjectId(aid)}).then(function(result){
            if ( result && result[0] && result[0].aStatus !== "0" ) {
                setJoinState();
            } else {
                flag = false;
                text = "该活动已结束！";
                callback();
            }
        },function(err){
            flag = false;
            text = "查询活动信息失败！";
            callback();
        });
    };

    // 设置报名状态
    function setJoinState() {
        acCon.joinUpdate({_id:new ObjectId(id)}, {"state":3}).then(function(result){
            flag = true;
            text = "恭喜您，确认成功！";
            callback();
        },function(err){
            flag = false;
            text = "设置报名状态失败！";
            callback();
        });
    };

    // 返回执行
    function callback() {
        res.render('active/joinconfirm', {
            title: '活动确认',
            result:{flag:flag, text:text}
        });
    };

});



/**
 * path:  /active/{活动id}
 * 参加活动页面
 */
router.get('/:aId', function(req, res,next) {
    var aId = req.params.aId;
    if( aId && aId.length == 24 ) {
        acCon.find({_id:new ObjectId(aId)}).then(function(result){
            if(result&&result[0]){
                var tpl = result[0].aTpl || "index";
                if ( req.session.user ) {// 查询登录会员信息
                    usersInfosModel.getOne({
                        key: "User_info",
                        body: {
                            userid: req.session.user._id
                        }
                    }, function (err, data) {
                        res.render('active/end/' + tpl, { title: '活动详情',activeInfo:result[0], userInfo:data});
                    });
                } else {
                    res.render('active/end/' + tpl, { title: '活动详情',activeInfo:result[0], userInfo:{}});
                }
                
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

module.exports = router;
