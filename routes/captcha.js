var express = require('express'),
    fs = require('fs'),
    router = express.Router(),
    crypto = require('crypto'),
    moment = require("moment"),
    config = require("../server/config"),
    path = require('path'),
    gm = require('gm'),
    imageMagick = gm.subClass({ imageMagick : true });

/**
 * path:  /captcha/get
 * 获取验证码
 */
router.get('/get', function(req, res) {
    var staticPath = path.join(siteDir, 'public'),
        bg = "/captcha/",
        bgName = "bg.jpg",
        readPath = path.join(staticPath, bg, bgName),
        str = ['a','b','c','d','e','f','g','h','i','j','k','m','l','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
        code = str[Math.round(Math.random() * (str.length-1))];
        // width = req.query.width,
        // height = req.query.height;
    code += str[Math.round(Math.random() * (str.length-1))];
    code += str[Math.round(Math.random() * (str.length-1))];
    code += str[Math.round(Math.random() * (str.length-1))];
    code += str[Math.round(Math.random() * (str.length-1))];

    var _img = imageMagick(readPath)
    // .resize(width, height, "!")
    .resize(100, 40, "!")
    .stroke("#ffff00", 2)
    .font("Tahoma")
    .fontSize(Math.round(Math.random() * 5) + 21)
    .drawText(0, 5, code, "North")
    // .noise("impulse")
    .noise("laplacian")//增加噪点
    // .blur(1, 5)
    // .quality(50)//质量
    .toBuffer(function (err, buffer) { // 以图片请求的形式返回
        if (err) {
            return res.sendfile(getFilePath());
        }
        res.set('Content-Type', 'image/jpg');
        res.send(buffer);
    });
    // 原本是写入，现在不需要写入
    // .write(path.join(staticPath, bg, "img-to.jpg"), function (err) {
    //   send(err);
    // });
});


module.exports = router;
