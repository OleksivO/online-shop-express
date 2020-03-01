const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
    MongoClient.connect('mongodb+srv://oleksandr:mHYKUUPJDc8fuvjN@cluster0-1ulot.mongodb.net/express-shop?retryWrites=true&w=majority')
        .then(client => {
            console.log('Connected to DB');
            _db = client.db();
            callback()
        })
        .catch(error => {
            console.error('DB error', error);
            throw error;
        });
};

const getDB = () => {
    if (_db) {
        return _db;
    }
};

exports.mongoConnect = mongoConnect;
exports.getDB = getDB;