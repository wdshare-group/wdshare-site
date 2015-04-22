var express   = require('express'),
    sendMail  = require("../server/sendMail.js"),
    router    = express.Router(),
    init      = require("../server/init.js"),
    authorize = init.authorize,
    goBack    = init.goBack,
    crypto    = require('crypto'),
    moment    = require("moment"),
    config    = require("../server/config");

//编辑用户资料
router.route('/user').all(authorize).get(function(req, res) {
  "use strict";
  var id = req.session.user._id;
  factory.getAll({
    key:"Category"
  },function(err,categories){
    if(err){
      categories = [];
    }
    factory.getOne({
      key:"User",
      body:{
        _id:id
      }
    },function(err,user) {
      if(err){
        user = {};
      }
      res.render('admin/user', { title: 'oSpring', description: "为新而生", categories: categories,user:user,cur:"user"});
    });
  });
}).post(function(req, res) {
  "use strict";
  var username = req.body.username || req.session.user.email,
      age      = req.body.age || 18,
      sex      = req.body.sex || null,
      id       = req.session.user._id;

  factory.update({_id:id},{
    key:"User",
    body:{
      //email: email,
      username:username ,
      age:age ,
      sex:sex
    }
  },function(err,num,data){
    if(err){
      res.send({message:err});
      return;
    }
    for(var key in data){
      if(!data.hasOwnProperty[key]) {
        req.session.user[key] = data[key];
      }
    }
    res.send({id:data._id,status:200,code:1,message:"更新成功！"});
  });
});

//修改密码
router.route("/password").all(authorize).get(function(req,res){
  "use strict";
  factory.getAll({
    key:"Category"
  },function(err,categories){
    if(err) {
      categories = [];
    }
    res.render('admin/password', { title: 'oSpring',"description":"为新而生",categories:categories,cur:"password"});
  });
}).post(function(req,res){
  "use strict";
  var password        = req.body.password,
      newPassword     = req.body.newPassword,
      reNewPassword   = req.body.reNewPassword,
      passwordHash    = crypto.createHash("sha1").update(new Buffer(password, "binary")).digest('hex'),
      NewPasswordHash = crypto.createHash("sha1").update(new Buffer(newPassword, "binary")).digest('hex'),
      user            = req.session.user.email;

  if(newPassword.length < 8 || newPassword !== reNewPassword){
    res.send({status:200,code:0,message:"新密码强度不符合要求或两次密码不一致！"});
    return;
  }

  factory.getOne({
    key:"User",
    body:{
      password:passwordHash
    }
  },function(err,data){
    if(err){
      res.send({status:200,code:0,message:"服务器错误，请重试！"});
      return;
    }
    if(data && "email" in data && data.email === user){
      factory.update({_id:data._id},{key:"User",body:{password:NewPasswordHash}},function(err,data){
        if(err){
          res.send({status:200,code:0,message:"更新失败，服务器错误，请重试！"});
          return;
        }
        req.session.user = null;
        res.send({status:200,code:1,message:"密码修改成功,请重新登录！","url":"/"});
      });
    }else{
      res.send({status:200,code:0,message:"更新失败，原始密码错误，请重试！"});
      return;
    }
  });
});


// 找回密码
router.route('/forgotPassword').get(function(req, res) {
  "use strict";
  factory.getAll({
    key:"Category"
  },function(err,categories){
    if(err || categories.length<1){
      categories = [];
    }
    res.render('forgotPassword', { title: 'oSpring',"description":"为新而生",categories:categories});
  });
}).post(function(req, res) {
  "use strict";
  var email      = req.body.email,
      resetCode  = (Math.random()*10000000000).toFixed(0),
      hash       = crypto.createHash("sha1").update(new Buffer(email+resetCode, "binary")).digest('hex');

  factory.getOne({
    key:"User",
    body:{
      email:email
    }
  },function(err,data){

    if(err){
      res.send({status:200,code:0,message:"找回密码失败，服务器错误，请重试！"});
    }
    if(data && "email" in data){
      factory.getOne({
        key:"ResetPW",
        body:{
          email:email
        }
      },function(err,data){
        if(err){
          res.send({status:200,code:0,message:"找回密码失败，服务器错误，请重试！"});
        }
        if(data && "email" in data && data.hash){
          sendMail({
            from: config.mail.sendMail,
            to: email,
            title: '密码重置邮件',
            html: '以下是您的密码重置链接，\n\r <a href="' + config.url + '/forgotPassword/'+ data.hash +'">' + config.url + '/forgotPassword/'+ data.hash + '</a>请访问链接以重设您的密码！'
          });
          res.send({status:200,code:1,message:"找回密码成功，稍后请收取邮件并重设密码！"});
        }else{
          factory.update({email:email},{
            key:"ResetPW",
            body:{
              email:email,
              resetCode:resetCode,
              hash:hash
            },
            option:{upsert: true}
          },function(err,data){
            if(err){
              res.send({status:200,code:0,message:"找回密码失败，服务器错误，请重试！"});
            }else{
              sendMail({
                from: config.mail.sendMail,
                to: email,
                subject: '密码重置邮件',
                html: '以下是您的密码重置链接，\n\r <a href="' + config.url + '/forgotPassword/'+ hash +'">' + config.url + '/forgotPassword/'+ hash + '</a>请访问链接以重设您的密码！'
              });
              res.send({status:200,code:1,message:"找回密码成功，稍后请收取邮件并重设密码！"});
            }
          });
        }
      });

    }else{
      res.send({status:200,code:0,message:"找回密码失败，无此用户，请重试！"});
    }
  });
});


// 访问重置密码链接
router.route('/forgotPassword/:hash').get(function(req, res) {
  "use strict";
  var hash = req.params.hash;

  factory.getAll({
    key:"Category"
  },function(err,categories){
    if(err || categories.length<1){
      categories = [];
    }

    if(hash){
      factory.getOne({
        key:"ResetPW",
        body:{
          hash:hash
        }
      },function(err,data){
        if(err || !data){
          // 错误，跳到输入邮件和重置码页面
          //res.render('resetPasswordFill', { title: 'oSpring',"description":"为新而生",categories:categories,email:email,resetCode:resetCode});
          //res.redirect("/forgotPassword");
          res.render('forgotPassword', { title: 'oSpring',"description":"为新而生",categories:categories,error:"服务器错误或链接已失效"});
        }else{
          // 输入新密码
          res.render("resetPassword", { title: 'oSpring',"description":"为新而生",categories:categories,hash:hash});
        }
      });
    }else{
      res.redirect("/forgotPassword");
      //res.render('resetPasswordFill', { title: 'oSpring',"description":"为新而生",categories:categories,email:email,resetCode:resetCode});
    }
  });
});

// 更新新密码  目前实现有漏洞概率非常非常非常小
router.post('/resetPassword/:hash',function(req,res){
  "use strict";
  var password     = req.body.password,
      rePassword   = req.body.rePassword,
      hash         = req.body.hash || req.params.hash,
      passwordHash = crypto.createHash("sha1").update(new Buffer(password, "binary")).digest('hex');


  if(password.length < 8 || password !== rePassword){
    res.send({status:200,code:0,message:"新密码强度不符合要求或两次密码不一致！"});
    return;
  }
  if(!hash){
    res.send({status:200,code:0,message:"链接错误，请重试！"});
    return;
  }

  factory.getOne({
    key:"ResetPW",
    body:{
      hash:hash
    }
  },function(err,data){
    var email = data && data.email;
    if(err){
      res.send({status:200,code:0,message:"服务器错误，请重试！"});
      return;
    }
    if(data && "email" in data && email){
      factory.update({email:email},{key:"User",body:{password:passwordHash}},function(err,data){
        if(err || data.length <1){
          res.send({status:200,code:0,message:"重置密码失败，服务器错误，请重试！"});
          return false;
        }
        factory.remove({key:"ResetPW",body:{email:email}},function(err,data){
        });
        res.send({status:200,code:1,message:"重置密码成功,请重新登录！","url":"/"});
      });
    }else{
      res.send({status:200,code:0,message:"重置密码失败，链接错误，请重试！"});
      return false;
    }
  });
});

// 激活账户
// 激活账户     /*可以通过先登录，然后再激活的方案来防止被错误激活。*/
router.get("/activeAccount/:code",function(req,res){
  "use strict";
  var code  = req.params.code,
      email;
  factory.getOne({key:"User",body:{regCode:code}},function(err,user){
    if(err || !user){
      res.send({status:200,code:0,message:"账户激活失败，服务器错误，请重试！"});
    }else{
      email = user.email;
      factory.update({regCode:code,email:email},{key:"User",body:{isActive:true,"regCode":""}},function(err,num){
        if(err || num<1){
          res.send({status:200,code:0,message:"账户激活失败，服务器错误或登录账户和激活链接不匹配，请重试！"});
        }else{
          sendMail({
            from: config.mail.sendMail,
            to: email,
            subject: '激活成功',
            html: '感谢您注册'+ config.title +'，您的账户已成功激活，可以正常使用，访问：' + config.url
          });
          res.send({status:200,code:1,message:"账户已成功激活，感谢您的使用！"});
        }
      });
    }
  });
});
// 发送激活邮件
router.route("/activeAccount").all(authorize).get(function(req,res){
  "use strict";
  var email    = req.session.user.email,
      duration = config.activeDuration * 60 * 1000,
      msTime   = (new Date).getTime(),
      time;

  factory.getOne({key:"User",body:{email:email}},function(err,user){
    if(err || !user){
      res.send({status:200,code:0,message:"发送激活邮件失败，服务器错误，请重试！"});
    }else{
      time = user.activeTime;
      if(time !==0 && (msTime - time <= duration)){
        res.send({status:200,code:0,message:"请勿频繁获取激活邮件，系统设置时间间隔为" +  config.activeDuration + "分钟，请" + ((duration - (msTime - time))/1000).toFixed(0) + "秒后获取！"});
        return false;
      }
      if(user.regCode && !user.isActive){
        sendMail({
          from: config.mail.sendMail,
          to: email,
          subject: '注册成功',
          html: '感谢您注册'+ config.title +'，以下是您的激活链接，\n\r <a href="' + config.url + '/activeAccount/' + user.regCode + '">'+ config.url + '/activeAccount/' + user.regCode +'</a>请点击链接以激活您的账户！'
        });
        factory.update({email: email}, {key: "User", body: {activeTime:msTime}},function(err,num){});
        res.send({status:200,code:1,message:"发送激活邮件成功，请稍后收取邮件并点击激活链接以激活账户！"});
      }else{
        res.send({status:500,code:0,message:"发送激活邮件失败，请不要重复请求激活邮件！"});
      }
    }
  });
});

// 更新邮件地址
// 输入新的邮箱地址，发送激活邮件
router.route("/email").all(authorize).get(function(req,res){
  "use strict";
  factory.getAll({
    key:"Category"
  },function(err,categories){
    if(err){
      categories = [];
    }
    res.render('admin/email', {categories:categories,cur:"email"});
  });
}).post(function(req,res){
  "use strict";
  var email    = req.session.user.email,
      newEmail = req.body.email,
      regCode  = crypto.createHash("sha1").update(new Buffer(newEmail + (Math.random()*10000000000).toFixed(0), "binary")).digest('hex');

  if(email === newEmail){
    res.send({status:200,code:0,message:"不要调皮哦，你就没有修改邮箱嘛！"});
    return false;
  }

  factory.getOne({key:"User",body:{email:newEmail}},function(err,user){
    if(err || user){
      res.send({status:200,code:0,message:"不要调皮哦，此邮件地址已经被使用！"});
    }else{
      factory.getOne({key:"User",body:{email:email}},function(err,user) {
        if (err || !user) {
          res.send({status: 200, code: 0, message: "更新邮箱失败，服务器错误！"});
        } else if(user.changeTimes >= config.changeTimes){
          res.send({status:200,code:0,message:"更新邮箱失败，已经超过允许更换邮箱的最大次数！"});
        }else{
          factory.update({email: email}, {key: "User", body: {changeEmail:newEmail,"regCode":regCode,"isActive":false}},function(err,num){
            if(err || num <1){
              res.send({status: 200, code: 0, message: "更新邮箱失败，服务器错误！"});
            }else{
              sendMail({
                from: config.mail.sendMail,
                to: newEmail,
                subject: '更换邮件重新激活账户',
                html: '感谢您使用' + config.title + '，以下是您新邮箱的激活链接，\n\r <a href="' + config.url + '/updateEmail/' + regCode + '">' + config.url + '/updateEmail/' + regCode + '</a>请点击链接以激活您的账户！'
              });
              res.send({status: 200, code: 1, message: "已向新邮箱地址发送激活邮件成功，请稍后收取邮件并点击激活链接以激活账户！"});
            }
          });

        }
      });
    }
  });
});

// 更换邮件地址
// 点击激活链接 更换新邮件地址
router.route("/updateEmail/:code").all(authorize).get(function(req,res){
  "use strict";
  var code  = req.params.code;

  if(!code){
    factory.getAll({
      key:"Category"
    },function(err,categories){
      if(err){
        categories = [];
      }
      res.render('admin/error', {categories:categories,err:"服务器错误或激活码链接有错，请重试！"});
    });
    return false;
  }

  factory.getOne({key:"User",body:{regCode:code}},function(err,user){
    if(err || !user){
      res.send({status:200,code:0,message:"服务器错误或激活码链接有错，请重试！"});
    }else{

      factory.update({regCode:code}, {key: "User", body:{email:user.changeEmail,changeTimes:user.changeTimes+1,regCode:"","isActive":true}},function(err,num){
        if(err || num <1){
          res.send({status: 200, code: 0, message: "更新邮箱失败，服务器错误！"});
        }else{
          if(user.regCode && !user.isActive){
            sendMail({
              from: config.mail.sendMail,
              to: user.changeEmail,
              subject: '邮箱更新成功',
              html: '感谢您对'+ config.title +'的厚爱，您的邮箱已成功更换，可以正常使用，访问：' + config.url
            });
            req.session.user = null;
            res.send({status: 200, code: 1, message: "您的邮箱已成功更换，可以正常使用，请重新登录！"});
          }else{
            res.send({status: 500, code: 0, message: "此链接已失效，请不要重复点击此链接哦！"});
          }
        }
      });
    }
  });

});

//登录 注册
router.get('/login', function(req, res) {
  "use strict";

  if(req.session.user){
    res.redirect(goBack(req.headers.referer));
  }
  res.render('login');
});

router.route('/login').post(function(req, res) {
  "use strict";
  if(req.session.user){
    res.send({status:403,message:"请不要重复登录！"});
  }
  var email    = req.body.email,
      password = req.body.password,
      hash     = crypto.createHash("sha1").update(new Buffer(password, "binary")).digest('hex');

  factory.getOne({
    key:"User",
    body:{
      email:email,
      password:hash
    }
  },function(err,data){

    if(err){
      res.send({status:200,code:0,message:"登录失败，服务器错误，请重试！"});
    }
    if(data && "email" in data){

      req.session.user = data;

      res.send({status:200,code:1,message:"登录成功！","url":goBack(req.headers.referer)});
    }else{
      res.send({status:200,code:0,message:"登录失败，无此用户或密码错误，请重试！"});
    }
  });
});




router.get('/register', function(req, res) {
  "use strict";
  if(req.session.user){
    res.redirect(goBack(req.headers.referer));
  }
  res.render('register');

});

router.post('/register', function(req, res) {
  "use strict";
  var email      = req.body.email,
      password   = req.body.password,
      repassword = req.body.repassword,
      hash       = crypto.createHash("sha1").update(new Buffer(password, "binary")).digest('hex'),
      regCode    = crypto.createHash("sha1").update(new Buffer(email + (Math.random()*10000000000).toFixed(0), "binary")).digest('hex');

  if(email.length <5 || !/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(email) || password.length < 8 || password !== repassword){
    res.send({status:200,message:"用户名和密码不可以不符合要求！"});
    return;
  }

  factory.getOne({
    key:"User",
    body:{
      email:email
    }
  },function(err,data){
    if(err){
      res.send({status:200,code:0,message:"服务器错误，请重试！"});
      return;
    }

    if(data && data.email){
      res.send({status:200,code:0,message:"已存在此用户！"});
      return;
    }

    factory.save({
      key:"User",
      body:{
        email: email,
        username: email,
        password: hash,
        age: 18,
        regTime:(new Date()).getTime(),
        regIp : req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        sex:null,
        role:5,
        score:0,
        regCode:regCode,
        isActive:0,
        activeTime:0,
        changeEmail:email,
        changeTimes:0
      }
    },function(err,data){

      if(err){
        res.send({status:200,code:0,message:err});
      }
      req.session.user = data;
      sendMail({
        from: config.mail.sendMail,
        to: email,
        subject: '注册成功',
        html: '感谢您注册'+ config.title +'，以下是您的激活链接，\n\r <a href="' + config.url + '/activeAccount/' + regCode + '">'+ config.url + '/activeAccount/' + regCode +'</a>请点击链接以激活您的账户！'
      });
      res.send({status:200,code:1,message:"注册成功，稍后请查询您的邮箱以激活账户！","url":goBack(req.headers.referer)});
    });


  });

});

router.get('/logout', function(req, res) {
  "use strict";
  if(req.session.user){
    req.session.user = null;
  }
  res.redirect(goBack(req.headers.referer));
});

module.exports = router;
