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
 * path:  /tags/getaddtagslist
 * 添加内容是获取tags列表
 */
router.get('/getaddtagslist', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname,
        tags = urlParams.tags.split(",");

    getTagsList(req, res, {model:model, name:{'$nin':tags}}, {page:page, pagesize:pagesize, pathname:pathname});
});

/**
 * 添加内容时获取标签列表
 * @param  {Object} o 限制条件
 * @param  {Object} pages 分页参数对象
 * @return
 */
function getTagsList(req, res, o, pages) {
    tagModel.getSort({
        key: "Tag",
        body:o,// 限制条件
        pages:pages, // 分页信息
        occupation: "level"// 排序字段
    }, function (err, data) {
        var allCount;
        if (err) {
            res.send({
                status: 200,
                code: 0,
                message: "服务器错误，请重试！"
            });
            return;
        }

        if (data) {
            // 获取总数【用于分页】
            tagModel.getAll({// 查询分类，为添加文章做准备
                key: "Tag",
                body: o
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
                    allCount = data.length;
                    gosend();
                    return;
                }

                res.send({
                    status: 200,
                    code: 0,
                    message: "未知错误，请重试！"
                });
            });            

            return;
        }

        res.send({
            status: 200,
            code: 0,
            message: "未知错误，请重试！"
        });

        // 所有数据都获取完成后执行返回
        function gosend() {
           var _page = pages;
            _page.sum = allCount,
            newData = [];

            for (var i=0; i<data.length; i++) {
                newData.push(data[i].name);
            }

            res.send({
                status: 200,
                code: 1,
                message: "获取信息成功！",
                result:newData,
                pages:_page
            });
        };
    });
};



/**
 * path:  /tags/:tag
 * 文章终极页及分类列表
 */
router.get('/:tag', function(req, res) {
    var tag = req.params.tag,
        urlParams = URL.parse(req.originalUrl, true).query,
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 20,
        pathname = URL.parse(req.originalUrl, true).pathname;
        console.log(tag);
    getList (req, res, {audit:true, tag:{$regex: tag, $options:'i'}}, {page:page, pagesize:pagesize, pathname:pathname}, 'tags_list', tag);
});

/**
 * 获取列表内容
 * @param  {Object} o 限制条件
 * @param  {Object} pages 分页参数对象
 * @param  {String} mod 模板路径
 * @param  {String} channelName 分类名称
 * @return
 */
function getList(req, res, o, pages, mod, channelName) {
    archiveModel.getSort({
        key: "Archive",
        body:o,// 仅读取文章类型的档案
        pages:pages, // 分页信息
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
           if ( userCount == data.length && allCount >= 0 ) {
                _page.sum = allCount;
                res.render(mod, {
                    title: channelName || "精彩内容",
                    result: data,
                    pages:_page
                });
           }
        };
    });
};







module.exports = router;
