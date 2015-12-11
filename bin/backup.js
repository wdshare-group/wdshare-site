var nodemailer = require('nodemailer');
var later = require('later');
// var sched = later.parse.recur().every(24).hour();
var sched = later.parse.recur().every(24).hour();

var cp = require('child_process');

var mailAddress = ['ggiiss@qq.com', "106324307@qq.com"];
// var mailAddress = ['ggiiss@qq.com'];

var backupTime = getTime();
// var backupPath = "/var/www/bak/mongodb/";
var backupPath = "mongodb/";
// /var/www/bak/mongodb/201512111037
var backupFolder = backupPath + backupTime;

var tarFilename = 'wdshare-bak-' + backupTime + '.tar.gz';
// /var/www/bak/mongodb/wdshare-bak-201512111037.tar.gz
var tarFilepath = backupPath + tarFilename;

function getTime(){
  var now = new Date();
  var output = [];
  output.push(now.getFullYear());
  output.push(now.getMonth() + 1);
  output.push(now.getDate());
  output.push(now.getHours());
  output.push(now.getMinutes());
  return  output.join('');
}

// 生成备份文件 /var/www/bak/mongodb/201512111037'
function createBack(callback){
  var createCMD = 'mongodump --host 127.0.0.1 --port 27017 -db wdshare -o ' + backupPath + backupTime +' 2>/dev/null';
  cp.exec(createCMD,{}, function(err, stdout, stderr){
      // console.log('stdout: ' + stdout);
      // console.log('stderr: ' + stderr);
    callback(err);
  })   
}


// 生成 wdshare-bak-201512111012.tar.gz 备份文件
function backup(err, callback){
  if(err){
    throw err;
  }
  var tarCMD = 'tar czf ' + tarFilepath + ' ' + backupFolder;
  console.log(tarCMD);
  cp.exec(tarCMD,{}, function(err, stdout, stderr){
      // console.log('stdout: ' + stdout);
      // console.log('stderr: ' + stderr);
    callback(err);
  })    
}

var transporter = nodemailer.createTransport({
  service: 'QQ',
  auth: {
    user: '544580627@qq.com',
    pass: 'zjwhgcrrmgaebfjf'
  }
}, {
  from: 'ggiiss<544580627@qq.com>'
});

// 发送 备份文件到指定邮箱
function sendMain(){
  var mailOptions = {
    to: mailAddress.join(','),
    subject: 'wdshare backup file',
    text: 'wdshare backup file',
    html: 'wdshare backup file',
    attachments: [{
      path: tarFilepath
    }]
  };
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });  
}

// 启动
later.setInterval(function() { 
  createBack(function(err, callback){
    backup(err, function(err, callback){
      sendMain();
    })
  });
}, sched); 