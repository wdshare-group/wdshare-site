var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    dataBase = require("../server/config.js").db,
    Factory,
    db;

db           = mongoose.connection;

// 请不要使用下面的 save 之后的方法，这些方法 mongoosee 有原生的，更好用。
Jobs = function(){
    "use strict";
    this.Schema = Schema;
    this.mongoose = mongoose;
    this.init();
};

Jobs.prototype = {
    constructor:Factory,
    init:function(){
        "use strict";
        this.createSchemas();
        this.createModel();
    },
    createSchemas : function(){
        "use strict";
        this.companieSchema = new this.Schema({
            manage:String,
            name:String,
            intro:String,
            realm:String,
            scale:String,
            www:String,
            seedtime:String,
            city:String,
            address:String,
            mapLng:Number,
            mapLat:Number,
            mapZoom:Number,
            mapCityCode:Number,
            contactName:String,
            tel:String,
            mail:String,
            tag:String,
            tpl:String,
            product:String,
            content:String,
            click:Number,
            audit:Boolean,
            addDate:Number,
            editDate:Number
        });
        this.jobChannel = new this.Schema({
            parent:Number,
            name:String,
            description:String,
            order:Number,
            addDate:Number,
            editDate:Number
        });
        this.sentResume = new this.Schema({
            title:String,
            userid:String,
            username:String,
            userArticle:Number,
            userProject:Number,
            userZan:Number,
            userOffer:Number,

            mail:String,
            workingLife:String,
            diploma:String,
            tel:String,
            resumes:String,
            github:String,
            www:String,
            content:String,

            jobid:String,
            jobTitle:String,
            jobUserid:String,
            jobContactName:String,
            jobContactName:String,
            jobContactMail:String,

            companyid:String,
            companyTitle:String,
            companyContactName:String,
            companyContactTel:String,
            companyContactMail:String,

            sentState:Boolean,
            sentIp:String,
            addDate:Number
        });

    },
    createModel : function(){
        "use strict";
        this.Companie     = this.mongoose.model('Companie',this.companieSchema);
        this.Job_channel  = this.mongoose.model('Job_channel',this.jobChannel);
        this.Sent_resume  = this.mongoose.model('Sent_resume',this.sentResume);
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

module.exports = Jobs;
