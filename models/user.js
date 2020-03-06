const mongodb = require('mongodb');
const {getDB} = require('../util/database');

class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart;
        this._id = new mongodb.ObjectId(id)
    }


    save() {
        const db = getDB();
        const dbOperation = db.collection('users').insertOne(this);
        return dbOperation.catch(error => console.log('DB error', error))
    }

    addToCart(product) {
        const db = getDB();
        const cartProductIndex = this.cart.items.findIndex(cp => cp.productId.toString() === product._id.toString() );
        const updatedCartItems = [...this.cart.items];
        let newQuantity = 1;
        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({productId: new mongodb.ObjectId(product._id), quantity: newQuantity})
        }
        const updatedCart = {
            items: updatedCartItems
        };
        return db.collection('users')
            .updateOne(
                {_id: this._id},
                {$set: {cart: updatedCart}}
                )
    }

    getCart() {
        const db = getDB();
        const productIds = this.cart.items.map(item => item.productId);
        return db.collection('products')
            .find({_id: {$in: productIds}})
            .toArray()
            .then(products => {
                return products.map(p => {
                    return {
                        ...p,
                        quantity: this.cart.items.find(item => item.productId.toString() === p._id.toString()).quantity
                    }
                })
            })
    }

    deleteProductFromCart(productId) {
        const db = getDB();
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString()
        });
        return db.collection('users')
            .updateOne(
                {_id: this._id},
                {$set: {cart: { items: updatedCartItems}}}
            )

    }

    addOrder() {
        const db = getDB();
        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: this._id,
                        name: this.name,
                        email: this.email
                    }
                };
                return db.collection('orders').insertOne(order)
            })
            .then(() => {
                this.cart = {items: []};
                return db.collection('users')
                    .updateOne(
                        {_id: this._id},
                        {$set: {cart: { items: []}}}
                    )
            })
    }

    getOrders() {
        const db = getDB();
        return db.collection('orders').find({'user._id': this._id}).toArray()
    }

    static findById(userId) {
        const db = getDB();
        return db.collection('users')
            .findOne({_id: new mongodb.ObjectId(userId)})
            .then(user => {
                return user;
            })
            .catch(error => console.log('DB error', error))
    }
}

module.exports = User;