该表是使用别人的程序自带的表，所有有些东西还不能完全掌握
{
	"_id": ObjectId("5539af9e20fa7ee8183d1726"),// 主键，自增ID
	"email": "3235183@163.com",// 邮箱
	"username": "3235183@163.com",// 昵称
	"password": "317e0a55077fb034b1d022f85b840f0d50544168",// 密码
	"age": 18,// 年龄
	"regTime": 1429843870784,// 注册事件
	"regIp": "127.0.0.1",// 注册IP
	"sex": null,// 性别
	"role": 5,// 任务
	"score": 0,// 得分
	"regCode": "a6a9b260cb94a6498e13049a8e781b18d7bdd2c0",// 注册码，不清楚肝肾恶魔的
	"isActive": false,// 是否已激活
	"activeTime": 0,// 激活时间
	"changeEmail": "3235183@163.com",
	"changeTimes": 0,
	"__v": 0


	// 还将增加的字段
	发布文章数【联合多表查询--检索文章作者获取数量】
	发布项目数【联合多表查询--检索项目作者获取数量】
	收集赞总数【联合多表查询--文章赞+项目赞总数量】
	收集到的橄榄枝【联合多表查询--个人留言表，获取橄榄枝留言类型】
	标签【联合多表查询--标签表】
	勋章【联合多表查询--勋章表】
	签名【新建字段】
	会员头像【新建字段】
}



// 修改密码为：111111
db.users.update({email: "3235183@163.com"}, {$set: {password: '3d4f2bf07dc1be38b20cd6e46949a1071f9d0e3d'}}, false, true);