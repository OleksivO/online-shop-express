const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
    Product.findAll()
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All products',
                path: '/products'
            });
        })
        .catch(err => console.error('DB error', err));
};

exports.getProduct = (req, res, next) => {
    const productId = req.params['productId'];
    Product.findByPk(productId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            })
        })
        .catch(err => console.error('DB error', err));
};

exports.getIndex = (req, res, next) => {
    Product.findAll()
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/'
            });
        })
        .catch(err => console.error('DB error', err));
};

exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll()
            .then(([products, fieldData]) => {
                const cartProducts = [];
                for (let product of products) {
                    const cartProductData = cart.products.find(prod => prod.id === product.id);
                    if(cartProductData) {
                        cartProducts.push({productData: product, qty: cartProductData.qty});
                    }
                }
                res.render('shop/cart', {
                    path: '/cart',
                    pageTitle: 'Your Cart',
                    products: cartProducts
                })
            })
            .catch(err => console.error('DB error', err));
    })
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(productId)
        .then(([products]) => {
            Cart.addProduct(prodId, products[0].price);
            res.redirect('/cart');
        })
        .catch(err => console.error('DB error', err));
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(productId)
        .then(([products]) => {
            Cart.deleteProduct(prodId, products[0].price);
            res.redirect('/cart');
        })
        .catch(err => console.error('DB error', err));
};

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders'
    })
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    })
};
