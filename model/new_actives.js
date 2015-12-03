var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    dataBase = require("../server/config.js").db,
    Factory,
    db;

db           = mongoose.connection;

// 请不要使用下面的 save 之后的方法，这些方法 mongoosee 有原生的，更好用。
Active = function(){
    "use strict";
    this.Schema = Schema;
    this.mongoose = mongoose;
    this.init();
};

Active.prototype = {
    constructor:Factory,
    init:function(){
        "use strict";
        this.createSchemas();
        this.createModel();
    },
    createSchemas : function(){
        "use strict";
        this.Activechema = new this.Schema({
            aId:String,//貌似没用
            aClass:String,
            aName:String,
            aTime:String,
            aAddress:String,
            aSummary:String,
            aContent:String,
            aStatus:String,
            aComment:String,
            aSort:String,
            aTpl:String,
            aEmailTpl:String,
            aAddDate:Number,
            aCodebefor:String,
            aClick:Number
            
        });
        this.activeJoin = new this.Schema({
            aid:String,
            mail:String,
            name:String,
            com:String,
            web:String,
            content:String,
            chi:String,
            addDate:Number,
            invite:Number,
            state:Number,
            code:Number,
            joinMailState:Boolean,
            inviteState:Boolean
        });
        this.activeChannel = new this.Schema({
            name:String,
            url:String,
            parent:String,
            keywords:String,
            description:String,
            addDate:Number,
            editDate:Number
        });
    },
    createModel : function(){
        "use strict";
        this.Active     = this.mongoose.model('Active',this.Activechema);
        this.Active_join  = this.mongoose.model('Active_join',this.activeJoin);
        this.Active_channel  = this.mongoose.model('Active_channel',this.activeChannel);
    },
    /*
     * obj {}
     * {
     *   key : Active
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
     *   key : Active
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
        this[obj.key].find(condition).skip(start).limit(obj.pages.pagesize).sort('-'+obj.occupation).exec(function(err,doc){
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

module.exports = Active;
