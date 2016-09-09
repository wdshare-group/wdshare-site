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
 * path:  /companys
 * 获取所有企业
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
        realm,
        scale,
        seedtime;

    /**
     * 获取招聘相关分类信息
     */
    getJobChannelData({parent:5}, function(_workingLife) {
        getJobChannelData({parent:6}, function(_diploma) {
            getJobChannelData({parent:7}, function(_jobType) {
                getJobChannelData({parent:8}, function(_city) {
                    getJobChannelData({parent:2}, function(_realm) {
                        getJobChannelData({parent:3}, function(_scale) {
                            getJobChannelData({parent:4}, function(_seedtime) {
                                workingLife = _workingLife;
                                diploma = _diploma;
                                jobType = _jobType;
                                city = _city;
                                realm = _realm;
                                scale = _scale;
                                seedtime = _seedtime;

                                getComList(
                                    req,
                                    res,
                                    {audit:true},
                                    {page:page, pagesize:pagesize, pathname:pathname},
                                    'jobs/com_list',
                                    {
                                        workingLife: workingLife,
                                        diploma: diploma,
                                        jobType: jobType,
                                        city: city,
                                        realm: realm,
                                        scale: scale,
                                        seedtime: seedtime
                                    }
                                );
                            });
                        });
                    });
                });
            });
        });
    });
});

/**
 * 获取企业列表内容
 * @param  {Object} o 限制条件
 * @param  {String} mod 模板路径
 * @return
 */
function getComList(req, res, o, pages, mod, relyData) {
    jobModel.getSort({
        key: "Companie",
        body:o,// 仅读取文章类型的档案
        pages:pages, // 分页信息
        occupation: "addDate"// 排序字段
    }, function (err, data) {
        var userCount = 0,
            jobCount = 0,
            allCount,
            commentsCount = 0;
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
                    var realmData = [];
                    // 转化企业领域为汉字
                    for ( var x=0; x<relyData.realm.length; x++ ) {
                        var thisid = relyData.realm[x]._id;
                        if ( data[i].realm.indexOf(thisid) > -1 ) {
                            realmData.push(relyData.realm[x].name);
                        }
                    }
                    data[i].realmName = realmData.join(" · ");
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
                    // 转化城市为汉字
                    for ( var k=0; k<relyData.city.length; k++ ) {
                        if ( relyData.city[k]._id == data[i].city ) {
                            data[i].cityName = relyData.city[k].name;
                        }
                    }

                    // 获取企业职位数量
                    archiveModel.getAll({
                        key: "Archive",
                        body: {
                            audit: true,
                            companys: data[i]._id
                        }
                    }, function (err, jobs) {
                        if (err) {
                            res.send("服务器错误，请重试！");
                            return;
                        }

                        if (jobs) {
                            data[i].jobCount = jobs.length;
                        } else {
                            data[i].jobCount = 0;
                        }
                        jobCount++;
                        // gosend();

                        // 获取所有职位评论总数
                        var jobids = [];
                        for ( var c=0,cl=jobs.length; c<cl; c++ ) {
                            jobids.push(jobs[c]._id);
                        }

                        commentModel.getAll({
                            key: "Comment",
                            body: {
                                typeid: {'$in':jobids},
                                model: "job"
                            }
                        }, function (err, comments) {
                            commentsCount++;

                            if (comments) {
                                data[i].commentsCount = comments.length;
                            }
                            gosend();
                            return;
                        });
                        return;
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
            jobModel.getAll({
                key: "Companie",
                body: o
            }, function (err, all) {
                if (err) {
                    res.send("服务器错误，请重试！");
                    return;
                }

                if (all) {
                    allCount = all.length;
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
            if ( userCount == data.length && jobCount == data.length && allCount >= 0 && commentsCount == data.length ) {
                _page.sum = allCount;
                res.render(mod, {
                    title: "企业名录",
                    result: data,
                    pages:_page
                });
           }
        };
    });
};

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
 * path:  /companys/:id
 * 企业终极页及分类列表
 */
router.get('/:id', function(req, res) {
    var id = req.params.id,
        company,
        mamber,
        jobCount,
        jobs,
        tpl = "com_end";// 默认模板
    
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
                        getJobChannelData({parent:8}, function(city) {
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
                            // 转化城市为汉字
                            for ( var z=0; z<city.length; z++ ) {
                                if ( city[z]._id == _companys.city ) {
                                    _companys.cityName = city[z].name;
                                }
                            }
                            company = _companys;
                            getUser();
                            getCompanyJobs();
                        });
                    });
                });
            });
        }
    });

    // 获取企业招聘职位
    function getCompanyJobs() {
        archiveModel.getAll({// 查询分类，为添加文章做准备
            key: "Archive",
            body: {type:3, audit:true, companys:company._id}
        }, function (err, data) {
            jobCount = 0;
            jobs = [];

            if (data) {
                jobCount = data.length;
                jobs = data;
            }
            send();
        });
    };

    // 获取作者信息
    function getUser() {
        usersModel.getOne({// 读取作者信息
            key: "User",
            body: {
                _id: company.manage
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

    // 返回信息
    function send() {
        // 未审核招聘被非发布者浏览时【后台管理员例外】
        if ( !company.audit && (!req.session.user || req.session.user._id != mamber._id) && !req.session.manageuser ) {
            res.render('article/error', {
                title: "错误提示",
                msg: "该企业未审核，请稍后进行浏览！"
            });
            return;
        }

        if ( typeof jobCount != "number" ) { return false };

        if ( company.tpl ) {// 终极页有指定模板时设置终极页模板
            tpl = company.tpl;
        }

        res.render('jobs/end/'+tpl, {
            title: company.name,
            company: company,
            member: mamber,
            jobCount: jobCount,
            jobs: jobs,
            configIsComment: config.isComment
        });

        // 记录点击
        jobModel.update({
                _id: id
            }, {
            key: "Companie",
            body: {
                click: company.click + 1
            }
        }, function (err, data) {});
        return;
    };
});


module.exports = router;
