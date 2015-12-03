var express = require('express');
var util = require('util');
var mongo = require('mongodb');
var acCon = require('../model/active.js');
var sendMail  = require("../server/sendMail.js");
var config    = require("../server/config");
var router = express.Router();
var ObjectId = mongo.ObjectID;
var URL = require('url');

/**
 * path:  /active
 * 显示所有活动
 */
router.get('/', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getActiveList(req, res, {}, {page:page, pagesize:pagesize, pathname:pathname}, 'active/list');
    /*
    acCon.find({}).then(function(result){
        res.render('active/list', {
            title: '活动列表',
            result:result
        });
    },function(err){
        res.render('active/502', { title: '出错啦',error:err});
    })*/

});

/**
 * 获取列表内容
 * @param  {Object} o 限制条件
 * @param  {Object} pages 分页参数对象
 * @param  {String} mod 模板路径
 * @param  {String} channelName 分类名称
 * @return
 */
function getActiveList(req, res, o, pages, mod, channelName) {
    activeModel.getSort({
        key: "Active",
        body:o,// 筛选内容
        pages: pages,// 分页信息
        occupation: "aAddDate"// 排序字段
    }, function (err, data) {
        var channelCount = 0,
            joinCount = 0,
            allCount,
            channelItem;
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            for ( var i=0; i<data.length; i++ ) {
                (function(i) {
                    // 获取分类信息
                    activeModel.getOne({
                        key: "Active_channel",
                        body: {
                            _id: data[i].aClass
                        }
                    }, function (err, channelData) {
                        if (err) {
                            res.send("服务器错误，请重试！");
                            return;
                        }

                        if (channelData && channelData.name) {
                            data[i].channel = channelData.name;
                            channelCount++;
                            gosend();
                            return;
                        }
                        res.send("未知错误，请重试！");
                    });

                    // 获取报名信息
                    activeModel.getAll({
                        key: "Active_join",
                        body: {
                            aid: data[i]._id
                        }
                    }, function (err, joins) {
                        if (err) {
                            res.send("服务器错误，请重试！");
                            return;
                        }

                        if (joins) {
                            data[i].joins = joins.length;
                            joinCount++
                            gosend();
                            return;
                        }
                        res.send("未知错误，请重试！");
                    });
                })(i);
            }

            // 获取总数【用于分页】
            activeModel.getAll({// 查询分类，为添加文章做准备
                key: "Active",
                body: o
            }, function (err, data) {
                if (err) {
                    res.send("服务器错误，请重试！");
                    return;
                }

                if (data) {
                    allCount = data.length;
                    gosend();
                    return;
                }

                res.send("未知错误，请重试！");
            });

            // 获取分类信息，列表页显示分类
            activeModel.getAll({
                key: "Active_channel"
            }, function (err, data) {
                if (err) {
                    res.send("服务器错误，请重试！");
                    return;
                }

                if (data) {
                    channelItem = data;
                    gosend();
                    return;
                }

                res.send("未知错误，请重试！");
            });

            return;
        }

        res.send("未知错误，请重试！");

        // 所有数据都获取完成后执行返回
        function gosend() {
           var _page = pages;
           if ( channelCount == data.length && joinCount == data.length && allCount >= 0 && channelItem ) {
                _page.sum = allCount;
                res.render(mod, {
                    title: channelName || "精彩活动",
                    result: data,
                    channel: channelItem,
                    pages: _page
                });
           }
        };
    });
};




/**
 * path:  /active/open
 * 显示所有开放中的活动个数
 * AJAX
 */
router.get('/open', function(req, res) {
    activeModel.getAll({
        key: "Active",
        body: {aStatus:{'$ne':'0'}}
    }, function (err, data) {
        if (data) {
            res.send({status:true,count:data.length});
            return;
        }

        req.send({status:false,msg:"获取进行中的活动数量失败"});
    });
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
router.get('/:id', function(req, res,next) {
    var id = req.params.id;
    activeModel.getOne({
        key: "Active",
        body: {
            _id: id
        }
    }, function (err, active) {
        if (err || !active) {
            // 传递ID查不到活动时可能是栏目列表
            getChannelList(id);
            // res.send("参数错误，请重试！");
            return;
        }
        if ( active ) {
            var tpl = active.aTpl || "index";
            // 登录的时候查询用户信息
            if ( req.session.user ) {
                usersInfosModel.getOne({
                    key: "User_info",
                    body: {
                        userid: req.session.user._id
                    }
                }, function (err, userInfo) {
                    gosend(userInfo);
                });
            } else {
                gosend();
            }
            

            function gosend(info) {
                var click = active.aClick || 0;
                // 记录点击
                activeModel.update({
                        _id: id
                    }, {
                    key: "Active",
                    body: {
                        aClick: click + 1
                    }
                }, function (err, data) {
                    res.render('active/end/' + tpl, {
                        activeInfo: active,
                        userInfo: info
                    });
                });
            }
            return;
        }
        res.send("获取活动信息错误，请重试！");
    });

    // 列表信息
    /**
     * 获取分类列表
     * @return
     */
    function getChannelList() {
        var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;

        activeModel.getOne({
            key: "Active_channel",
            body: {
                url: id
            }
        }, function (err, data) {
            if (err) {
                res.send("请求发生意外！");
            }
            // console.log(data);
            if (data) {
                getActiveList(req, res, {aClass:data._id}, {page:page, pagesize:pagesize, pathname:pathname}, 'active/list', data.name);
                return false;
            }

            res.render('404');
        });
    };
});

module.exports = router;
