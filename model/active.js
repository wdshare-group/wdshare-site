var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var config = require("../server/config.js");
var url = 'mongodb://'+config.dbUser+':'+config.dbPass+'@localhost/'+config.db;
var ObjectId = mongo.ObjectID;
var Q = require('q');
var activeControl = {};


activeControl.find = function(query){
    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if(err){
            db.close();
            deferred.reject(err);
            return ;
        }
        var collection = db.collection('actives');
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
        ao.invite = 0;// 是否已邀请 0未邀请，1已邀请
        ao.state = 1;// 报名状态：0屏蔽，1开启，2已发送邀请，3用户确认
        ao.code = "";// 生成的邀请码
        
        var collection = db.collection('active_joins');

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
        var collection = db.collection('active_joins');
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
        var collection = db.collection('active_joins');
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
        var collection = db.collection('actives');
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
