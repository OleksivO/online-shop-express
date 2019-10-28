const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');

const p = path.join(
    rootDir,
    'data',
    'cart.json'
);

module.exports = class Cart {
  static addProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
        let cart = {products: [], totalPrice: 0};
        if(!err) {
            cart = JSON.parse(fileContent);
        }
        const existingProductIndex = cart.products.findIndex(product => product.id === id);
        const existingProduct = cart.products[existingProductIndex];
        let updatedProduct;
        if(existingProduct) {
            updatedProduct = {...existingProduct};
            updatedProduct.qty = updatedProduct.qty + 1;
            cart.products = [...cart.products];
            cart.products[existingProductIndex] = updatedProduct;
        } else {
            updatedProduct = {id, qty: 1};
            cart.products = [...cart.products, updatedProduct]
        }
        cart.totalPrice = cart.totalPrice + +productPrice;
        fs.writeFile(p, JSON.stringify(cart), error => {
            console.error(error)
        })
    })
  }

  static deleteProduct(id, productPrice) {
      fs.readFile(p, (err, fileContent) => {
          if (err) {
              return;
          }
          const cart  = JSON.parse(fileContent);
          const updatedCart = {...cart};
          const product = updatedCart.products.find(prod => prod.id === id);
          if (!product) {
              return;
          }
          const productQty = product.qty;
          updatedCart.products = updatedCart.products.filter(prod => prod.id !== product.id);
          updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;
          fs.writeFile(p, JSON.stringify(updatedCart), error => {
              console.error(error)
          })
      });
  }

  static getCart(cb) {
      fs.readFile(p, (err, fileContent) => {
          const cart = JSON.parse(fileContent);
          if(err) {
             cb(null)
          } else {
              cb(cart);
          }
      })
  }
};