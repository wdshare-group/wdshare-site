## wdshare-site

西安前端交流会(wdshare)官网的源码, 在线地址：http://www.wdshare.org/

## 介绍

wdshare-site 是为西安前端交流会开发的网站程序，主要包括活动，文章等模块，技术上后端使用了 node , express, mongodb 等技术。

## 安装部署

1. 安装 node , mongodb, imageMagick(用于会员上传头像、ueditor、验证码)
2. 启动 mongodb
3. 进入 wdshare-site 源码目录执行 `npm install` 安装所需依赖
4. 执行 `npm start` 启动应用
5. 访问 `http://localhost:3000`
6. 后台管理 `http://127.0.0.1:3000/manage/` 默认用户名密码为 admin/admin

**注意** 

`ueditor-nodejs`需要稍微修改才能适用网站,修该地方如下：
```
\node_modules\ueditor-nodejs\ueditor.js
84行，修改为：'url': '/static' + urlRoot + '/' + file
123行，修改为：'url': '/static' + url
```
都是增加了 static 目录, ueditor-nodejs 中增加了 imageMagick 来压缩图片

## 贡献代码

wdshare-site 还处于不端的开发中，欢迎大家参与进来，提交bug, 给出建议甚至贡献代码。wdshare开发群QQ：116706714