var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = 'mongodb://localhost:27017/wdshare';
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
        collection.find(query).toArray(function(err, result) {
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

activeControl.join = function(aid,joinObj){
    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if(err){
            db.close();
            deferred.reject(err);
            return ;
        }
        var collection = db.collection('active');
        //console.log(joinObj);

        collection.findOne({
            _id:new ObjectId(aid),
            aUsers: { $elemMatch: { mail: joinObj.mail }}
        },function(err,result){
            if(!result){
                collection.update({
                        _id:new ObjectId(aid)
                    },
                    {$push:{aUsers:joinObj}},
                    {w:1},
                    function(err,result){
                        if(err){
                            db.close();
                            deferred.reject(err);
                            return;
                        }
                        db.close();
                        deferred.resolve(result);
                    })
            }else{
                collection.update({
                        _id:new ObjectId(aid),
                        aUsers: { $elemMatch: { mail: joinObj.mail }}
                    },
                    {$set:{"aUsers.$":joinObj}},
                    {w:1},
                    function(err,result){
                        if(err){
                            db.close();
                            deferred.reject(err);
                            return;
                        }
                        db.close();
                        deferred.resolve(result);
                    });
            }
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
