var express = require('express'),
    mongo = require('mongodb'),
    router = express.Router(),
    init = require("../../server/init.js"),
    goBack = init.goBack,
    crypto = require('crypto'),
    ObjectId = mongo.ObjectID,
    config = require("../../server/config"),
    URL = require('url');


var active = require('./active.js');

/**
 * path:  /manage/donation
 * 捐赠列表
 */
// 所有捐赠
router.get('/', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getDonationsList(req, res, {}, {page:page, pagesize:pagesize, pathname:pathname}, 'manages/donation/donation_list', "所有捐赠");
});
// 高级群捐赠
router.get('/gaoji', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getDonationsList(req, res, {channel:"1"}, {page:page, pagesize:pagesize, pathname:pathname}, 'manages/donation/donation_list', "高级群捐赠");
});
// 中级群捐赠
router.get('/zhongji', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getDonationsList(req, res, {channel:"2"}, {page:page, pagesize:pagesize, pathname:pathname}, 'manages/donation/donation_list', "中级群捐赠");
});
// 初级群捐赠
router.get('/chuji', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getDonationsList(req, res, {channel:"3"}, {page:page, pagesize:pagesize, pathname:pathname}, 'manages/donation/donation_list', "初级群捐赠");
});
// 活动捐赠
router.get('/huodong', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getDonationsList(req, res, {channel:"4"}, {page:page, pagesize:pagesize, pathname:pathname}, 'manages/donation/donation_list', "活动捐赠");
});
// 其他捐赠
router.get('/other', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getDonationsList(req, res, {channel:"5"}, {page:page, pagesize:pagesize, pathname:pathname}, 'manages/donation/donation_list', "其他捐赠");
});
// 消费
router.get('/pay', function(req, res) {
    var urlParams = URL.parse(req.originalUrl, true).query,
        model = urlParams.model;
        page = urlParams.page || 1,
        pagesize = urlParams.pagesize || 10,
        pathname = URL.parse(req.originalUrl, true).pathname;

    getDonationsList(req, res, {channel:"-1"}, {page:page, pagesize:pagesize, pathname:pathname}, 'manages/donation/donation_list', "消费");
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


/**
 * path:  /manage/donation/create
 * 添加捐赠
 */
router.get('/create', function(req, res) {
    res.render('manages/donation/donation_create', {
        title: "添加捐赠"
    });
});
// 修改和添加共用
router.post('/create', function(req, res) {
    var channel = req.body.channel,
        name = req.body.name,
        qq = req.body.qq,
        source = req.body.source,
        sourceNickname = req.body.sourceNickname,
        gold = req.body.gold,
        addDate = req.body.addDate + " " + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(),
        comment = req.body.comment,
        id = req.body.aid;

    // 必须为数字的限制
    if ( isNaN(gold) ) {
        res.send({
            status: 200,
            code: 0,
            message: "金额必须为数字！"
        });
        return false;
    }

    if ( channel === "-1" && gold > 0 ) {
        gold = gold*-1;
    }
    if ( id ) {// 修改
        donationModel.update({
                _id: id
            }, {
            key: "Donation",
            body: {
                channel: channel,
                name: name,
                qq: qq,
                source: source,
                sourceNickname: sourceNickname,
                gold: gold,
                comment: comment,
                addDate: (new Date(addDate)).getTime()
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
        donationModel.save({
            key: "Donation",
            body: {
                channel: channel,
                name: name,
                qq: qq,
                source: source,
                sourceNickname: sourceNickname,
                gold: gold,
                comment: comment,
                addDate: (new Date(addDate)).getTime()
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
    }
});

/**
 * path:  /manage/donation/edit/:id
 * 修改捐赠
 */
router.get('/edit/:id', function(req, res) {
    var id = req.params.id;
    donationModel.getOne({
        key: "Donation",
        body: {
            _id: id
        }
    }, function (err, data) {
        if (err) {
            res.send("服务器错误，请重试！");
            return;
        }

        if (data) {
            res.render('manages/donation/donation_edit', {
                title: "修改捐赠",
                result: data
            });
            return;
        }

        res.send("未知错误，请重试！");

    });
});

/**
 * path:  /manage/donation/del/:id
 * 删除捐赠
 */
router.get('/del/:id', function(req, res) {
    var id = req.params.id;
    donationModel.remove({
        key: "Donation",
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
