该表是使用别人的程序自带的表，所有有些东西还不能完全掌握
{
	"_id": ObjectId("5539af9e20fa7ee8183d1726"),// 主键，自增ID
	"email": "3235183@163.com",// 邮箱
	"username": "3235183@163.com",// 昵称
	"password": "317e0a55077fb034b1d022f85b840f0d50544168",// 密码
	//"age": 18,// 年龄
	"lastLoginIp": "127.0.0.1",// 最后登录IP
	"lastLoginTime": 1441593223404,// 最后登录时间
	"regTime": 1429843870784,// 注册时间
	"regIp": "127.0.0.1",// 注册IP
	//"sex": null,// 性别
	//"role": 5,// 任务
	//"score": 0,// 得分
	"regCode": "a6a9b260cb94a6498e13049a8e781b18d7bdd2c0",// 注册码，用于激活
	"isActive": false,// 是否已激活
	"activeTime": 0,// 激活时间
	"changeEmail": "3235183@163.com",
	"changeTimes": 0,
	"lock": false,// 帐号是否锁定
	"lockTime": 1429843870784, // 锁定时间
	"lockMessage": "账号非法操作",// 锁定原因
	"vip":"article_send,other"// 会员vip权限：article_send代表会员发布和修改文章不需要审核，other有其他权限时在这里增加
	


	新建表存储如下信息
	// 还将增加的字段
	
	发布项目数【联合多表查询--检索项目作者获取数量】

	勋章【联合多表查询--勋章表】

	会员头像【/user/face/:id 直接访问文件】
}



// 修改密码为：111111
db.users.update({email: "3235183@163.com"}, {$set: {password: '3d4f2bf07dc1be38b20cd6e46949a1071f9d0e3d'}}, false, true);

db.users.update({email: "3235183@163.com"}, {$set: {lock: true, lockTime:1429843870784, lockMessage:"账号非法操作"}}, false, true);
db.users.update({email: "3235183@163.com"}, {$set: {lock: false, lockTime:0, lockMessage:""}}, false, true);