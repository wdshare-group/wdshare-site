var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var config = require("../../server/config.js");
var dataBase = config.db;
var url = 'mongodb://localhost/'+dataBase;
var ObjectId = mongo.ObjectID;
var Q = require('q');
var activeControl = {};

/**
 * 创建活动接口
 * @param ao 活动json对象
 * @returns {*|promise}
 */
activeControl.create = function(ao){
    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if(err){
            deferred.reject(err);
            return ;
        }

        // 添加其余参数
        ao.aAddDate = new Date().getTime();
        
        var collection = db.collection('active');
        collection.insert(ao, {safe:true}, function(err, result) {
            if(err){
                db.close();
                deferred.reject(err);
                return;
            }
            deferred.resolve(result);
            db.close();
        });

        /*
        collection.findOneAndReplace({aName:ao.aName},{$set:ao},{w:1}, function(err, result) {
            if(err){
                db.close();
                deferred.reject(err);
                return;
            }
            deferred.resolve(result);
            db.close();
        });*/

    });
    return deferred.promise;
};

/**
 * 更新活动
 * @param id
 * @param ao
 * @returns {*|promise}
 */
activeControl.update = function(id,ao){
    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if(err){
            db.close();
            deferred.reject(err);
            return ;
        }
        var collection = db.collection('active');
        var obj = {
            "aName" : ao["aName"],
            "aClass" : ao["aClass"],
            "aTime" : ao["aTime"],
            "aJoinEndTime":ao["aJoinEndTime"],
            "aAddress" : ao["aAddress"],
            "aStatus" : ao["aStatus"],
            "aSummary" : ao["aSummary"],
            "aContent" : ao["aContent"],
            "aComment" : ao["aComment"],
            "aCodebefor" : ao["aCodebefor"],
            "aSort" : ao["aSort"],
            "aTpl" : ao["aTpl"],
            "aEmailTpl" : ao["aEmailTpl"]
            // "aAddDate" : new Date(ao["aAddDate"]).getTime()
        };
        collection.findOneAndUpdate({_id:new ObjectId(id)},{$set:obj},{w:1, upsert: true}, function(err, result) {
            if(err){
                db.close();
                deferred.reject(err);
                return;
            }
            db.close();
            deferred.resolve(result);
        });
    });
    return deferred.promise;
};

/**
 * 删除活动
 * @param query
 * @returns {*|promise}
 */
activeControl.del = function(query){
    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if(err){
            db.close();
            deferred.reject(err);
            return ;
        }
        var collection = db.collection('active');

        collection.findOneAndDelete(query, function(err, result) {
            if(err){
                db.close();
                deferred.reject(err);
                return;
            }
            db.close();
            deferred.resolve(result);
        });
    });
    return deferred.promise;
};

/**
 * 查询活动
 * @param query
 * @returns {*|promise}
 */
activeControl.find = function(query){
    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if(err){
            db.close();
            deferred.reject(err);
            return ;
        }
        var collection = db.collection('active');
        collection.find(query).sort({"aAddDate":-1}).toArray(function(err, result) {
            if(err){
                db.close();
                deferred.reject(err);
                return;
            }

            db.close();
            deferred.resolve(result);
        });

    });
    return deferred.promise;
};


/**
 * 查询报名
 * @param query
 * @returns {*|promise}
 */
activeControl.findJoin = function(query){
    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if(err){
            db.close();
            deferred.reject(err);
            return ;
        }
        var collection = db.collection('active_join');
        collection.find(query).sort({"addDate":-1}).toArray(function(err, result) {
            if(err){
                db.close();
                deferred.reject(err);
                return;
            }

            db.close();
            deferred.resolve(result);
        });

    });
    return deferred.promise;
};

/**
 * 打印时查询报名
 * @param query
 * @returns {*|promise}
 */
activeControl.findJoinprint = function(query){
    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if(err){
            db.close();
            deferred.reject(err);
            return ;
        }
        var collection = db.collection('active_join');
        collection.find(query).sort({"addDate":1}).toArray(function(err, result) {
            if(err){
                db.close();
                deferred.reject(err);
                return;
            }

            db.close();
            deferred.resolve(result);
        });

    });
    return deferred.promise;
};



/**
 * 报名信息变更
 * @param query 查询对象
 * @param o 调整键值对象，键位字段名称
 * @returns {*|promise}
 */
activeControl.joinUpdate = function(query, o){
    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if(err){
            db.close();
            deferred.reject(err);
            return ;
        }
        var collection = db.collection('active_join');
        collection.findOneAndUpdate(query,{$set:o},{w:1, upsert: true}, function(err, result) {
            if(err){
                db.close();
                deferred.reject(err);
                return;
            }
            db.close();
            deferred.resolve(result);
        });
    });
    return deferred.promise;
};

/**
 * 删除报名
 * @param query
 * @returns {*|promise}
 */
activeControl.joindel = function(query){
    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if(err){
            db.close();
            deferred.reject(err);
            return ;
        }
        var collection = db.collection('active_join');

        collection.findOneAndDelete(query, function(err, result) {
            if(err){
                db.close();
                deferred.reject(err);
                return;
            }
            db.close();
            deferred.resolve(result);
        });
    });
    return deferred.promise;
};


module.exports = activeControl;
