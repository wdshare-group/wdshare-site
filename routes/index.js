var express = require('express');
var util = require('util');
var mongo = require('mongodb');
var acCon = require('../model/index.js');
var router = express.Router();
var ObjectId = mongo.ObjectID;

/**
 * path:  /active
 * 显示所有活动
 */
router.get('/', function(req, res) {
    var affiche = false,
        active = false,
        users = false,
        article = false,
        articleHOT = false;
    // 读取活动
    activeModel.getSort({
        key: "Active",
        body:{},// 筛选内容
        pages: {page:1, pagesize:8},// 分页信息
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
            activeModel.getAll({
                key: "Active",
                body: {}
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
           if ( channelCount == data.length && joinCount == data.length && allCount >= 0 && channelItem ) {
                active = {
                    title: "精彩活动",
                    result: data,
                    channel: channelItem
                };
                foo();
           }
        };
    });

    // 读取users
    usersModel.getSort({
        key: "User",
        body:{isActive:true, lock:false},// 筛选内容
        pages: {page:1, pagesize:8},// 分页信息
        occupation: "regTime"// 排序字段
    }, function (err, data) {
        var articleCount = 0,
            userInfoCount = 0,
            allCount;
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            for ( var i=0; i<data.length; i++ ) {
                (function(i) {
                    // 获取文章数
                    archiveModel.getAll({
                        key: "Archive",
                        body: {
                            userId: data[i]._id,
                            audit: true
                        }
                    }, function (err, article) {
                        if (err) {
                            res.send("服务器错误，请重试！");
                            return;
                        }

                        if (article) {
                            data[i].article = article.length;
                            articleCount++
                            gosend();
                            return;
                        }
                        res.send("未知错误，请重试！");
                    });

                    // 获取用户详细信息
                    usersInfosModel.getOne({
                        key: "User_info",
                        body: {
                            userid: data[i]._id
                        }
                    }, function (err, userInfo) {
                        if (err) {
                            res.send("服务器错误，请重试！");
                            return;
                        }
                        
                        data[i].userInfo = userInfo || {};
                        userInfoCount++;
                        gosend();
                        return;
                    });
                })(i);
            }

            // 获取总数
            usersModel.getAll({
                key: "User",
                body: {}
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
           if ( articleCount == data.length && userInfoCount == data.length && allCount >= 0 ) {
                users = {
                    title: "会员信息",
                    result: data,
                    allCount: allCount
                };
                foo();
           }
        };
    });

    // 读取公告
    archiveModel.getOne({
        key: "Article_crumb",
        body: {
            url: "affiche"
        }
    }, function (err, data) {
        if (data && data.url) {
            affiche = data;
            foo();
        } else {
            affiche = "error";
            foo();
        }
    });

    // 读取头条文章
    getArchivesList(req, res, {type:1, audit:true, diyType:{'$regex':/1/i}}, function(data) {
        articleHOT = data;
        foo();
    });
    // 读取文章【不包含头条】
    getArchivesList(req, res, {type:1, audit:true, diyType:{'$regex':/^((?!1).)+$|^$/}}, function(data) {
        article = data;
        foo();
    });

    function foo() {
        if ( active !== false && affiche !== false && users !== false && articleHOT !== false && article !== false ) {
            console.log(articleHOT.length);
            console.log(article.length);

            var allArticle = articleHOT.length > 0 ? articleHOT.concat(article) : article;
            res.render('index', {
                title: '官网首页',
                active: active,
                affiche: affiche,
                article: allArticle,
                users: users
            });
        }
    };
});

/**
 * 获取列表内容
 * @param  {Object} o 限制条件
 * @param  {Function} callback 回调函数
 * @return
 */
function getArchivesList(req, res, o, callback) {
    archiveModel.getSort({
        key: "Archive",
        body:o,// 仅读取文章类型的档案
        pages:{page:1, pagesize:10},// 分页信息
        occupation: "addDate"// 排序字段
    }, function (err, data) {
        var channelCount = 0,
            userCount = 0;
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }
        
        if (data && data.length > 0) {
            for ( var i=0; i<data.length; i++ ) {
                (function(i) {
                    // 获取分类信息
                    archiveModel.getOne({
                        key: "Article_channel",
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
                            data[i].channelUrl = channelData.url;
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
            return;
        } else {
            callback([]);
        }

        // 所有数据都获取完成后执行返回
        function gosend() {
           if ( channelCount == data.length && userCount == data.length ) {
                callback(data);
           }
        };
    });
};



module.exports = router;
