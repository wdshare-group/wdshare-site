/**
 * F7 20150616
 */
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var dataBase = require("../server/config.js").db;
var url = 'mongodb://localhost/'+dataBase;
var ObjectId = mongo.ObjectID;
var Q = require('q');
var indexControl = {};



indexControl.find = function(query){
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


module.exports = indexControl;
