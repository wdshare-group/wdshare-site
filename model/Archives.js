var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    dataBase = require("../server/config.js").db,
    Factory,
    db;

db           = mongoose.connection;

// 请不要使用下面的 save 之后的方法，这些方法 mongoosee 有原生的，更好用。
Archives = function(){
    "use strict";
    this.Schema = Schema;
    this.mongoose = mongoose;
    this.init();
};

Archives.prototype = {
    constructor:Factory,
    init:function(){
        "use strict";
        this.createSchemas();
        this.createModel();
    },
    createSchemas : function(){
        "use strict";
        this.Archivechema = new this.Schema({
            email: {
                type:String,
                unique:true,
                index: true
            },
            username:{
                type:String,
                index: true
            },
            userid:String,
            mood:String,
            sex:Number,
            realname: String,
            tag:String,
            jobstate : Number,
            com: String,
            jobs:String,
            school:String,
            isPartTime:Boolean,
            phone:String,
            qq:String,
            wechat:String,
            www:String,
            weibo:String,
            github:String,
            introduction:String,

            // birthday: Number,

            zan:Number,
            offer:Number,
            updataTime:Number,
            updataIp:String
            
        });
        this.articleCrumbs = new this.Schema({
            title:String,
            content:String,
            url:String,
            template:String,
            addDate:Number,
            editDate:Number,
            click:Number
        });

    },
    createModel : function(){
        "use strict";
        this.Archives     = this.mongoose.model('Archives',this.Archivechema);
        this.Article_crumb  = this.mongoose.model('Article_Crumb',this.articleCrumbs);
    },
    /*
     * obj {}
     * {
     *   key : Archives/Article_Crumb
     *   body:{}
     * }
     * */
    save:function(obj,success,fail){
        "use strict";
        // console.log("save");
        var content = new this[obj.key](obj.body);
        console.log(content);
        content.save(function(err,doc){
            success && success(err,doc);
        });
    },
    /*
     * obj {}
     * {
     *   key : Archives/Article_Crumb
     * }
     * */
    getAll : function(obj,callback){
        "use strict";
        var condition = obj.body || {};
        this[obj.key].find(condition).exec(function(err,doc){
            callback && callback(err,doc);
        });
    },
    getAllByConditions : function(obj,callback){
        "use strict";
        this[obj.key].find(obj.query,obj.fields,obj.options).exec(function(err,doc){
            callback && callback(err,doc);
        });
    },
    getOne : function(obj,callback){
        "use strict";
        this[obj.key].findOne(obj.body,function(err,doc){
            callback && callback(err,doc);
        });
    },
    update : function(conditions,obj,callback){
        "use strict";
        this[obj.key].update(conditions,{$set:obj.body},obj.option,function(err,num){
            callback && callback(err,num,obj.body);
        });
    },
    count:function(conditions,obj,callback){
        "use strict";
        this[obj.key].count(conditions,function(err,mount){
            callback && callback(err,mount);
        });
    },
    remove : function(obj,callback){
        "use strict";
        this[obj.key].remove(obj.body,function(err,doc){
            callback && callback(err,doc);
        });
    }
};

module.exports = Archives;
