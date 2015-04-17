var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:50000,localhost:50001/wdshare?w=0&readPreference=secondary';
var Q = require('q');
var activeControl = {};

activeControl.create = function(ao){
    var deferred = Q.defer();
    var name = ao['name'];
    MongoClient.connect(url, function(err, db) {
        if(err){
            deferred.reject(err);
            return ;
        }


        var collection = db.collection('active');
        collection.insert(ao, {w:1}, function(err, result) {
            if(err){
                deferred.reject(err);
                return;
            }
            // Fetch the document
            collection.find().toArray(function(err, item){
                if(err){
                    deferred.reject(err);
                    return;
                }
                console.log('item',item);
                db.close();
                deferred.resolve();
            })
        });

        //collection.update({users:[]},function(){
        //
        //});
        //collection.insert([joinObj],function(err,result){
        //    console.log("Connected correctly to server");
        //    deferred.resolve(result);
        //    db.close();
        //});
    });
    return deferred.promise;
};

activeControl.sign = function(joinObj){
    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if(err){
            deferred.reject(err);
            return ;
        }
        var collection = db.collection('active');
        collection.update({users:[]},function(){

        });
        //collection.insert([joinObj],function(err,result){
        //    console.log("Connected correctly to server");
        //    deferred.resolve(result);
        //    db.close();
        //});
    });
    return deferred.promise;
};

module.exports = activeControl;
