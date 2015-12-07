<<<<<<< HEAD
﻿## wdshare-site
xi'an wdshare.org website

##思维导图：

http://mindmap.4ye.me/eFokkvX5/1

##原型：

/doc/prototype

##帮助文档：

/doc


## mongodb

客户端： http://robomongo.org/  跨平台

系统组件需求：
 	需要安装 ImageMagick 组件 【会员上传头像、ueditor、验证码】都有用到

node组件调整：
	\node_modules\ueditor-nodejs\ueditor.js
	84行，修改为：'url': '/static' + urlRoot + '/' + file
	123行，修改为：'url': '/static' + url,
	都是增加了 static 目录

	ueditor-nodejs 中增加了 imageMagick 来压缩图片



ueditor的修改：
	去掉多图上传中的“搜索图片”tab




###mongdodb win系统设置为服务方法：
mongod --bind_ip 127.0.0.1 --logpath "D:\environment\mongodb\log\wd.log" --logappend --dbpath "D:\environment\mongodb\wddata" --port 27017 --serviceName "mongods" --serviceDisplayName "mongods" --install

###mongodb 入门：
http://mongodb.github.io/node-mongodb-native/api-articles/nodekoarticle1.html
=======
# wdshare-site
xi'an wdshare.org website


思维导图：http://mindmap.4ye.me/eFokkvX5/1
>>>>>>> origin/master
