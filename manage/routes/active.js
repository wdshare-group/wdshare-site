var express = require('express');
var util = require('util');
var mongo = require('mongodb');
var acCon = require('../model/active.js');
var sendMail  = require("../../server/sendMail.js");
var config    = require("../../server/config");
var router = express.Router();
var ObjectId = mongo.ObjectID;
var URL = require('url');


var active = require('./active.js');


/**
 * path:  /manage/active
 * 显示所有活动
 */
router.get('/', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;
    var pages = {page:page, pagesize:pagesize, pathname:pathname};
    getActiveList (req, res, {}, pages, 'manages/active/list');
});
/**
 * path:  /manage/active/ongoing
 * 显示进行中的活动
 */
router.get('/ongoing', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;
    var pages = {page:page, pagesize:pagesize, pathname:pathname};
    getActiveList (req, res, {aStatus:{'$ne':'0'}}, pages, 'manages/active/list');
});
/**
 * path:  /manage/active/over
 * 显示已结束的活动
 */
router.get('/over', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;
    var pages = {page:page, pagesize:pagesize, pathname:pathname};
    getActiveList (req, res, {aStatus:"0"}, pages, 'manages/active/list');
});
/**
 * path:  /manage/active/channellist/:url
 * 获取单个分类文章
 */
router.get('/channellist/:url', function(req, res) {
    var url = req.params.url;
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;

    activeModel.getOne({
        key: "Active_channel",
        body: {
            url: url
        }
    }, function (err, data) {
        if (err) {
            res.send("请求发生意外！");
        }
        
        if (data) {
            getActiveList(req, res, {aClass:data._id}, {page:page, pagesize:pagesize, pathname:pathname}, 'manages/active/list', data.name);
            return false;
        }

        res.render('404');
    });
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
                    title: channelName || "所有活动",
                    result: data,
                    channel: channelItem,
                    pages: _page
                });
           }
        };
    });
};


/**
 * path:  /manage/active/create/
 * 创建一个活动
 */
router.get('/create/', function(req, res,next) {
    activeModel.getAll({// 查询分类，为添加活动做准备
        key: "Active_channel"
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/active/create', {
                title: "创建活动",
                result: data// 返回分类信息
            });
            return;
        }

        res.send("未知错误，请重试！");
    });
});

/**
 * path:  /manage/active/update/:id
 * 更新一个活动
 * Ajax
 */
router.get('/update/:id', function(req, res,next) {
    var id = req.params.id;
    activeModel.getAll({// 查询分类，为修改活动做准备
        key: "Active_channel"
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            activeModel.getOne({// 读取活动信息
                key: "Active",
                body: {
                    _id: id
                }
            }, function (err, active) {
                if (err) {
                    res.send("服务器错误，请重试！");
                    return;
                }

                if (active) {
                    res.render('manages/active/update', {
                        title: "更新活动",
                        result: active,
                        channels: data
                    });
                    return;
                }

                res.send("未知错误，请重试！");

            });
            return;
        }

        res.send("未知错误，请重试！");
    });
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
        res.end(JSON.stringify({status:false,msg:"404"}));
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
 * path:  /manage/active/channel
 * 获取活动分类
 */
router.get('/channel', function(req, res) {
    activeModel.getAll({
        key: "Active_channel"
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/active/active_channel_list', {
                title: "活动分类",
                result: data
            });
            return;
        }

        res.send("未知错误，请重试！");
    });
});

/**
 * path:  /manage/active/channel/create
 * 添加活动分类
 */
router.get('/channel/create', function(req, res) {
    activeModel.getAll({
        key: "Active_channel"
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/active/active_channel_create', {
                title: "添加活动分类",
                result: data
            });
            return;
        }

        res.send("未知错误，请重试！");
    });
});
// 修改和添加共用
router.post('/channel/create', function(req, res) {
    var name = req.body.name,
        url = req.body.url,
        parent = req.body.parent,
        keywords = req.body.keywords,
        description = req.body.description,
        id = req.body.aid;

    if ( id ) {// 修改
        activeModel.update({
                _id: id
            }, {
            key: "Active_channel",
            body: {
                name: name,
                parent: parent,
                keywords: keywords,
                description: description,
                editDate: (new Date()).getTime()
            }
        }, function (err, data) {
            if (err) {
                res.send({
                    status: 200,
                    code: 0,
                    message: err
                });
            }
            
            res.send({
                status: 200,
                code: 1,
                message: "修改成功！"
            });
        });
    } else {// 添加
        activeModel.getOne({
            key: "Active_channel",
            body: {
                url: url
            }
        }, function (err, data) {
            if (err) {
                res.send({
                    status: 200,
                    code: 0,
                    message: "服务器错误，请重试！"
                });
                return;
            }

            if (data && data.url) {
                res.send({
                    status: 200,
                    code: 0,
                    message: "URL标识已存在！"
                });
                return;
            }

            activeModel.save({
                key: "Active_channel",
                body: {
                    name: name,
                    url: url,
                    parent: parent,
                    keywords: keywords,
                    description: description,
                    addDate: (new Date()).getTime(),
                    editDate: (new Date()).getTime()
                }
            }, function (err, data) {
                if (err) {
                    res.send({
                        status: 200,
                        code: 0,
                        message: err
                    });
                }
                
                res.send({
                    status: 200,
                    code: 1,
                    message: "添加成功！"
                });
            });
            
        });
    }
});

/**
 * path:  /manage/active/channel/edit/:id
 * 修改活动分类
 */
router.get('/channel/edit/:id', function(req, res) {
    var id = req.params.id;
    activeModel.getOne({
        key: "Active_channel",
        body: {
            _id: id
        }
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/active/Active_channel_edit', {
                title: "修改活动分类",
                result: data
            });
            return;
        }

        res.send("未知错误，请重试！");

    });
});

/**
 * path:  /manage/active/channel/del/:id
 * 删除活动分类
 */
router.get('/channel/del/:id', function(req, res) {
    var id = req.params.id;
    activeModel.remove({
        key: "Active_channel",
        body: {
            _id: id
        }
    }, function (err, data) {
        if (err) {
            res.send({
                status: 200,
                code: 0,
                message: "服务器错误，请重试！"
            });
            return;
        }

        if (data) {
            res.send({
                status: 200,
                code: 1,
                message: "删除成功！"
            });
            return;
        }

        res.send({
            status: 200,
            code: 0,
            message: "未知错误，请重试！"
        });

    });
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
        res.end(JSON.stringify({status:false,msg:"404"}));
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
        res.end(JSON.stringify({status:false,msg:"404"}));
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
        acCon.joinUpdate({_id:new ObjectId(aId)}, {"state":0}).then(function(result){
            res.end(JSON.stringify({
                status:true,
                msg:'屏蔽成功'
            }));
        },function(err){
            res.end(JSON.stringify({status:false,error:err}));
        });
    }else{
        res.end(JSON.stringify({status:false,msg:"404"}));
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
        acCon.joinUpdate({_id:new ObjectId(aId)}, {"state":1}).then(function(result){
            res.end(JSON.stringify({
                status:true,
                msg:'开启成功'
            }));
        },function(err){
            res.end(JSON.stringify({status:false,error:err}));
        });
    }else{
        res.end(JSON.stringify({status:false,msg:"404"}));
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
        res.end(JSON.stringify({status:false,msg:"404"}));
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
        res.end(JSON.stringify({status:false,msg:"404"}));
    }

    function setCode(result) {
        var yes = 0,
            no = 0,
            max = result.length;
        for ( var i=0,l=max; i<l; i++ ) {
            var aId = result[i]._id;
            acCon.joinUpdate({_id:new ObjectId(aId)}, {"code":max-i}).then(function(result) {
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

/**
 * path:  /manage/active/join/remailsent/
 * 重新发送报名成功提醒邮件
 * POST
 * Ajax
 */
router.post('/join/remailsent/', function(req, res,next) {
    var params = req.body;

    if(params) {
        // 报名成功邮件发送
        sendMail({
            from: config.mail.sendMail,
            to: params.mail,
            subject: 'WDShare 活动报名成功',
            html: '亲爱的 '+ params.name +'：<br /><br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 恭喜您，“'+ params.aName +'” <strong>报名成功！</strong><br /><br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 会议时间：'+ params.aTime +'<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 会议地址：'+ params.aAddress +'<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 会议内容：请查阅官网<br /><br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>注意：</strong><span style="color:#ff0000;">邀请函需等到临近会议前两天发送，请注意查收邮件。</span>' + config.mailSignature
        }, function() {// succeed
            mailSucceed(params.mail, params.aid);
            console.log("邮件发送成功");
        }, function() {// error
            mailError(params.mail, params.aid);
            console.log("邮件发送失败");
        });
    } else {
        res.end(JSON.stringify({status:false,msg:"参数不完整"}));
    }

    /**
     * 报名邮件发送成功更新数据库
     * @param  {String} mail 报名邮箱
     * @param  {String} aId  活动ID
     * @return
     */
    function mailSucceed(mail, aId) {
        var aId = "" + aId;
        acCon.joinUpdate({aid:aId, mail:mail}, {"joinMailState":true}).then(function(result){
            res.end(JSON.stringify({status:true,msg:"邮件发送成功"}));
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
            res.end(JSON.stringify({status:false,msg:"邮件发送失败"}));
        },function(err){});
    };
});


/**
 * path:  /manage/active/invite/:id
 * 发送邀请函
 * Ajax
 */
router.get('/invite/:id', function(req, res) {
    var join, active;
    if(req.params.id){
        var id = req.params.id;
        // 获取报名信息
        acCon.findJoin({_id:new ObjectId(id)}).then(function(result){
            if(result&&result[0]){
                join = result[0];
                getActive(join.aid);
            }else{
                res.end(JSON.stringify({status:false,msg:"没有报名信息"}));
            }
        },function(err){
            res.end(JSON.stringify({status:false,error:err}));
        })
    }else{
        res.end(JSON.stringify({status:false,error:err}));
    }

    // 获取活动数据
    function getActive(id) {
        if ( !id ) {
            res.end(JSON.stringify({status:false,msg:"查询活动参数不正确"}));
            return false;
        }
        acCon.find({_id:new ObjectId(id)}).then(function(result){
            if(result&&result[0]){
                active = result[0];
                sendInvite();
            }else{
                res.end(JSON.stringify({status:false,msg:"没有活动"}));
            }
        },function(err){
            res.end(JSON.stringify({status:false,error:err}));
        })
    };

    // 发送邀请邮件
    function sendInvite() {
        var mailTpl;
        if ( !join || !active ) {
            res.end(JSON.stringify({status:false,msg:"发送邮件数据不全"}));
            return false;
        }

        if ( !active.aEmailTpl ) {
            res.end(JSON.stringify({status:false,msg:"没有邮件模板，让我怎么发，罢工啦！"}));
            return false;
        }

        mailTpl = active.aEmailTpl;
        mailTpl = mailTpl.replace(/{=title}/g, active.aName);
        mailTpl = mailTpl.replace(/{=name}/g, join.name);
        mailTpl = mailTpl.replace(/{=code}/g, active.aCodebefor + join.code);
        mailTpl = mailTpl.replace(/{=mail}/g, join.mail);
        mailTpl = mailTpl.replace(/{=id}/g, join._id);
        mailTpl = mailTpl.replace(/{=time}/g, active.aTime);
        mailTpl = mailTpl.replace(/{=address}/g, active.aAddress);
        mailTpl = mailTpl.replace(/{=blank}/g, "&nbsp;");
        mailTpl = mailTpl.replace(/{=signature}/g, config.mailSignature);
        
        // 邀请函邮件发送
        sendMail({
            from: config.mail.sendMail,
            to: join.mail,
            subject: active.aName + ' 邀请函',
            html: mailTpl
        }, function() {// succeed
            mailSucceed(join.mail, active._id);
            console.log("邀请函邮件发送成功");
        }, function() {// error
            mailError(join.mail, active._id);
            console.log("邀请函邮件发送失败");
        });
    };
    
    /**
     * 邀请函发送成功更新数据库
     * @param  {String} mail 报名邮箱
     * @param  {String} aId  活动ID
     * @return
     */
    function mailSucceed(mail, aId) {
        var aId = "" + aId;
        acCon.joinUpdate({aid:aId, mail:mail}, {"inviteState":true, "state":2}).then(function(result){
            res.end(JSON.stringify({status:true,msg:"邀请函发送成功！"}));
        },function(err){});
    };

    /**
     * 邀请函发送失败更新数据库
     * @param  {String} mail 报名邮箱
     * @param  {String} aId  活动ID
     * @return
     */
    function mailError(mail, aId) {
        var aId = "" + aId;
        acCon.joinUpdate({aid:aId, mail:mail}, {"inviteState":false}).then(function(result){
            res.end(JSON.stringify({status:false,msg:"发送邀请函失败！"}));
        },function(err){});
    };
});

/**
 * path:  /manage/active/batchinvite/:id
 * 群发邀请函
 * Ajax
 */
router.get('/batchinvite/:aId', function(req, res) {
    if(req.params.aId){
        var aId = req.params.aId;
        acCon.findJoin({aid:aId}).then(function(result){
            res.end(JSON.stringify({
                status:true,
                msg:'请求列表成功',
                data: result
            }));
        },function(err){
            res.end(JSON.stringify({status:false,error:err}));
        });
    }else{
        res.end(JSON.stringify({status:false,msg:"404"}));
    }
});


module.exports = router;
