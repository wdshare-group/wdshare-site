var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var config = require("../server/config.js");
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
            "aSort" : ao["aSort"],
            "aTpl" : ao["aTpl"],
            "aAddDate" : new Date(ao["aAddDate"]).getTime()
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

// 报名存储处理
activeControl.join = function(ao){
    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if(err){
            deferred.reject(err);
            return ;
        }

        // 添加其余参数
        ao.addDate = new Date().getTime();
        
        var collection = db.collection('active_join');

        // 检测是否已经存在记录
        collection.findOne({
            aid:ao.aid,
            mail: ao.mail
        },function(err,result){
            if(!result){
                // 添加新纪录
                collection.insert(ao, {safe:true}, function(err, result) {
                    result.repeat = false;// 记录存在标识
                    if(err){
                        db.close();
                        deferred.reject(err);
                        return;
                    }
                    deferred.resolve(result);
                    db.close();
                });
            }else{
                // 记录已存在，直接反馈
                result.repeat = true;// 记录存在标识

                if(err){
                    db.close();
                    deferred.reject(err);
                    return;
                }
                deferred.resolve(result);
                db.close();
            }
        });


        /*collection.insert(ao, {safe:true}, function(err, result) {
            // console.log("join:" + err);
            result.abc = "F7-abc";
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

// 记录点击
activeControl.click = function(id, click) {
    var count = click || 0;
    count++;
    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if(err){
            db.close();
            deferred.reject(err);
            return ;
        }
        var collection = db.collection('active');
        var obj = {
            "aClick" : count
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


// todo:显示所有用户
activeControl.listAllUsers = function(){

    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {

    });
    return deferred.promise;
};


module.exports = activeControl;
