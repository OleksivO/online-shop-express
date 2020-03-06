const mongodb = require('mongodb');
const {getDB, mongoConnect} = require('../util/database');

class Product {
    constructor(title, price, description, imageUrl, id, userId) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl= imageUrl;
        this._id = id ? new mongodb.ObjectId(id) : null;
        this.userId = userId
    }

    save() {
        const db = getDB();
        let dbOperation;
        if(this._id) {
            dbOperation = db.collection('products').updateOne({_id: this._id}, {$set: this})
        } else {
            dbOperation = db.collection('products').insertOne(this)
        }

        return dbOperation.catch(error => console.log('DB error', error))
    }

    static fetchAll() {
        const db = getDB();
        return db.collection('products')
            .find()
            .toArray()
            .then(products => {
                return products
            })
            .catch(error => console.log('DB error', error))
    }

    static findById(prodId) {
        const db = getDB();
        return db.collection('products')
            .find({_id: new mongodb.ObjectId(prodId)})
            .next()
            .then(product => {
                return product;
            })
            .catch(error => console.log('DB error', error))
    }

    static deleteById(prodId) {
        const db = getDB();
        return db.collection('products')
            .deleteOne({_id: new mongodb.ObjectId(prodId)})
            .catch(error => console.log('DB error', error))
    }
}

module.exports = Product;