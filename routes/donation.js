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
 * path:  /donation
 * 捐赠列表
 */
// 所有捐赠
router.get('/', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getDonationsList(req, res, {}, {page:page, pagesize:pagesize, pathname:pathname}, 'donation_list', "所有捐赠");
});
// 高级群捐赠
router.get('/gaoji', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getDonationsList(req, res, {channel:"1"}, {page:page, pagesize:pagesize, pathname:pathname}, 'donation_list', "高级群捐赠");
});
// 中级群捐赠
router.get('/zhongji', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getDonationsList(req, res, {channel:"2"}, {page:page, pagesize:pagesize, pathname:pathname}, 'donation_list', "中级群捐赠");
});
// 初级群捐赠
router.get('/chuji', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getDonationsList(req, res, {channel:"3"}, {page:page, pagesize:pagesize, pathname:pathname}, 'donation_list', "初级群捐赠");
});
// 活动捐赠
router.get('/huodong', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getDonationsList(req, res, {channel:"4"}, {page:page, pagesize:pagesize, pathname:pathname}, 'donation_list', "活动捐赠");
});
// 其他捐赠
router.get('/other', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getDonationsList(req, res, {channel:"5"}, {page:page, pagesize:pagesize, pathname:pathname}, 'donation_list', "其他捐赠");
});
// 消费
router.get('/pay', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getDonationsList(req, res, {channel:"-1"}, {page:page, pagesize:pagesize, pathname:pathname}, 'donation_list', "消费");
});

/**
 * 获取捐赠列表内容
 * @param  {Object} o 限制条件
 * @param  {Object} pages 分页参数对象
 * @param  {String} mod 模板路径
 * @param  {String} channelName 分类名称
 * @return
 */
function getDonationsList(req, res, o, pages, mod, channelName) {
    donationModel.getSort({
        key: "Donation",
        body:o,// 读取内容条件
        pages:pages, // 分页信息
        occupation: "addDate"// 排序字段
    }, function (err, data) {
        var allCount,
            goldsum;
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            // 获取总数【用于分页】
            donationModel.getAll({// 查询分类，为添加文章做准备
                key: "Donation",
                body: o
            }, function (err, data) {
                if (err) {
                    res.send("服务器错误，请重试！");
                    return;
                }

                var gold = 0;

                for (var i = data.length - 1; i >= 0; i--) {
                    gold += data[i].gold;
                }

                if (data) {
                    allCount = data.length;
                    goldsum = gold;
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
                title: channelName || "所有标签",
                result: data,
                goldsum: goldsum,
                pages:_page
            });
        };
    });
};







module.exports = router;
