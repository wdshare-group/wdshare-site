文档存储，目前包含文章、招聘内容
{
	"_id": ObjectId("55ab44c94665dd2c10ce5f5f"),// 主键，自增ID
	"type": 1,// 数据模型：1为文章、2为项目、3为招聘
	"channelId": "",// 分类名称
	"editorModel": "",// 可选，为空代表uEditor，markdown时代表markdown编辑器
	"title": "",// 内容标题
	//"linkType":false,// 是否为跳转
	"linkUrl":"",// 跳转链接地址
	"diyType":"",// 自定义属性【1头条、2推荐、3加粗】
	"color":"#000000",// 显示颜色
	"cover":"",// 缩略图地址
	"content": "",// 内容
	"keywords": "",// 关键字
	"description": "",// 描述
	"tpl": "",// 内容模板，权重高于分类指定的模板
	"tag": "",// 文章标签
	"source":"",// 文章来源
	"sourceUrl":"",// 文章来源链接
	"rank":0,// 文章排序
	"sortup":false,// 置顶
	"addDate": 1437287625502,// 添加时间
	"editDate": 1437287625502,// 修改时间
	"click": 321,// 浏览次数
	"userId": "",// 添加用户的ID
	"zan": "",// 点赞数
	"isComment":true// 是否允许评论 true 允许  false 不允许
	"audit": true,// 是否审核  false未审核，true已审核
	"rejected":"",// 驳回审核的理由
	"rejectedData":1437287625502// 驳回时间

	"garbage": false,// 是否已回收站[招聘模块启用]  true已回收，false未回收 ［下线标识］

	// 招聘添加
	"allure": "免费午餐、免费旅游、股票期权",// 职位诱惑
	"workingLife": "55ab44c94665dd2c10ce5f5f",// 工作年限［无限制、应届毕业生、1年以下、1-3年、3-5年、5-10年、10年以上］
	"diploma": "55ab44c94665dd2c10ce5f5f",// 学历［无限制、大专、本科、硕士、博士］
	"salaryStart": 2,// 薪资范围开始，单位k
	"salaryEnd": 10,// 薪资范围结束，单位k
	"jobType": "55ab44c94665dd2c10ce5f5f",// 全职、兼职、实习；调取分类列表
	"companys":"55ab44c94665dd2c10ce5f5f",// 归属企业
	"city":"55ab44c94665dd2c10ce5f5f",// 工作城市［西安、宝鸡、渭南］，调用分类列表
	"address": ""// 详细地址，不填写直接读取公司地址
	"mapLng":108.953439,// 地图坐标 经度
	"mapLat":34.265672,// 地图坐标 纬度
	"mapZoom":12,//地图显示的比例
	"mapCityCode":233,//地图城市编码
	"contactName":"某某某",// 联系人
	"tel":"",// 联系电话，不填写直接读取公司地址
	"mail":"",// 联系邮箱，不填写直接读取公司地址
	"jobbase": 3,// 现有该职位人数
	"jobmax": 5,// 扩充至多少人
}