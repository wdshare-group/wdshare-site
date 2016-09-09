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
        this.archiveSchema = new this.Schema({
            type:Number,
            channelId:String,
            title:String,
            //linkType:Boolean,
            linkUrl:String,
            diyType:String,
            color:String,
            cover:String,
            content:String,
            keywords:String,
            description:String,
            tpl:String,
            tag:String,
            source:String,
            sourceUrl:String,
            rank:Number,
            sortup:Boolean,
            addDate:Number,
            editDate:Number,
            click:Number,
            userId:String,
            zan:String,
            isComment:Boolean,
            audit:Boolean,
            rejected:String,
            rejectedData:Number,

            garbage:Boolean,

            // 招聘添加
            allure:String,
            workingLife:String,
            diploma:String,
            salaryStart:Number,
            salaryEnd:Number,
            jobType:String,
            companys:String,
            city:String,
            address:String,
            mapLng:Number,
            mapLat:Number,
            mapZoom:Number,
            mapCityCode:Number,
            contactName:String,
            tel:String,
            mail:String,
            jobbase:Number,
            jobmax:Number
        });
        this.articleChannel = new this.Schema({
            name:String,
            url:String,
            parent:String,
            end_tpl:String,
            keywords:String,
            description:String,
            addDate:Number,
            editDate:Number
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
        this.Archive     = this.mongoose.model('Archive',this.archiveSchema);
        this.Article_channel  = this.mongoose.model('Article_channel',this.articleChannel);
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
        // console.log(content);
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

    /**
     * Person
      .find({ occupation: /host/ })
      .where('name.last').equals('Ghost')
      .where('age').gt(17).lt(66)
      .where('likes').in(['vaporizing', 'talking'])
      .limit(10)
      .sort('-occupation')
      .select('name occupation')
      .exec(callback);
     */
    getSort : function(obj,callback){
        "use strict";
        var condition = obj.body || {},
            start = (obj.pages.page - 1) * obj.pages.pagesize || 0;
        if ( typeof obj.occupation == "object" ) {
            this[obj.key].find(condition).skip(start).limit(obj.pages.pagesize).sort(obj.occupation).exec(function(err,doc){
                callback && callback(err,doc);
            });
        } else {
            this[obj.key].find(condition).skip(start).limit(obj.pages.pagesize).sort('-'+obj.occupation).exec(function(err,doc){
                callback && callback(err,doc);
            });
        }
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
