var express = require('express'),
    fs = require('fs'),
    path = require('path'),
    sendMail = require("../server/sendMail.js"),
    router = express.Router(),
    init = require("../server/init.js"),
    authorize = init.authorize,
    goBack = init.goBack,
    crypto = require('crypto'),
    moment = require("moment"),
    config = require("../server/config"),
    URL = require('url');

/**
 * path:  /jobs
 * 获取所有招聘
 */
router.get('/', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;

    var workingLife,
        diploma,
        jobType,
        city,
        companys;

    var channelCompany = urlParams.company,
        filter = {type:3, audit:true, garbage:false};
    if ( channelCompany ) {
        filter.companys = channelCompany;
    }

    getJobChannelCon();

    /**
     * 获取招聘相关分类信息
     */
    function getJobChannelCon() {
        getJobChannelData({parent:5}, function(_workingLife) {
            getJobChannelData({parent:6}, function(_diploma) {
                getJobChannelData({parent:7}, function(_jobType) {
                    getJobChannelData({parent:8}, function(_city) {
                        workingLife = _workingLife;
                        diploma = _diploma;
                        jobType = _jobType;
                        city = _city;
                        getList();
                    });
                });
            });
        });
    };

    /**
     * 获取本人招聘列表
     */
    function getList() {
        getJobList(
            req,
            res,
            filter,
            {page:page, pagesize:pagesize, pathname:pathname},
            'jobs/job_list',
            '技术招聘',
            '前端招聘,前端工程师招聘,前端开发招聘,手机前端开发招聘,移动端开发招聘,JS招聘,JavaScript招聘',
            '西安本地的技术招聘发布平台，汇集西安本地的高新技术型人才',
            {
                workingLife: workingLife,
                diploma: diploma,
                jobType: jobType,
                city: city
            }
        );
    };
});

/**
 * 获取招聘列表内容
 * @param  {Object} o 限制条件
 * @param  {String} mod 模板路径
 * @return
 */
function getJobList(req, res, o, pages, mod, channelName, channelKeywords, channelDescription, relyData) {
    archiveModel.getSort({
        key: "Archive",
        body:o,// 仅读取文章类型的档案
        pages:pages, // 分页信息
        occupation: {"sortup":-1, "rank":-1, "editDate":-1}// 排序字段
    }, function (err, data) {
        var channelCount = 0,
            userCount = 0,
            companieCount = 0,
            allCount;
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
            for ( var i=0; i<data.length; i++ ) {
                (function(i) {
                    // 转化工作年限为汉字
                    for ( var j=0; j<relyData.workingLife.length; j++ ) {
                        if ( relyData.workingLife[j]._id == data[i].workingLife ) {
                            data[i].workingLifeName = relyData.workingLife[j].name;
                        }
                    }
                    // 转化学历为汉字
                    for ( var k=0; k<relyData.diploma.length; k++ ) {
                        if ( relyData.diploma[k]._id == data[i].diploma ) {
                            data[i].diplomaName = relyData.diploma[k].name;
                        }
                    }
                    // 转化招聘类型为汉字
                    for ( var y=0; y<relyData.jobType.length; y++ ) {
                        if ( relyData.jobType[y]._id == data[i].jobType ) {
                            data[i].jobTypeName = relyData.jobType[y].name;
                        }
                    }
                    // 转化城市为汉字
                    for ( var z=0; z<relyData.city.length; z++ ) {
                        if ( relyData.city[z]._id == data[i].city ) {
                            data[i].cityName = relyData.city[z].name;
                        }
                    }


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
                            data[i].channel = channelData.name;
                            data[i].channelUrl = channelData.url;
                            channelCount++;
                            gosend();
                            return;
                        }
                        res.send("未知错误，请重试！");
                    });

                    // 获取企业信息
                    getCompanys(data[i].companys, function(company) {
                        data[i].company = company;
                        companieCount++;
                        gosend();
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
                            data[i].userId = userData._id;
                        } else {
                            data[i].user = "";
                            data[i].userId = "";
                        }
                        userCount++;
                        gosend();
                        return;
                    });
                })(i);
            }

            // 获取总数【用于分页】
            archiveModel.getAll({// 查询分类，为添加文章做准备
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

            return;
        }

        res.send("未知错误，请重试！");


        // 所有数据都获取完成后执行返回
        function gosend() {
            var _page = pages;
            if ( channelCount == data.length && companieCount == data.length && userCount == data.length && allCount >= 0 ) {
                _page.sum = allCount;
                res.render(mod, {
                    title: channelName || "技术招聘",
                    result: data,
                    pages:_page,
                    keywords: channelKeywords,
                    description: channelDescription
                });
           }
        };
    });
};
/**
 * 获取跟id关联企业信息
 */
function getCompanys(id, callback) {
    jobModel.getOne({
        key: "Companie",
        body: {
            _id: id
        }
    }, function (err, _companys) {
        if (err || !_companys) {// 企业信息不存在
            res.send("服务器错误，请重试！");
        } else {// 已存在
            getJobChannelData({parent:2}, function(realm) {
                getJobChannelData({parent:3}, function(scale) {
                    getJobChannelData({parent:4}, function(seedtime) {
                        var realmData = [];
                        // 转化企业领域为汉字
                        for ( var x=0; x<realm.length; x++ ) {
                            var thisid = realm[x]._id;
                            if ( _companys.realm.indexOf(thisid) > -1 ) {
                                realmData.push(realm[x].name);
                            }
                        }
                        _companys.realmName = realmData.join(" · ");
                        // 转化企业规模为汉字
                        for ( var j=0; j<scale.length; j++ ) {
                            if ( scale[j]._id == _companys.scale ) {
                                _companys.scaleName = scale[j].name;
                            }
                        }
                        // 转化发展阶段为汉字
                        for ( var k=0; k<seedtime.length; k++ ) {
                            if ( seedtime[k]._id == _companys.seedtime ) {
                                _companys.seedtimeName = seedtime[k].name;
                            }
                        }
                        callback(_companys);
                    });
                });
            });
        }
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
 * path:  /jobs/create
 * 添加招聘
 */
router.get('/create', function(req, res) {
    "use strict";
    if (!req.session.user) {
        res.redirect("/user/login");
        return false;
    }
    // 未激活用户不允许进入
    if (!req.session.user.isActive) {
        res.redirect("/user/activeAccount");
        return false;
    }

    // 先看信息是否完整
    checkUserInfo(function() {
        checkCompanys(function(company) {
            showAdd(company);
        });
    });

    // 检查信息是否完成
    function checkUserInfo(callback) {
        usersInfosModel.getOne({
            key: "User_info",
            body: {
                userid: req.session.user._id
            }
        }, function (err, data) {
            if (err || !data) {
                res.render('users/empty', {title:'发布招聘信息提示', content:'先完善个人信息后才有权限添加招聘内容。<br /><a href="/user/editInfo">点击完善信息</a>'});
                return false;
            }
            
            if ( callback ) {
                callback(data);
            }
        });
    };

    // 检查信息是否存在企业信息
    function checkCompanys(callback) {
        jobModel.getOne({
            key: "Companie",
            body: {
                manage: req.session.user._id
            }
        }, function (err, data) {
            if (err || !data) {
                res.redirect("/jobs/company-error");
                return false;
            }
            
            if ( callback ) {
                callback(data);
            }
        });
    };

    // 显示发布招聘内容
    function showAdd(company) {
        getJobChannelData({parent:1}, function(channels) {
            getJobChannelData({parent:5}, function(workingLife) {
                getJobChannelData({parent:6}, function(diploma) {
                    getJobChannelData({parent:7}, function(jobType) {
                        getJobChannelData({parent:8}, function(city) {
                            var captcha = false;
                                
                            if ( req.session.addJobIsShowCaptcha && req.session.addJobIsShowCaptcha >= config.isShowCaptcha ) {// 显示验证码
                                captcha = true;
                            } else {
                                // 不显示验证码时需要清空验证码session
                                req.session.captcha = null;
                            }
                            res.render('jobs/job_create', {
                                title: "添加招聘",
                                captcha: captcha,
                                city: city,
                                jobType: jobType,
                                diploma: diploma,
                                workingLife: workingLife,
                                channels: channels,
                                company: company
                            });
                        });
                    });
                });
            });
        });
    };
});
// 修改和添加共用
router.post('/create', function(req, res) {
    var code = req.body.code;

    if (!req.session.user) {
        res.redirect("/user/login");
        return false;
    }
    // 未激活用户不允许进入
    if (!req.session.user.isActive) {
        res.redirect("/user/activeAccount");
        return false;
    }

    // 验证码错误
    if ( req.session.addJobIsShowCaptcha >= config.isShowCaptcha ) {//需要检查验证码的正确性
        if ( !code ) {
            res.send({
                status: 200,
                code: 0,
                message: "请输入验证码！",
                reload: true
            });
            return false;
        }
        if ( !req.session.captcha ) {
            res.send({
                status: 200,
                code: 0,
                message: "系统出现异常，请稍后再试！"
            });
            return false;
        }
        if (code.toUpperCase() != req.session.captcha.toUpperCase() ) {
            res.send({
                status: 200,
                code: 0,
                message: "验证码错误，请重试！"
            });
            return false;
        }
    }


    // 检测非法字符
    var nullFlag = false;
    var nullWordsCommon = config.nullWordsCommon;
    var nullWordsCommonHTML = config.nullWordsCommonHTML;
    // 招聘标题检测
    for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
        if ( req.body.title.indexOf(nullWordsCommon[i]) >= 0 ) {
            nullFlag = true;
        }
    }
    if ( nullFlag ) {
        res.send({
            status: 200,
            code: 0,
            message: "标题中含有非法字符！"
        });
        return false;
    }
    // 职位诱惑检测
    for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
        if ( req.body.allure.indexOf(nullWordsCommon[i]) >= 0 ) {
            nullFlag = true;
        }
    }
    if ( nullFlag ) {
        res.send({
            status: 200,
            code: 0,
            message: "职位诱惑中含有非法字符！"
        });
        return false;
    }
    // 工作地址检测
    for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
        if ( req.body.address.indexOf(nullWordsCommon[i]) >= 0 ) {
            nullFlag = true;
        }
    }
    if ( nullFlag ) {
        res.send({
            status: 200,
            code: 0,
            message: "工作地址含有非法字符！"
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
    // 职位描述检测
    for ( var i=0,l=nullWordsCommonHTML.length; i<l; i++ ) {
        if ( req.body.content.indexOf(nullWordsCommonHTML[i]) >= 0 ) {
            nullFlag = true;
        }
    }
    if ( nullFlag ) {
        res.send({
            status: 200,
            code: 0,
            message: "职位描述中含有非法字符！"
        });
        return false;
    }
    

    // 记录该用提交的次数
    if ( req.session.addJobIsShowCaptcha ) {
        req.session.addJobIsShowCaptcha++;
    } else {
        req.session.addJobIsShowCaptcha = 1;
    }

    usersModel.getOne({
        key: "User",
        body: {
            _id: req.session.user._id
        }
    }, function (err, member) {
        
        // 通过验证请求时清空验证码session
        req.session.captcha = null;

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

            jobModel.getOne({
                key: "Companie",
                body: {
                    manage: req.session.user._id
                }
            }, function (err, company) {
                if (err || !company) {
                    res.send({
                        status: 200,
                        code: 0,
                        message: "您的企业信息不存在，请先添加企业信息！"
                    });
                    return false;
                }

                // 企业信息未审核时禁止发布招聘信息
                if ( !company.audit ) {
                    res.send({
                        status: 200,
                        code: 0,
                        message: "您的企业信息未审核，请联系管理员审核后再发布招聘！"
                    });
                    return false;
                }
                
                // 不是自己的招聘不能修改
                if ( req.body.aid ) {
                    archiveModel.getOne({
                        key: "Archive",
                        body: {
                            _id: req.body.aid
                        }
                    }, function (err, data) {
                        if (err || !data) {
                            res.send({
                                status: 200,
                                code: 0,
                                message: "招聘内容不存在，请刷新后重新修改！"
                            });
                            return false;
                        }

                        if (data.userId != req.session.user._id) {
                            res.send({
                                status: 200,
                                code: 0,
                                message: "您无权修改此招聘！"
                            });
                            return false;
                        }
                        
                        action(company);
                    });
                } else {
                    action(company);
                }
            });
        }
    });

    function action(company) {
        var type = 3,// 数据模型：1为文章、2为项目、3为招聘
            channelId = req.body.channelId,
            title = req.body.title,
            cover = "",
            tag = "",
            userId = req.session.user._id,

            allure = req.body.allure,
            jobbase = req.body.jobbase,
            jobmax = req.body.jobmax,
            workingLife = req.body.workingLife,
            diploma = req.body.diploma,
            jobType = req.body.jobType,
            city = req.body.city,
            address = req.body.address || company.address,
            mapLng = req.body.mapLng,
            mapLat = req.body.mapLat,
            mapZoom = req.body.mapZoom,
            salaryStart = req.body.salaryStart,
            salaryEnd = req.body.salaryEnd,
            contactName = req.body.contactName || company.contactName,
            tel = req.body.tel || company.tel,
            mail = req.body.mail || company.mail,

            content = req.body.content,
            diyType = "",// 1头条、2推荐、3加粗
            color = "",
            tpl = "",
            rank = 0,
            sortup = false,
            click = 0,
            zan = 0,
            isComment = true,
            audit = false,
            vip = false,
        
            id = req.body.aid;

        if ( !title || !channelId || !allure || !jobbase || !jobmax || !workingLife || !diploma || !jobType || !city || !address || !salaryStart || !salaryEnd || !contactName || !tel || !mail || !content ) {
            res.send({
                status: 200,
                code: 0,
                message: "信息填写不完整！"
            });
            return false;
        }

        if ( !mapLng || !mapLat || !mapZoom ) {
            res.send({
                status: 200,
                code: 0,
                message: "地图信息不完整请选择地图坐标！"
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


        // 检查是否为vip会员并拥有招聘信息发布无限制权限
        if ( req.session.user.vip && req.session.user.vip.indexOf("job_send") >= 0 ) {
            vip = true;
            if ( req.body.audit && req.body.audit == 1 ) {
                audit = true;
            }
        }

        if ( id ) {// 修改
            archiveModel.update({
                    _id: id
                }, {
                key: "Archive",
                body: {
                    channelId:channelId,
                    title: title,
                    allure: allure,
                    jobbase: jobbase,
                    jobmax: jobmax,
                    workingLife: workingLife,
                    diploma: diploma,
                    jobType: jobType,
                    city: city,
                    address: address,
                    mapLng:mapLng,
                    mapLat:mapLat,
                    mapZoom:mapZoom,
                    salaryStart: salaryStart,
                    salaryEnd: salaryEnd,
                    contactName: contactName,
                    tel: tel,
                    mail: mail,
                    content: content,
                    editDate: (new Date()).getTime(),
                    audit: audit,
                    rejected: ""
                }
            }, function (err, data) {
                if (err) {
                    res.send({
                        status: 200,
                        code: 0,
                        message: err
                    });
                }
                // 发送邮件通知管理员[VIP会员无需发送邮件]
                if ( !vip ) {
                    sendJobChangeMail(req, res, "修改", title);
                }
                var msg = "修改成功！招聘信息进入审核状态，审核后显示在官网";
                if ( vip ) {
                    msg = "修改成功！";
                }
                res.send({
                    status: 200,
                    code: 1,
                    message: msg
                });
            });
        } else {// 添加
            archiveModel.save({
                key: "Archive",
                body: {
                    type: type,
                    channelId:channelId,
                    title: title,
                    diyType: diyType,
                    color: color,
                    cover: cover,
                    content: content,
                    tpl: tpl,
                    tag: tag,
                    rank: rank,
                    sortup: sortup,
                    addDate: (new Date()).getTime(),
                    editDate: (new Date()).getTime(),
                    click: click,
                    userId: userId,
                    zan: zan,
                    isComment: isComment,
                    audit: audit,

                    allure: allure,
                    jobbase: jobbase,
                    jobmax: jobmax,
                    workingLife: workingLife,
                    diploma: diploma,
                    jobType: jobType,
                    city: city,
                    address: address,
                    mapLng:mapLng,
                    mapLat:mapLat,
                    mapZoom:mapZoom,
                    salaryStart: salaryStart,
                    salaryEnd: salaryEnd,
                    contactName: contactName,
                    tel: tel,
                    mail: mail,
                    garbage: false,
                    companys: company._id
                }
            }, function (err, data) {
                if (err) {
                    res.send({
                        status: 200,
                        code: 0,
                        message: err
                    });
                }
                // 发送邮件通知管理员[VIP会员无需发送邮件]
                if ( !vip ) {
                    sendJobChangeMail(req, res, "添加", title);
                }
                var msg = "添加成功！审核后才会出现在官网";
                if ( vip ) {
                    msg = "添加成功！";
                }
                res.send({
                    status: 200,
                    code: 1,
                    message: msg
                });
            });
        }
    };
});
/**
 * path:  /jobs/edit/:id
 * 修改招聘信息
 */
router.get('/edit/:id', function(req, res) {
    if (!req.session.user) {
        res.redirect("/user/login");
        return false;
    }
    // 未激活用户不允许进入
    if (!req.session.user.isActive) {
        res.redirect("/user/activeAccount");
        return false;
    }
    var id = req.params.id;

    // 先看会员信息是否完整
    checkUserInfo(function() {
        checkCompanys(function(company) {
            showAdd(company);
        });
    });

    // 检查会员信息是否完成
    function checkUserInfo(callback) {
        usersInfosModel.getOne({
            key: "User_info",
            body: {
                userid: req.session.user._id
            }
        }, function (err, data) {
            if (err || !data) {
                res.render('users/empty', {title:'修改招聘信息提示', content:'先完善个人信息后才有权限修改招聘内容。<br /><a href="/user/editInfo">点击完善信息</a>'});
                return false;
            }
            
            if ( callback ) {
                callback(data);
            }
        });
    };

    // 检查信息是否存在企业信息
    function checkCompanys(callback) {
        jobModel.getOne({
            key: "Companie",
            body: {
                manage: req.session.user._id
            }
        }, function (err, data) {
            if (err || !data) {
                res.redirect("/jobs/companys");
                return false;
            }
            
            if ( callback ) {
                callback(data);
            }
        });
    };

    // 显示修改招聘内容
    function showAdd(company) {
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

                                // 不是自己的招聘不能编辑
                                if (job && job.userId == req.session.user._id) {
                                    var captcha = false;
                            
                                    if ( req.session.addJobIsShowCaptcha && req.session.addJobIsShowCaptcha >= config.isShowCaptcha ) {// 显示验证码
                                        captcha = true;
                                    } else {
                                        // 不显示验证码时需要清空验证码session
                                        req.session.captcha = null;
                                    }
                                    res.render('jobs/job_edit', {
                                        title: "修改招聘",
                                        captcha: captcha,
                                        job: job,
                                        city: city,
                                        jobType: jobType,
                                        diploma: diploma,
                                        workingLife: workingLife,
                                        channels: channels,
                                        company: company
                                    });
                                    return;
                                } else {
                                    res.render('jobs/job_edit', {
                                        title: "修改招聘信息",
                                        error: "权限不足或其他错误"
                                    });
                                    return;
                                }
                            });
                        });
                    });
                });
            });
        });
    };
});
/**
 * 招聘被添加或修改后邮件通知管理员
 * @param  {String} user  会员昵称
 * @param  {String} state 修改还是添加
 * @param  {String} title 招聘标题
 * @return
 */
function sendJobChangeMail(req, res, state, title) {
    sendMail({
        from: config.mail.sendMail,
        to: "manage@wdshare.org",//需要通知的管理员邮箱
        subject: "[招聘-需审批]"+req.session.user.username +" "+ state +" 《"+ title +"》",
        html: '管理员，你好：<br /> 会员【' + req.session.user.username + "】 刚才 " + state +"了 《"+ title +"》，请尽快进行审批。"
    });
};

/**
 * path:  /jobs/refresh/:id
 * 刷新招聘信息
 */
router.get('/refresh/:id', function(req, res) {
    if (!req.session.user) {
        res.redirect("/user/login");
        return false;
    }
    // 未激活用户不允许进入
    if (!req.session.user.isActive) {
        res.redirect("/user/activeAccount");
        return false;
    }
    var id = req.params.id;

    usersModel.getOne({
        key: "User",
        body: {
            _id: req.session.user._id
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

                // 查看企业信息是否符合标准
                jobModel.getOne({
                    key: "Companie",
                    body: {
                        _id: data.companys
                    }
                }, function (err, company) {
                    if (err || !company) {
                        res.send({
                            status: 200,
                            code: 0,
                            message: "企业信息不存在，不能操作招聘信息！"
                        });
                        return false;
                    }

                    // 企业信息未审核时禁止发布招聘信息
                    if ( !company.audit ) {
                        res.send({
                            status: 200,
                            code: 0,
                            message: "您的企业信息未审核，请联系管理员审核后再操作招聘！"
                        });
                        return false;
                    }
                    
                    // 不是自己的招聘不能操作
                    if (data.userId != req.session.user._id) {
                        res.send({
                            status: 200,
                            code: 0,
                            message: "您无权修改此招聘！"
                        });
                        return false;
                    } else {
                        action(data);
                    }
                });
            });
        }
    });

    function action(job) {
        // 只有在招聘信息审核、未归档、上线的情况下才能刷新
        if ( job.audit === true && job.garbage === false ) {
            // 每天内只能刷新一次限制
            var lastRefreshTIme = (new Date()).getTime() - job.editDate;
            if ( lastRefreshTIme < 1000*60*60*12 ) {
                res.send({
                    status: 200,
                    code: 0,
                    message: "每12小时只能刷新一次，请"+ (12-Math.floor(lastRefreshTIme/(1000*60*60))) +"小时后再来！"
                });
                return false;
            }
            archiveModel.update({
                    _id: id
                }, {
                key: "Archive",
                body: {
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
                    message: "刷新成功！"
                });
            });
        } else {
            res.send({
                status: 200,
                code: 0,
                message: "招聘状态不合法，不能刷新！"
            });
        }
        return false;
    };
});

/**
 * path:  /jobs/online/:id
 * 招聘上线
 */
router.get('/online/:id', function(req, res) {
    if (!req.session.user) {
        res.redirect("/user/login");
        return false;
    }
    // 未激活用户不允许进入
    if (!req.session.user.isActive) {
        res.redirect("/user/activeAccount");
        return false;
    }
    var id = req.params.id;

    usersModel.getOne({
        key: "User",
        body: {
            _id: req.session.user._id
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

                // 查看企业信息是否符合标准
                jobModel.getOne({
                    key: "Companie",
                    body: {
                        _id: data.companys
                    }
                }, function (err, company) {
                    if (err || !company) {
                        res.send({
                            status: 200,
                            code: 0,
                            message: "企业信息不存在，不能操作招聘信息！"
                        });
                        return false;
                    }

                    // 企业信息未审核时禁止发布招聘信息
                    if ( !company.audit ) {
                        res.send({
                            status: 200,
                            code: 0,
                            message: "您的企业信息未审核，请联系管理员审核后再操作招聘！"
                        });
                        return false;
                    }
                    
                    // 不是自己的招聘不能操作
                    if (data.userId != req.session.user._id) {
                        res.send({
                            status: 200,
                            code: 0,
                            message: "您无权修改此招聘！"
                        });
                        return false;
                    } else {
                        action(data);
                    }
                });
            });
        }
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
 * path:  /jobs/cancel/:id
 * 招聘下线
 */
router.get('/cancel/:id', function(req, res) {
    if (!req.session.user) {
        res.redirect("/user/login");
        return false;
    }
    // 未激活用户不允许进入
    if (!req.session.user.isActive) {
        res.redirect("/user/activeAccount");
        return false;
    }
    var id = req.params.id;

    usersModel.getOne({
        key: "User",
        body: {
            _id: req.session.user._id
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
                
                // 不是自己的招聘不能操作
                if (data.userId != req.session.user._id) {
                    res.send({
                        status: 200,
                        code: 0,
                        message: "您无权修改此招聘！"
                    });
                    return false;
                } else {
                    action(data);
                }
            });
        }
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
 * path:  /jobs/company-error
 * 企业信息不存在时的过渡页面
 */
router.get('/company-error', function(req, res) {
    "use strict";
    if (!req.session.user) {
        res.redirect("/user/login");
        return false;
    }
    // 未激活用户不允许进入
    if (!req.session.user.isActive) {
        res.redirect("/user/activeAccount");
        return false;
    }

    res.render('users/empty', {title:'招聘信息发布提示', content:'您还没有创建企业信息，创建企业信息后才可以发布招聘职位，<a href="/jobs/companys">点击创建企业信息</a>'});
    
});

/**
 * path:  /jobs/companys
 * 设置企业信息
 */
router.get('/companys', function(req, res) {
    "use strict";
    if (!req.session.user) {
        res.redirect("/user/login");
        return false;
    }
    // 未激活用户不允许进入
    if (!req.session.user.isActive) {
        res.redirect("/user/activeAccount");
        return false;
    }

    checkUserInfo(function() {
        checkCompanys(function(company) {
            getJobChannelData({parent:2}, function(realm) {
                getJobChannelData({parent:3}, function(scale) {
                    getJobChannelData({parent:4}, function(seedtime) {
                        getJobChannelData({parent:8}, function(city) {
                            if ( req.session.addJobIsShowCaptcha && req.session.addJobIsShowCaptcha >= config.isShowCaptcha ) {// 显示验证码
                                res.render('jobs/com_info', {
                                    title:'企业信息管理',
                                    captcha:true,
                                    company:company,
                                    realm:realm,
                                    scale:scale,
                                    seedtime:seedtime,
                                    city:city
                                });
                            } else {
                                // 不显示验证码时需要清空验证码session
                                req.session.captcha = null;
                                res.render('jobs/com_info', {
                                    title:'企业信息管理',
                                    company:company,
                                    realm:realm,
                                    scale:scale,
                                    seedtime:seedtime,
                                    city:city
                                });
                            }
                        });
                    });
                });
            });
        });
    });
    

    // 检查信息是否存在企业信息
    function checkCompanys(callback) {
        jobModel.getOne({
            key: "Companie",
            body: {
                manage: req.session.user._id
            }
        }, function (err, data) {
            var company = data;
            if (err || !data) {
                company = {};
            }
            
            if ( callback ) {
                callback(company);
            }
        });
    };

    // 检查信息是否完成
    function checkUserInfo(callback) {
        usersInfosModel.getOne({
            key: "User_info",
            body: {
                userid: req.session.user._id
            }
        }, function (err, data) {
            if (err || !data) {
                res.render('users/empty', {title:'发布招聘信息提示', content:'先完善个人信息后才有权限添加企业信息。<br /><a href="/user/editInfo">点击完善信息</a>'});
                return false;
            }
            
            if ( callback ) {
                callback(data);
            }
        });
    };
});

/**
 * 提交企业信息
 */
router.post('/companys', function(req, res) {
    var code = req.body.code;

    if (!req.session.user) {
        res.redirect("/user/login");
        return false;
    }
    // 未激活用户不允许进入
    if (!req.session.user.isActive) {
        res.redirect("/user/activeAccount");
        return false;
    }

    // 验证码错误
    if ( req.session.addJobIsShowCaptcha >= config.isShowCaptcha ) {//需要检查验证码的正确性
        if ( !code ) {
            res.send({
                status: 200,
                code: 0,
                message: "请输入验证码！",
                reload: true
            });
            return false;
        }
        if ( !req.session.captcha ) {
            res.send({
                status: 200,
                code: 0,
                message: "系统出现异常，请稍后再试！"
            });
            return false;
        }
        if (code.toUpperCase() != req.session.captcha.toUpperCase() ) {
            res.send({
                status: 200,
                code: 0,
                message: "验证码错误，请重试！"
            });
            return false;
        }
    }


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
    

    // 记录该用户操作次数
    if ( req.session.addJobIsShowCaptcha ) {
        req.session.addJobIsShowCaptcha++;
    } else {
        req.session.addJobIsShowCaptcha = 1;
    }

    usersModel.getOne({
        key: "User",
        body: {
            _id: req.session.user._id
        }
    }, function (err, member) {
        
        // 通过验证请求时清空验证码session
        req.session.captcha = null;

        if (err || !member) {
            res.send({
                status: 200,
                code: 0,
                message: "会员账户发生故障！"
            });
        } else {
            if ( member.lock ) {// 被锁定账号发布企业信息时强退
                req.session.user = null;
                res.send({
                    status: 200,
                    code: 0,
                    message: "该账户被锁定！\n\n原因：" + member.lockMessage + "\n\n请联系管理员开通帐号，邮箱：manage@wdshare.org"
                });
                return;
            }

            // 检查企业名称是否重复
            jobModel.getOne({
                key: "Companie",
                body: {
                    name: req.body.name
                }
            }, function (err, com) {
                if (com && req.session.user._id != com.manage ) {
                    res.send({
                        status: 200,
                        code: 0,
                        message: "企业名称已存在，如果您是企业的管理者，请联系管理员。<br />联系邮箱：manage@wdshare.org"
                    });
                } else {
                    action();
                }
                return;
            });
        }
    });

    function action() {
        var manage = req.session.user._id,
            name = req.body.name,
            intro = req.body.intro,
            realm = [],
            scale = req.body.scale,
            seedtime = req.body.seedtime,
            city = req.body.city,
            address = req.body.address,
            mapLng = req.body.mapLng,
            mapLat = req.body.mapLat,
            mapZoom = req.body.mapZoom,
            www = req.body.www,
            contactName = req.body.contactName,
            tel = req.body.tel,
            mail = req.body.mail,
            tag = req.body.tag,
            tpl = '',// 添加企业信息时将模版设置为空，修改时不操作该字段
            product = req.body.product,
            content = req.body.content,
            click = 0,
            audit = true,
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
        if ( !mapLng || !mapLat || !mapZoom ) {
            res.send({
                status: 200,
                code: 0,
                message: "地图信息不完整请选择地图坐标！"
            });
            return false;
        }
        if ( !city ) {
            res.send({
                status: 200,
                code: 0,
                message: "城市必须选择！"
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


        if ( id ) {// 修改
            jobModel.update({
                    _id: id
                }, {
                key: "Companie",
                body: {
                    name:name,
                    intro: intro,
                    realm: realm,
                    scale: scale,
                    www: www,
                    seedtime: seedtime,
                    city:city,
                    address:address,
                    mapLng:mapLng,
                    mapLat:mapLat,
                    mapZoom:mapZoom,
                    contactName:contactName,
                    tel:tel,
                    mail:mail,
                    tag: tag,
                    product:product,
                    content:content,
                    // audit: audit,
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
                    message: "企业信息修改成功，可以发布招聘内容了！"
                });
                tagsCheck(tag);
            });
        } else {// 添加
            jobModel.save({
                key: "Companie",
                body: {
                    manage: manage,
                    name:name,
                    intro: intro,
                    realm: realm,
                    scale: scale,
                    www: www,
                    seedtime: seedtime,
                    city:city,
                    address: address,
                    mapLng:mapLng,
                    mapLat:mapLat,
                    mapZoom:mapZoom,
                    contactName: contactName,
                    tel: tel,
                    mail: mail,
                    tag: tag,
                    tpl: tpl,
                    product: product,
                    content: content,
                    click: click,
                    audit: audit,
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
                    editLogo: true,
                    message: "企业信息添加成功，可以发布招聘内容了！"
                });
                tagsCheck(tag);
            });
        }
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
 * path:  /jobs/sentresumes
 * 提交简历内容
 */
router.post('/sentresumes', function(req, res) {
    "use strict";
    var urlParams = URL.parse(req.originalUrl, true).query,
        jobID = urlParams.id,
        job,
        userid = req.session.user._id,
        mamber,
        userInfo,
        userArticle,
        userProject = 0,
        userOffer = 0,
        company;

    if (!req.session.user) {
        res.send({
            status: 200,
            code: 0,
            message: "登录后才可以提交简历！",
            reload: true
        });
        return false;
    }
    // 未激活用户不允许进入
    if (!req.session.user.isActive) {
        res.send({
            status: 200,
            code: 0,
            message: "账户未激活，不可以使用该功能！",
            reload: true
        });
        return false;
    }

    // 先请求相关信息，之后再写入数据库
    getUser(userid, function(_mamber) {
        mamber = _mamber;
        getUserInfo(userid, function(_info) {
            userInfo = _info;
            getArticleCount(userid, function(_articleCount) {
                userArticle = _articleCount;
                getJob(jobID, function(_job) {
                    job = _job;
                    getCompanys(job.companys, function(_company){
                        company = _company;
                        checkSent();
                    });
                });
            });
        });
    });

    // 检测是否有足够条件发送简历
    function checkSent() {
        // 检测非法字符
        var nullFlag = false;
        var nullWordsCommon = config.nullWordsCommon;
        // 姓名检测
        for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
            if ( req.body.name.indexOf(nullWordsCommon[i]) >= 0 ) {
                nullFlag = true;
            }
        }
        if ( nullFlag ) {
            res.send({
                status: 200,
                code: 0,
                message: "姓名中含有非法字符！"
            });
            return false;
        }
        // 手机检测
        for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
            if ( req.body.phone.indexOf(nullWordsCommon[i]) >= 0 ) {
                nullFlag = true;
            }
        }
        if ( nullFlag ) {
            res.send({
                status: 200,
                code: 0,
                message: "手机中含有非法字符！"
            });
            return false;
        }
        // 简历地址检测
        for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
            if ( req.body.resumes.indexOf(nullWordsCommon[i]) >= 0 ) {
                nullFlag = true;
            }
        }
        if ( nullFlag ) {
            res.send({
                status: 200,
                code: 0,
                message: "简历地址中含有非法字符！"
            });
            return false;
        }
        // 工作经验检测
        for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
            if ( req.body.workingLife.indexOf(nullWordsCommon[i]) >= 0 ) {
                nullFlag = true;
            }
        }
        if ( nullFlag ) {
            res.send({
                status: 200,
                code: 0,
                message: "工作经验中含有非法字符！"
            });
            return false;
        }
        // 学历检测
        for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
            if ( req.body.diploma.indexOf(nullWordsCommon[i]) >= 0 ) {
                nullFlag = true;
            }
        }
        if ( nullFlag ) {
            res.send({
                status: 200,
                code: 0,
                message: "学历中含有非法字符！"
            });
            return false;
        }
        // Github检测
        for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
            if ( req.body.github.indexOf(nullWordsCommon[i]) >= 0 ) {
                nullFlag = true;
            }
        }
        if ( nullFlag ) {
            res.send({
                status: 200,
                code: 0,
                message: "Github中含有非法字符！"
            });
            return false;
        }
        // 个人网站检测
        for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
            if ( req.body.www.indexOf(nullWordsCommon[i]) >= 0 ) {
                nullFlag = true;
            }
        }
        if ( nullFlag ) {
            res.send({
                status: 200,
                code: 0,
                message: "个人网站中含有非法字符！"
            });
            return false;
        }
        // 求职留言检测
        for ( var i=0,l=nullWordsCommon.length; i<l; i++ ) {
            if ( req.body.content.indexOf(nullWordsCommon[i]) >= 0 ) {
                nullFlag = true;
            }
        }
        if ( nullFlag ) {
            res.send({
                status: 200,
                code: 0,
                message: "求职留言中含有非法字符！"
            });
            return false;
        }


        jobModel.getSort({
            key: "Sent_resume",
            body: {userid:mamber._id, jobid:job._id},
            pages: { page: 1, pagesize: 10 },
            occupation: {"addDate":-1}// 排序字段
        }, function (err, data) {
            if ( data.length > 0 ) {
                var oldData = data[0].addDate,
                    newData = (new Date()).getTime();
                if ( (newData - oldData)/1000/60/60 < 20 ) {// 20小时内只能发送一次简历
                    res.send({
                        status: 200,
                        code: 0,
                        message: "同一个岗位，20小时内只能投递一次简历，过段时间再来吧！",
                        reload: true
                    });
                } else {
                    setSentResumes();
                };
            } else {
                setSentResumes();
            }
        });
    };

    // 写入发送简历记录
    function setSentResumes() {
        // ***写入之前还要检查是否当天内有发送同样的求职信息，屏蔽当天内多次求职
        var param = {
                title: req.body.name + " 求职［" + job.title +"］",
                userid: mamber._id,
                username: req.body.name,
                userArticle: userArticle,
                userProject: userProject,
                userZan: userInfo.zan || 0,
                userOffer: userInfo.offer || 0,

                mail: mamber.email,
                workingLife: req.body.workingLife,
                diploma: req.body.diploma,
                tel: req.body.phone,
                resumes: (!req.body.resumes || req.body.resumes == "http://") ? "" : req.body.resumes,
                github: (!req.body.github || req.body.github == "http://") ? "" : req.body.github,
                www: (!req.body.www || req.body.www == "http://") ? "" : req.body.www,
                content: req.body.content || "",

                jobid: job._id,
                jobTitle: job.title,
                jobUserid: job.userId,
                jobContactName: job.contactName,
                jobContactTel: job.tel,
                jobContactMail: job.mail,

                companyid: company._id,
                companyTitle: company.name,
                companyContactName: company.contactName,
                companyContactTel: company.tel,
                companyContactMail: company.mail,

                sentState: false,
                addDate: (new Date()).getTime(),
                sentIp: req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress
            };

        // 转换回车符为换行符
        param.content = param.content.replace(/\r\n/g, "<br />");
        param.content = param.content.replace(/\n/g, "<br />");

        var _html = '';
        _html += '<div style="color:#333333;border:1px dashed #D8D8D8;margin:10px;">';

        _html += '<h1 style="text-align:center;margin:20px;padding:0 20px 20px;border-bottom:1px dashed #D8D8D8;">'+ param.username + ' &nbsp; ' + param.workingLife + '经验 &nbsp; ' + param.diploma +'</h1>';

        _html += '<div style="font-size:14px;font-family:Helvetica Neue, Helvetica Neue, Helvetica, Hiragino Sans GB, Microsoft Yahei, Arial;line-height:1.8em;padding:0 10px;">';

        _html += '<p>尊敬的 '+ param.jobContactName +'：</p>';
        _html += '<p>'+ param.username +' 通过WDShare向贵公司的 <strong>'+ job.title +'</strong> 职位发出面试申请，以下是他的相关信息：</p>';
        _html += '<div style="background-color:#F2F2F2;padding:5px 20px;">';
        _html += '<p>姓名：'+ param.username +'</p>';
        _html += '<p>电话：'+ param.tel +'</p>';
        _html += '<p>邮箱：<a href="mailto:'+ param.mail +'">'+ param.mail +'</a></p>';
        _html += '<p>工作经验：'+ param.workingLife +'</p>';
        _html += '<p>学历：'+ param.diploma +'</p>';
        if ( param.resumes ) {
            _html += '<p>简历：<a href="'+ param.resumes +'" target="_blank">'+ param.resumes +'</a></p>';
        }
        _html += '</div>';
        _html += '<p>&nbsp;</p>';
        _html += '<p><strong>WDShare收集的该用户信息：</strong></p>';
        _html += '<div style="background-color:#fafafa;padding:5px 20px;">';
        _html += '<p>官网会员主页：<a href="http://www.wdshare.org/user/'+ param.userid +'" target="_blank">http://www.wdshare.org/user/'+ param.userid +'</a></p>';
        if ( param.userArticle ) {
            _html += '<p>在官网发布文章总数：'+ param.userArticle +'篇</p>';
        }
        if ( param.userProject ) {
            _html += '<p>在官网发布项目总数：'+ param.userProject +'个</p>';
        }
        if ( param.userZan ) {
            _html += '<p>获得总赞数：'+ param.userZan +'</p>';
        }
        if ( param.userOffer ) {
            _html += '<p>被企业主动邀请面试：'+ param.userOffer +'次</p>';
        }
        _html += '</div>';

        _html += '<p>&nbsp;</p>';
        _html += '<p><strong>加分项：</strong></p>';
        _html += '<div style="background-color:#fafafa;padding:5px 20px;">';
        if ( param.github ) {
            _html += '<p>Github：<a href="'+ param.github +'" target="_blank">'+ param.github +'</a></p>';
        }
        if ( param.www ) {
            _html += '<p>个人主页：<a href="'+ param.www +'" target="_blank">'+ param.www +'</a></p>';
        }

        if ( param.content ) {
            _html += '<p>求职者说：</p>';
            _html += '<p>'+ param.content +'</p>';
        }
        _html += '</div>';
        _html += '<p>&nbsp;</p>';
        _html += '<p><strong>注意：以上信息由WDShare招聘系统自动发出，请勿回复；可直接电话或邮件联系求职者。</strong></p>';

        _html += config.mailSignature;
        _html += '</div>';
        _html += '</div>';

        // 先发邮件后写数据库，邮件发送失败了写库没啥意义
        sendMail({
            from: config.mail.sendMail,
            to: param.jobContactMail,
            subject: param.title,
            html: _html
        }, function() {// succeed
            param.sentState = true;
            jobModel.save({
                key: "Sent_resume",
                body: param
            }, function (err, data) {
                // 暂不考虑入库失败
                res.send({
                    status: 200,
                    code: 1,
                    message: "简历发送成功！请等待HR联系您。",
                    reload: true
                });
            });
        }, function() {// error
            res.send({
                status: 200,
                code: 0,
                message: "向HR发送邮件失败！请联系管理员反馈此消息。",
                reload: true
            });
        });
    };

    // 获取指定用户基本信息
    function getUser(userId, callback) {
        var mamber;
        usersModel.getOne({
            key: "User",
            body: {
                _id: userId
            }
        }, function (err, data) {
            if (err) {
                mamber = {};
                return;
            }

            if (data) {
                mamber = data; 
            } else {// 用户被删掉了
                mamber = {};
            }
            if ( callback ) {
                callback(mamber);
            }
            return;
        });
    };
    // 获取指定用户详细信息
    function getUserInfo(userId, callback) {
        var info;
        usersInfosModel.getOne({
            key: "User_info",
            body: {
                userid: userId
            }
        }, function (err, data) {
            if (err) {
                info = {};
                return;
            }

            if (data) {
                info = data; 
            } else {// 用户被删掉了
                info = {};
            }
            if ( callback ) {
                callback(info);
            }
            return;
        });
    };
    // 获取指定用户的文章数量
    function getArticleCount(userId, callback) {
        var count;
        archiveModel.getAll({
            key: "Archive",
            body: {
                userId: userId,
                type: 1,
                audit: true
            }
        }, function (err, data) {
            if (err) {
                count = 0;
                return;
            }

            if (data) {
                count = data.length; 
            } else {
                count = 0;
            }
            if ( callback ) {
                callback(count);
            }
            return;
        });
    };
    // 获取该招聘详细信息
    function getJob(id, callback) {
        var job;
        archiveModel.getOne({
            key: "Archive",
            body: {
                _id: id
            }
        }, function (err, data) {
            if (err) {
                job = {};
                return;
            }

            if (data) {
                job = data; 
            } else {
                job = {};
            }
            if ( callback ) {
                callback(job);
            }
            return;
        });
    };

});

/**
 * path:  /jobs/:id
 * 招聘终极页及分类列表
 */
router.get('/:id', function(req, res) {
    var id = req.params.id,
        job,
        channel,
        mamber,
        workingLife,
        diploma,
        jobType,
        city,
        company,
        tpl = "job_end";// 默认模板

    getJobChannelCon(function(relyData) {
        archiveModel.getOne({// 读取终极页信息
            key: "Archive",
            body: {
                _id: id
            }
        }, function (err, data) {
            if (err || !data) {// 没有查询到文章时查询分类
                getChannelList(id);
                // res.send("参数错误，请重试！");
                return;
            }

            if (data) {
                // 转化工作年限为汉字
                for ( var j=0; j<relyData.workingLife.length; j++ ) {
                    if ( relyData.workingLife[j]._id == data.workingLife ) {
                        data.workingLifeName = relyData.workingLife[j].name;
                    }
                }
                // 转化学历为汉字
                for ( var k=0; k<relyData.diploma.length; k++ ) {
                    if ( relyData.diploma[k]._id == data.diploma ) {
                        data.diplomaName = relyData.diploma[k].name;
                    }
                }
                // 转化招聘类型为汉字
                for ( var y=0; y<relyData.jobType.length; y++ ) {
                    if ( relyData.jobType[y]._id == data.jobType ) {
                        data.jobTypeName = relyData.jobType[y].name;
                    }
                }
                // 转化城市为汉字
                for ( var z=0; z<relyData.city.length; z++ ) {
                    if ( relyData.city[z]._id == data.city ) {
                        data.cityName = relyData.city[z].name;
                    }
                }

                job = data;

                getCompanys(job.companys, function(_company){
                    company = _company;
                    getUser();
                    getChannel();
                });
                
                return;
            }

            res.send("获取招聘信息时未知错误，请重试！");
        });
    });
    /**
     * 获取招聘相关分类信息
     */
    function getJobChannelCon(callback) {
        getJobChannelData({parent:5}, function(_workingLife) {
            getJobChannelData({parent:6}, function(_diploma) {
                getJobChannelData({parent:7}, function(_jobType) {
                    getJobChannelData({parent:8}, function(_city) {
                        workingLife = _workingLife;
                        diploma = _diploma;
                        jobType = _jobType;
                        city = _city;
                        if (callback) {
                            callback({
                                workingLife: _workingLife,
                                diploma: _diploma,
                                jobType: _jobType,
                                city: _city
                            });
                        }
                    });
                });
            });
        });
    };
    
    // 获取作者信息
    function getUser() {
        usersModel.getOne({// 读取作者信息
            key: "User",
            body: {
                _id: job.userId
            }
        }, function (err, data) {
            if (err) {
                res.send("服务器错误，请重试！");
                return;
            }

            if (data) {
                mamber = data; 
            } else {// 用户被删掉了
                mamber = {}
            }
            send();
            return;
        });
    };
    // 获取分类信息
    function getChannel() {
        jobModel.getOne({// 读取分类
            key: "Job_channel",
            body: {
                _id: job.channelId
            }
        }, function (err, data) {
            if (err) {
                res.send("服务器错误，请重试！");
                return;
            }

            if (data) {
                channel = data;
                send();
                return;
            }

            res.send("获取分类时未知错误，请重试！");
        });
    };
    // 返回信息
    function send() {
        if ( job && mamber && channel && company ) {
            // 未审核招聘被非发布者浏览时【后台管理员例外】
            if ( !job.audit && (!req.session.user || req.session.user._id != mamber._id) && !req.session.manageuser ) {
                res.render('article/error', {
                    title: "错误提示",
                    msg: "该招聘未审核，请稍后进行浏览！"
                });
                return;
            }

            if ( job.tpl ) {// 终极页有指定模板时设置终极页模板
                tpl = job.tpl;
            }

            if ( req.session.addCommentIsShowCaptcha && req.session.addCommentIsShowCaptcha >= config.isShowCaptcha ) {// 显示验证码
                res.render('jobs/end/'+tpl, {
                    title: job.title,
                    job: job,
                    member: mamber,
                    channel: channel,
                    company: company,
                    configIsComment: config.isComment,
                    captcha:true
                });
            } else {
                // 不显示验证码时需要清空验证码session
                req.session.captcha = null;
                res.render('jobs/end/'+tpl, {
                    title: job.title,
                    job: job,
                    member: mamber,
                    channel: channel,
                    company: company,
                    configIsComment: config.isComment
                });
            }

            // 记录点击
            archiveModel.update({
                    _id: id
                }, {
                key: "Archive",
                body: {
                    click: job.click + 1
                }
            }, function (err, data) {
                console.log(job.click+1);
            });
        }
        return;
    };


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

        jobModel.getOne({
            key: "Job_channel",
            body: {
                _id: id
            }
        }, function (err, data) {
            if (err) {
                res.send("请求发生意外！");
            }
            // console.log(data);
            if (data) {
                getJobList(
                    req,
                    res,
                    {type:3, audit:true, garbage:false, channelId:id},
                    {page:page, pagesize:pagesize, pathname:pathname},
                    'jobs/job_list',
                    data.name,
                    data.name,
                    data.name,
                    {
                        workingLife: workingLife,
                        diploma: diploma,
                        jobType: jobType,
                        city: city
                    }
                );
                return false;
            }

            res.render('404');
        });
    };
});


module.exports = router;
