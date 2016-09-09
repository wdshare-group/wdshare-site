var express = require('express'),
    fs = require('fs'),
    path = require('path'),
    sendMail = require("../../server/sendMail.js"),
    router = express.Router(),
    init = require("../../server/init.js"),
    authorize = init.authorize,
    goBack = init.goBack,
    crypto = require('crypto'),
    moment = require("moment"),
    config = require("../../server/config"),
    URL = require('url');

/**
 * path:  /manage/jobs
 * 
 * 获取所有招聘信息
 */
router.get('/', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;
    var pages = {page:page, pagesize:pagesize, pathname:pathname};
    getJobsList(req, res, {type:3}, pages, 'manages/jobs/job_list');
});

/**
 * path:  /manage/jobs/notaudit
 * 获取所有未审核招聘信息
 */
router.get('/notaudit', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;
    var pages = {page:page, pagesize:pagesize, pathname:pathname};
    getJobsList(req, res, {type:3, audit:false}, pages, 'manages/jobs/job_list', "未审核招聘");
});

/**
 * path:  /manage/jobs/channellist/:id
 * 获取单个分类文章
 */
router.get('/channellist/:id', function(req, res) {
    var id = req.params.id;
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;

    jobModel.getOne({
        key: "Job_channel",
        body: {
            _id: id
        }
    }, function (err, data) {
        if (err) {
            res.send("请求发生意外！");
        }
        
        if (data) {
            getJobsList(req, res, {type:3, channelId:data._id}, {page:page, pagesize:pagesize, pathname:pathname}, 'manages/jobs/job_list', data.name);
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
function getJobsList(req, res, o, pages, mod, channelName) {
    archiveModel.getSort({
        key: "Archive",
        body:o,// 仅读取文章类型的档案
        pages: pages,// 分页信息
        occupation: {"sortup":-1, "rank":-1, "editDate":-1}// 排序字段：置顶、排序、修改时间
    }, function (err, data) {
        var channelCount = 0,
            userCount = 0,
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
                    jobModel.getOne({
                        key: "Job_channel",
                        body: {
                            _id: data[i].channelId
                        }
                    }, function (err, channelData) {
                        if (err) {
                            res.send("服务器错误，请重试！");
                            return;
                        }

                        if (channelData && channelData.name) {
                            // console.log(channelData.name);
                            data[i].channel = channelData.name;
                            channelCount++;
                            gosend();
                            return;
                        }
                        res.send("未知错误，请重试！");
                    });

                    // 获取会员信息
                    usersModel.getOne({
                        key: "User",
                        body: {
                            _id: data[i].userId
                        }
                    }, function (err, userData) {
                        if (err) {
                            res.send("服务器错误，请重试！");
                            return;
                        }

                        if (userData) {
                            data[i].user = userData.username;
                            data[i].usermail = userData.email;
                        } else {
                            data[i].user = "";
                            data[i].usermail = "";
                        }
                        userCount++;
                        gosend();
                        return;
                    });
                })(i);
            }

            // 获取总数【用于分页】
            archiveModel.getAll({
                key: "Archive",
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

            // 获取招聘分类信息，列表页显示分类
            jobModel.getAll({
                key: "Job_channel",
                body: {parent:1}
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
           if ( channelCount == data.length && userCount == data.length && allCount >= 0 && channelItem ) {
                _page.sum = allCount;
                res.render(mod, {
                    title: channelName || "所有文章",
                    result: data,
                    channel: channelItem,
                    pages: _page
                });
           }
        };
    });
};

/**
 * path:  /manage/jobs/edit
 * 修改招聘信息提交
 */
router.post('/edit', function(req, res) {
    console.log(typeof req.body.diyType);
    var type = 3,// 数据模型：1为文章、2为项目、3为招聘
        channelId = req.body.channelId,
        title = req.body.title,
        cover = req.body.cover,
        tag = "",
        email = req.body.email || "manage@wdshare.org",// 没有填写用户时归入管理员名下

        allure = req.body.allure,
        jobbase = req.body.jobbase,
        jobmax = req.body.jobmax,
        workingLife = req.body.workingLife,
        diploma = req.body.diploma,
        jobType = req.body.jobType,
        city = req.body.city,
        address = req.body.address,
        salaryStart = req.body.salaryStart,
        salaryEnd = req.body.salaryEnd,
        contactName = req.body.contactName,
        tel = req.body.tel,
        mail = req.body.mail,
        
        content = req.body.content,
        diyType = req.body.diyType ? (typeof req.body.diyType == "string" ? req.body.diyType : req.body.diyType.join(",")) : "",// 1头条、2推荐、3加粗
        color = req.body.color,
        tpl = req.body.tpl,
        rank = req.body.rank,
        sortup = req.body.sortup == "1" ? true : false,
        click = req.body.click,
        zan = req.body.zan,
        isComment = req.body.isComment == "1" ? true : false,
        audit =  req.body.audit == "1" ? true : false,
        rejected = req.body.rejected,

        id = req.body.aid;

    if ( !title || !channelId || !allure || !jobbase || !jobmax || !workingLife || !diploma || !jobType || !city || !address || !salaryStart || !salaryEnd || !contactName || !tel || !mail || !content ) {
        res.send({
            status: 200,
            code: 0,
            message: "信息填写不完整！"
        });
        return false;
    }

    // 优化数据
    title = title.substring(0,30);
    allure = allure.substring(0,30);
    if ( isNaN(parseInt(jobbase)) ) {
        jobbase = 0;
    } else {
        jobbase = parseInt(jobbase);
    }
    if ( isNaN(parseInt(jobmax)) ) {
        jobmax = 0;
    } else {
        jobmax = parseInt(jobmax);
    }
    address = address.substring(0,50);
    if ( isNaN(parseInt(salaryStart)) ) {
        salaryStart = 0;
    } else {
        salaryStart = parseInt(salaryStart);
    }
    if ( isNaN(parseInt(salaryEnd)) ) {
        salaryEnd = 0;
    } else {
        salaryEnd = parseInt(salaryEnd);
    }
    contactName = contactName.substring(0,10);
    tel = tel.substring(0,15);
    content = content.substring(0,5000);


    usersModel.getOne({
        key: "User",
        body: {
            email: email
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

        if (!data || !data.username) {
            res.send({
                status: 200,
                code: 0,
                message: "发布者邮箱不是本站的会员，不能发布招聘信息！"
            });
            return;
        }
        var userId = data._id;

        archiveModel.update({
                _id: id
            }, {
            key: "Archive",
            body: {
                channelId:channelId,
                title: title,
                cover: cover,
                userId: userId,

                allure: allure,
                jobbase : jobbase,
                jobmax : jobmax,
                workingLife : workingLife,
                diploma : diploma,
                jobType : jobType,
                city : city,
                address : address,
                salaryStart : salaryStart,
                salaryEnd : salaryEnd,
                contactName : contactName,
                tel : tel,
                mail : mail,
                
                content: content,
                diyType: diyType,
                color: color,
                tpl: tpl,
                rank: rank,
                sortup: sortup,
                click: click,
                zan: zan,
                isComment: isComment,
                audit: audit,
                // editDate: (new Date()).getTime(),
                rejected: rejected
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
    });
});
/**
 * path:  /manage/jobs/edit/:id
 * 修改招聘信息
 */
router.get('/edit/:id', function(req, res) {
    var id = req.params.id;

    getJobChannelData({parent:1}, function(channels) {
        getJobChannelData({parent:5}, function(workingLife) {
            getJobChannelData({parent:6}, function(diploma) {
                getJobChannelData({parent:7}, function(jobType) {
                    getJobChannelData({parent:8}, function(city) {
                        archiveModel.getOne({// 读取要修改的内容信息
                            key: "Archive",
                            body: {
                                _id: id
                            }
                        }, function (err, job) {
                            if (err) {
                                res.send("服务器错误，请重试！");
                                return;
                            }

                            if ( !job ) {
                                res.send("未知错误，请重试！");
                                return false;
                            }

                            usersModel.getOne({// 获取会员信息，以便显示会员邮箱
                                key: "User",
                                body: {
                                    _id: job.userId
                                }
                            }, function (err, mamber) {
                                if (err) {
                                    res.send("服务器错误，请重试！");
                                    return;
                                }

                                // 获取企业信息
                                jobModel.getOne({
                                    key: "Companie",
                                    body: {
                                        manage: job.userId
                                    }
                                }, function (err, company) {
                                    if (err || !company) {
                                        res.send("获取企业信息出错，请重试！");
                                        return false;
                                    }
                                    res.render('manages/jobs/job_edit', {
                                        title: "修改招聘",
                                        result: job,
                                        city: city,
                                        jobType: jobType,
                                        diploma: diploma,
                                        workingLife: workingLife,
                                        channels: channels,
                                        company: company,
                                        mamber: mamber
                                    });
                                    return;
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

/**
 * path:  /manage/jobs/online/:id
 * 招聘上线
 */
router.get('/online/:id', function(req, res) {
    var id = req.params.id;

    archiveModel.getOne({
        key: "Archive",
        body: {
            _id: id
        }
    }, function (err, data) {
        if (err || !data) {
            res.send({
                status: 200,
                code: 0,
                message: "招聘信息不存在，刷新重试！"
            });
            return false;
        }

        usersModel.getOne({
            key: "User",
            body: {
                _id: data.userId
            }
        }, function (err, member) {
            if (err || !member) {
                res.send({
                    status: 200,
                    code: 0,
                    message: "会员账户发生故障！"
                });
            } else {
                if ( member.lock ) {// 被锁定账号时强退
                    req.session.user = null;
                    res.send({
                        status: 200,
                        code: 0,
                        message: "该账户被锁定！\n\n原因：" + member.lockMessage + "\n\n请联系管理员开通帐号，邮箱：manage@wdshare.org"
                    });
                    return;
                }

                action(data);
            }
        });
    });

    function action(job) {
        // 只有在招聘信息审核、未归档、下线的情况下才能上线
        if ( job.audit === true && job.garbage === true ) {
            archiveModel.update({
                    _id: id
                }, {
                key: "Archive",
                body: {
                    garbage: false
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
                    message: "上线成功！"
                });
            });
        } else {
            res.send({
                status: 200,
                code: 0,
                message: "招聘状态不合法，不能上线！"
            });
        }
        return false;
    };
});

/**
 * path:  /manage/jobs/cancel/:id
 * 招聘下线
 */
router.get('/cancel/:id', function(req, res) {
    var id = req.params.id;

    archiveModel.getOne({
        key: "Archive",
        body: {
            _id: id
        }
    }, function (err, data) {
        if (err || !data) {
            res.send({
                status: 200,
                code: 0,
                message: "招聘信息不存在，刷新重试！"
            });
            return false;
        }

        usersModel.getOne({
            key: "User",
            body: {
                _id: data.userId
            }
        }, function (err, member) {
            if (err || !member) {
                res.send({
                    status: 200,
                    code: 0,
                    message: "会员账户发生故障！"
                });
            } else {
                if ( member.lock ) {// 被锁定账号时强退
                    req.session.user = null;
                    res.send({
                        status: 200,
                        code: 0,
                        message: "该账户被锁定！\n\n原因：" + member.lockMessage + "\n\n请联系管理员开通帐号，邮箱：manage@wdshare.org"
                    });
                    return;
                }

                action(data);
            }
        });
    });

    function action(job) {
        // 只有在招聘信息审核、未归档、上线的情况下才能下线
        if ( job.audit === true && job.garbage === false ) {
            archiveModel.update({
                    _id: id
                }, {
                key: "Archive",
                body: {
                    garbage: true
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
                    message: "下线成功！"
                });
            });
        } else {
            res.send({
                status: 200,
                code: 0,
                message: "招聘状态不合法，不能下线！"
            });
        }
        return false;
    };
});


/**
 * path:  /manage/jobs/jobapply
 * 面试纪录管理列表
 */
router.get('/jobapply', function (req, res) {
    "use strict";
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getJobApplyList(req, res, {}, {page:page, pagesize:pagesize, pathname:pathname}, 'manages/jobs/job_apply');
});
/**
 * 获取面试记录
 * @param  {Object} o 限制条件
 * @param  {Object} pages 分页参数对象
 * @param  {String} mod 模板路径
 * @return
 */
function getJobApplyList(req, res, o, pages, mod) {
    jobModel.getSort({// 获取列表信息
        key: "Sent_resume",
        body:o,// 条件
        pages: pages,// 分页信息
        occupation: "addDate"// 排序字段
    }, function (err, data) {
        var allCount;
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            if ( data.length < 1 ) {// 没有数据的时候直接返回
                allCount = 0;
                gosend();
                return;
            }

            // 获取总数【用于分页】
            jobModel.getAll({
                key: "Sent_resume",
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
            return;
        }

        res.send("未知错误，请重试！");

        // 所有数据都获取完成后执行返回
        function gosend() {
           var _page = pages;
           if ( allCount >= 0 ) {
                _page.sum = allCount;
                res.render(mod, {
                    title: "我的求职纪录",
                    result: data,
                    pages: _page
                });
           }
        };
    });
};
/**
 * path:  /manage/jobs/jobapply/del/:id
 * 删除招聘纪录
 */
router.get('/jobapply/del/:id', function(req, res) {
    var id = req.params.id;
    jobModel.remove({
        key: "Sent_resume",
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
 * path:  /manage/jobs/companys
 * 招聘企业管理列表
 */
router.get('/companys', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;
    var pages = {page:page, pagesize:pagesize, pathname:pathname};

    getJobChannelData({parent:2}, function(realm) {
        getJobChannelData({parent:3}, function(scale) {
            getJobChannelData({parent:4}, function(seedtime) {
                getCompanyList(req, res, {}, pages, "manages/jobs/companys_list", "招聘企业", {
                    realm: realm,
                    scale: scale,
                    seedtime: seedtime
                });
            });
        });
    });
});
/**
 * path:  /manage/jobs/companys/del/:id
 * 删除招聘企业
 */
router.get('/companys/del/:id', function(req, res) {
    var id = req.params.id;
    jobModel.remove({
        key: "Companie",
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
 * path:  /manage/jobs/companys/edit/:id
 * 编辑招聘企业
 */
router.get('/companys/edit/:id', function(req, res) {
    var id = req.params.id;
    jobModel.getOne({
        key: "Companie",
        body: {
            _id: id
        }
    }, function (err, company) {
        if (err || !company) {
            res.send("服务器错误，请重试！");
        }
        
        getJobChannelData({parent:2}, function(realm) {
            getJobChannelData({parent:3}, function(scale) {
                getJobChannelData({parent:4}, function(seedtime) {
                    res.render('manages/jobs/com_info', {
                        title:'企业信息管理',
                        company:company,
                        realm:realm,
                        scale:scale,
                        seedtime:seedtime
                    });
                });
            });
        });
    });
});
/**
 * 修改企业信息
 */
router.post('/companys/submit', function(req, res) {
    // 检测非法字符
    var nullFlag = false;
    var nullWordsCommon = config.nullWordsCommon;
    var nullWordsCommonHTML = config.nullWordsCommonHTML;
    // 公司名称检测
    for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
        if ( req.body.name.indexOf(nullWordsCommon[i]) >= 0 ) {
            nullFlag = true;
        }
    }
    if ( nullFlag ) {
        res.send({
            status: 200,
            code: 0,
            message: "公司名称中含有非法字符！"
        });
        return false;
    }
    // 一句话简介检测
    for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
        if ( req.body.intro.indexOf(nullWordsCommon[i]) >= 0 ) {
            nullFlag = true;
        }
    }
    if ( nullFlag ) {
        res.send({
            status: 200,
            code: 0,
            message: "一句话简介中含有非法字符！"
        });
        return false;
    }
    // 公司地址检测
    for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
        if ( req.body.address.indexOf(nullWordsCommon[i]) >= 0 ) {
            nullFlag = true;
        }
    }
    if ( nullFlag ) {
        res.send({
            status: 200,
            code: 0,
            message: "公司地址中含有非法字符！"
        });
        return false;
    }
    // 公司主页检测
    for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
        if ( req.body.www.indexOf(nullWordsCommon[i]) >= 0 ) {
            nullFlag = true;
        }
    }
    if ( nullFlag ) {
        res.send({
            status: 200,
            code: 0,
            message: "公司主页中含有非法字符！"
        });
        return false;
    }
    // 联系人检测
    for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
        if ( req.body.contactName.indexOf(nullWordsCommon[i]) >= 0 ) {
            nullFlag = true;
        }
    }
    if ( nullFlag ) {
        res.send({
            status: 200,
            code: 0,
            message: "联系人中含有非法字符！"
        });
        return false;
    }
    // 联系电话检测
    for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
        if ( req.body.tel.indexOf(nullWordsCommon[i]) >= 0 ) {
            nullFlag = true;
        }
    }
    if ( nullFlag ) {
        res.send({
            status: 200,
            code: 0,
            message: "联系电话中含有非法字符！"
        });
        return false;
    }
    // 联系邮箱检测
    for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
        if ( req.body.mail.indexOf(nullWordsCommon[i]) >= 0 ) {
            nullFlag = true;
        }
    }
    if ( nullFlag ) {
        res.send({
            status: 200,
            code: 0,
            message: "联系邮箱中含有非法字符！"
        });
        return false;
    }
    // 公司产品检测
    for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
        if ( req.body.product.indexOf(nullWordsCommon[i]) >= 0 ) {
            nullFlag = true;
        }
    }
    if ( nullFlag ) {
        res.send({
            status: 200,
            code: 0,
            message: "公司产品中含有非法字符！"
        });
        return false;
    }
    // 公司简介检测
    for ( var i=0,l=nullWordsCommonHTML.length; i<l; i++ ) {
        if ( req.body.content.indexOf(nullWordsCommonHTML[i]) >= 0 ) {
            nullFlag = true;
        }
    }
    if ( nullFlag ) {
        res.send({
            status: 200,
            code: 0,
            message: "公司简介中含有非法字符！"
        });
        return false;
    }
    // TAG内容检测
    for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
        if ( req.body.tag.indexOf(nullWordsCommon[i]) >= 0 ) {
            nullFlag = true;
        }
    }
    if ( nullFlag ) {
        res.send({
            status: 200,
            code: 0,
            message: "TAG中含有非法字符！"
        });
        return false;
    }
    


    action();

    function action() {
        var manage = req.session.user._id,
            name = req.body.name,
            intro = req.body.intro,
            realm = [],
            scale = req.body.scale,
            seedtime = req.body.seedtime,
            address = req.body.address,
            www = req.body.www,
            contactName = req.body.contactName,
            tel = req.body.tel,
            mail = req.body.mail,
            tag = req.body.tag,
            tpl = req.body.tpl,
            product = req.body.product,
            content = req.body.content,
            click = 0,
            audit = req.body.audit == 1 ? true : false,
            id = req.body.aid;

        if ( typeof req.body.realm == "string" ) {
            realm.push(req.body.realm);
        } else {
            for (var i=0; i<3; i++) {
                if ( req.body.realm[i] ) {
                    realm.push(req.body.realm[i]);
                }
            }
        }
        realm = realm.join(",");
        
        if ( !name ) {
            res.send({
                status: 200,
                code: 0,
                message: "企业名称必须填写！"
            });
            return false;
        }
        if ( !realm ) {
            res.send({
                status: 200,
                code: 0,
                message: "公司领域必须选择！"
            });
            return false;
        }
        if ( !scale ) {
            res.send({
                status: 200,
                code: 0,
                message: "公司规模必须选择！"
            });
            return false;
        }
        if ( !seedtime ) {
            res.send({
                status: 200,
                code: 0,
                message: "发展阶段必须选择！"
            });
            return false;
        }
        if ( !address ) {
            res.send({
                status: 200,
                code: 0,
                message: "公司地址必须填写！"
            });
            return false;
        }
        if ( !contactName ) {
            res.send({
                status: 200,
                code: 0,
                message: "联系人必须填写！"
            });
            return false;
        }
        if ( !tel ) {
            res.send({
                status: 200,
                code: 0,
                message: "联系电话必须填写！"
            });
            return false;
        }
        if ( !mail ) {
            res.send({
                status: 200,
                code: 0,
                message: "联系邮箱必须填写！"
            });
            return false;
        }

        if ( !content ) {
            res.send({
                status: 200,
                code: 0,
                message: "公司简介必须填写！"
            });
            return false;
        }

        // 数据内容检测是否合格
        name = name.substring(0,20);
        if ( intro ) {
            intro = intro.substring(0,50);
        }
        address = address.substring(0,50);
        if ( www ) {
            www = www.substring(0,100);
        }
        contactName = contactName.substring(0,10);
        tel = tel.substring(0,15);
        mail = mail.substring(0,30);
        if ( product ) {
            product = product.substring(0,500);
        }
        content = content.substring(0,5000);

        var tagArray = tag.split(",");
        if ( tagArray.length > 10 ) {
            res.send({
                status: 200,
                code: 0,
                message: "标签个数不能大于10个"
            });
            return false;
        }

        if ( tagArray.length > 0 ) {
            var tagMaxFontCount = false;
            for ( var i=0,l=tagArray.length; i<l; i++ ) {
                if ( tagArray[i].length > 15 ) {
                    tagMaxFontCount = true;
                }
            }
            if ( tagMaxFontCount ) {
                res.send({
                    status: 200,
                    code: 0,
                    message: "单个标签字数不能大于15"
                });
                return false;
            }
        }

        if ( www.indexOf("http://") < 0 && www.indexOf("https://") < 0 ) {
            www = "http://" + www;
        }

        if ( www == "http://" ) {
            www = "";
        }

        // tag内容进行优化
        // 避免两个重复的逗号
        tag = tag.replace(/,,/g, ",");
        // 最后一个字符为逗号时清除掉
        if ( tag.lastIndexOf(",") == tag.length-1 ) {
            tag = tag.substring(0, tag.lastIndexOf(","));
        }

        jobModel.update({
                _id: id
            }, {
            key: "Companie",
            body: {
                name: name,
                intro: intro,
                realm: realm,
                scale: scale,
                www: www,
                seedtime: seedtime,
                address: address,
                contactName: contactName,
                tel: tel,
                mail: mail,
                tag: tag,
                tpl: tpl,
                product: product,
                content: content,
                audit: audit,
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
            tagsCheck(tag);
        });
    };
    
    // 对标签进行检查，存在的增加计数，不存在的添加
    function tagsCheck(tags) {
        var tags = tags.split(",");
        for ( var i=0,l=tags.length; i<l; i++ ) {
            (function(i) {
                var count;
                // 获取翻个标签，检查是否存在
                tagModel.getOne({
                    key: "Tag",
                    body: {
                        name: tags[i],
                        model: "job"
                    }
                }, function (err, data) {
                    if (err) {
                        res.send("服务器错误，请重试！");
                        return;
                    }
                    
                    if ( data && data.name ) {// 存在
                        count = data.level + 1;
                        tagModel.update({
                            name: data.name,
                            model: "job"
                        }, {
                            key: "Tag",
                            body: {
                                level: count,
                                editDate: (new Date()).getTime()
                            }
                        }, function (err, data) {});
                    } else {// 不存在
                        if ( !tags[i] ) {
                            return;
                        }
                        count = 1;
                        tagModel.save({
                            key: "Tag",
                            body: {
                                name: tags[i],
                                level: count,
                                model: "job",
                                addDate: (new Date()).getTime(),
                                editDate: (new Date()).getTime()
                            }
                        }, function (err, data) {});
                    }
                    return;
                });
            })(i);
        }
    };
});
/**
 * 获取企业列表内容
 * @param  {Object} o 限制条件
 * @param  {Object} pages 分页参数对象
 * @param  {String} mod 模板路径
 * @param  {String} channelName 分类名称
 * @return
 */
function getCompanyList(req, res, o, pages, mod, channelName, relyData) {
    jobModel.getSort({
        key: "Companie",
        body:o,// 筛选内容
        pages: pages,// 分页信息
        occupation: "addDate"// 排序字段
    }, function (err, data) {
        var userCount = 0,
            allCount;
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            for ( var i=0; i<data.length; i++ ) {
                (function(i) {
                    var realmData = [];
                    // 转化企业领域为汉字
                    for ( var x=0; x<relyData.realm.length; x++ ) {
                        var thisid = relyData.realm[x]._id;
                        if ( data[i].realm.indexOf(thisid) > -1 ) {
                            realmData.push(relyData.realm[x].name);
                        }
                    }
                    data[i].realmName = realmData.join("、");
                    // 转化企业规模为汉字
                    for ( var j=0; j<relyData.scale.length; j++ ) {
                        if ( relyData.scale[j]._id == data[i].scale ) {
                            data[i].scaleName = relyData.scale[j].name;
                        }
                    }
                    // 转化发展阶段为汉字
                    for ( var k=0; k<relyData.seedtime.length; k++ ) {
                        if ( relyData.seedtime[k]._id == data[i].seedtime ) {
                            data[i].seedtimeName = relyData.seedtime[k].name;
                        }
                    }
                    
                    
                    // 获取用户信息
                    usersModel.getOne({
                        key: "User",
                        body: {
                            _id: data[i].manage
                        }
                    }, function (err, user) {
                        if (err) {
                            res.send("服务器错误，请重试！");
                            return;
                        }
                        data[i].user = user || {};
                        userCount++;
                        gosend();
                        return;
                    });
                })(i);
            }

            // 获取总数
            jobModel.getAll({
                key: "Companie",
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

            return;
        }

        res.send("未知错误，请重试！");

        // 所有数据都获取完成后执行返回
        function gosend() {
           var _page = pages;
           if ( userCount == data.length && allCount >= 0 ) {
                _page.sum = allCount;
                res.render(mod, {
                    title: channelName || "招聘企业",
                    result: data,
                    pages: _page
                });
           }
        };
    });
};

/**
 * 获取招聘分类数据
 * @param  {Object} o 筛选对象
 * @param  {Function} callback 查询完的回调
 */
function getJobChannelData(o, callback) {
    jobModel.getSort({
        key: "Job_channel",
        body:o,// 筛选条件
        pages:{page:1, pagesize:1000, pathname:""}, // 分页信息
        occupation: "order"// 排序字段
    }, function (err, data) {
        var items = data;
        if (err || !data) {
            items = [];
        }
        
        if ( callback ) {
            callback(items);
        }
    });
};


/**
 * path:  /manage/jobs/channel
 * 获取招聘所有分类
 */
router.get('/channel', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getChannelList(req, res, {}, {page:page, pagesize:pagesize, pathname:pathname}, 'manages/jobs/job_channel_list', "所有分类");
});

/**
 * path:  /manage/jobs/channel/list/:id
 * 
 * 获取招聘归属分类
 */
router.get('/channel/list/:id', function(req, res) {
    var id = req.params.id,
        urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getChannelList(req, res, {parent:id}, {page:page, pagesize:pagesize, pathname:pathname}, 'manages/jobs/job_channel_list', "所有分类");
});

/**
 * 获取分类列表内容
 * @param  {Object} o 限制条件
 * @param  {Object} pages 分页参数对象
 * @param  {String} mod 模板路径
 * @param  {String} channelName 分类名称
 * @return
 */
function getChannelList(req, res, o, pages, mod, channelName) {
    jobModel.getSort({
        key: "Job_channel",
        body:o,// 仅读取文章类型的档案
        pages:pages, // 分页信息
        occupation: "order"// 排序字段
    }, function (err, data) {
        var allCount;
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            // 获取总数【用于分页】
            jobModel.getAll({// 查询分类，为添加文章做准备
                key: "Job_channel",
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

            return;
        }

        res.send("未知错误，请重试！");

        // 所有数据都获取完成后执行返回
        function gosend() {
           var _page = pages;
            _page.sum = allCount;
            res.render(mod, {
                title: channelName || "所有分类",
                result: data,
                pages:_page
            });
        };
    });
};

/**
 * path:  /manage/jobs/channel/create
 * 添加招聘分类
 */
router.get('/channel/create', function(req, res) {
    jobModel.getAll({
        key: "Job_channel"
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/jobs/job_channel_create', {
                title: "添加招聘分类",
                result: data
            });
            return;
        }

        res.send("未知错误，请重试！");
    });
});
// 修改和添加共用
router.post('/channel/create', function(req, res) {
    var parent = req.body.parent,
        name = req.body.name,
        order = parseInt(req.body.order),
        description = req.body.description,
        id = req.body.aid;

    if ( isNaN(order) ) {
        order = 0;
    }
    if ( id ) {// 修改
        jobModel.update({
                _id: id
            }, {
            key: "Job_channel",
            body: {
                name: name,
                parent: parent,
                order: order,
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
        jobModel.getOne({
            key: "Job_channel",
            body: {
                parent: parent,
                name: name
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

            if (data && data.name) {
                res.send({
                    status: 200,
                    code: 0,
                    message: "该分类已存在！"
                });
                return;
            }

            jobModel.save({
                key: "Job_channel",
                body: {
                    name: name,
                    parent: parent,
                    order: order,
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
 * path:  /manage/jobs/channel/edit/:id
 * 修改招聘分类
 */
router.get('/channel/edit/:id', function(req, res) {
    var id = req.params.id;
    jobModel.getOne({
        key: "Job_channel",
        body: {
            _id: id
        }
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/jobs/job_channel_edit', {
                title: "修改招聘分类",
                result: data
            });
            return;
        }

        res.send("未知错误，请重试！");

    });
});

/**
 * path:  /manage/jobs/channel/del/:id
 * 删除招聘分类
 */
router.get('/channel/del/:id', function(req, res) {
    var id = req.params.id;
    jobModel.remove({
        key: "Job_channel",
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

module.exports = router;
