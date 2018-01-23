var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://williamTaruschio:taruschio2@ds159112.mlab.com:59112/pw_e-commerce';

module.exports = {
    find: function (collection, query, sorting, callback) {
        MongoClient.connect(url, function (err, db) {
            if (err) { callback(err); }
            db.collection(collection).find(query).sort(sorting).toArray(function (err, result) {
                if (err) throw err;
                db.close();
                callback(result);
            });
        });
    },
    remove: function (collection, query, callback) {
        MongoClient.connect(url, function (err, db) {
            if (err) { callback(err); }
            var res = db.collection(collection).remove(query);
            db.close();
            callback(res);
        });
    },
    insert: function (collection, query, callback) {
        MongoClient.connect(url, function (err, db) {
            if (err) { callback(err); }
            db.collection(collection).insert(query, function (err, docsInserted) {
                if (err) throw err;
                db.close();
                callback(docsInserted.ops);
            })
        });
    },
    update: function (collection, query, newdata, callback) {
        MongoClient.connect(url, function (err, db) {
            if (err) { callback(err); }
            var res = db.collection(collection).update(query, { $set: newdata }, { multi: true });
            db.close();
            callback(res);
        });
    }
};