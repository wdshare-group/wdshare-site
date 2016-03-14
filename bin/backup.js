var cp = require('child_process');
var nodemailer = require('nodemailer');
var later = require('later');

later.date.localTime();
var sched = later.parse.text('at 1:11 am');
// var sched = later.parse.recur().every(2).second(); // 每两秒发送一次，测试使用

var mailAddress = ['ggiiss@qq.com', "106324307@qq.com"];
// var mailAddress = ['ggiiss@qq.com'];

var backupPath = "mongodb/";
var backupTime = getTime();
// var backupPath = "/var/www/bak/mongodb/";

// /var/www/bak/mongodb/201512111037
var backupFolder = backupPath + backupTime;

var tarFilename = 'wdshare-bak-' + backupTime + '.tar.gz';
// /var/www/bak/mongodb/wdshare-bak-201512111037.tar.gz
var tarFilepath = backupPath + tarFilename;

// 生成 yyyymmddhhmmsss 格式的时间
function getTime(){
  var now = new Date();
  var output = [];
  output.push(now.getFullYear());
  output.push(now.getMonth() + 1);
  output.push(now.getDate());
  output.push(now.getHours());
  output.push(now.getMinutes());
  output.push(now.getSeconds());
  
  output = output.map(function(item){
    return Number(item) > 9 ? item : '0' + item;
  })
  return  output.join('');
}

function generateNames(){
  backupTime = getTime();
  backupFolder = backupPath + backupTime;
  tarFilename = 'wdshare-bak-' + backupTime + '.tar.gz';
  tarFilepath = backupPath + tarFilename;  
}

// 生成备份文件 /var/www/bak/mongodb/201512111037'
function createBack(callback){
  var createCMD = 'mongodump --host 127.0.0.1 --port 27017 -d wdshare -o ' + backupPath + backupTime;
  cp.exec(createCMD,{}, function(err, stdout, stderr){
    callback(err);
  })   
}


// 生成 wdshare-bak-201512111012.tar.gz 备份文件
function backup(err, callback){
  if(err){
    throw err;
  }
  var tarCMD = 'tar czf ' + tarFilepath + ' ' + backupFolder;
  cp.exec(tarCMD,{}, function(err, stdout, stderr){
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
  generateNames();
  createBack(function(err, callback){
    backup(err, function(err, callback){
      sendMain();
    })
  });
}, sched); 