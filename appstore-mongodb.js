var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

appstore = function(host, port) {
  this.db= new Db('node-mongo-demark', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

appstore.prototype.getCollection= function(callback) {
  this.db.collection('applications', function(error, apps_collection) {
    if (error)
	callback(error);
    else
	callback(null, apps_collection);
  });
};


appstore.prototype.all = function(callback) {
    this.getCollection(function(error, apps_collection) {
      if (error)
	  callback(error)
      else {
        apps_collection.find().toArray(function(error, results) {
          if (error)
	      callback(error)
          else
	      callback(null, results)
        });
      }
    });
};

appstore.prototype.findById = function(id, callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
        article_collection.findOne({_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

appstore.prototype.save = function(apps, callback) {
    this.getCollection(function(error, apps_collection) {
      if (error)
	  callback(error)
      else {
        if (typeof(apps.length)=="undefined")
          apps = [apps];

        for(var i=0;i<apps.length;i++) {
          apps[i].created_at = new Date();
        }

        apps_collection.insert(apps, function() {
          callback(null, apps);
        });
      }
    });
};

exports.appstore = appstore;
