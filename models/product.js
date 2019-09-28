const fs = require('fs');
const path = require('path');

const rootDir = require('../util/path');

const p = path.join(
    rootDir,
    'data',
    'products.json'
);

const getProductsFromFile = cb => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            cb([]);
        } else {
            cb(JSON.parse(fileContent));
        }
    });
};

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile(products => {
            if(this.id) {
                console.log('Found id');
                const prodIndex = products.findIndex(product => product.id === this.id);
                const updatedProducts = [...products];
                updatedProducts[prodIndex] = this;
                console.log('Products', updatedProducts);
                fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                });
            } else {
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), err => {
                });
            }
        });
    }

    static fetchAll(cb) {
        getProductsFromFile(cb);
    }

    static findById(id, cb) {
        getProductsFromFile((products => {
           const product =  products.find(product => product.id === id);
           cb(product);
        }))
    }
};
