const Product = require('../models/product');

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
    req.user.getCart()
        .then(cart => {
            return cart.getProducts()
                .then(products => {
                    res.render('shop/cart', {
                        path: '/cart',
                        pageTitle: 'Your Cart',
                        products: products
                    })
                })
                .catch(err => console.error('DB error', err))
        })
        .catch(err => console.error('DB error', err))
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    let loadedCart;
    let newQuantity = 1;
    req.user.getCart()
        .then(cart => {
            loadedCart = cart;
            return cart.getProducts({where: {id: prodId}})
        })
        .then(products => {
            let product;
            if(products.length) {
                product = products[0];
            }
            if (product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return product;
            }
            return Product.findByPk(prodId)
        })
        .then(product => {
            return loadedCart.addProduct(product, {through: {quantity: newQuantity}})
        })
        .then(() => res.redirect('/cart'))
        .catch(err => console.error('DB error', err))
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.getCart()
        .then(cart => cart.getProducts({where: {id: prodId}}))
        .then(products => {
            const product = products[0];
            return product.cartItem.destroy();
        })
        .then(() => res.redirect('/cart'))
        .catch(err => console.error('DB error', err));
};


exports.postOrder = (req, res, next) => {
    let loadedCart;
    req.user.getCart()
        .then(cart => {
            loadedCart = cart;
            return cart.getProducts()
        })
        .then(products => {
            return req.user.createOrder()
                .then(order => {
                    order.addProducts(products.map(product => {
                        product.orderItem = {quantity: product.cartItem.quantity};
                        return product
                    }));
                })
                .catch(err => console.error('DB error', err))
        })
        .then(() => loadedCart.setProducts(null))
        .then(() => res.redirect('/orders'))
        .catch(err => console.error('DB error', err))
};

exports.getOrders = (req, res, next) => {
    req.user.getOrders({include: ['products']})
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders
            })
        })
        .catch(err => console.error('DB error', err));
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    })
};
