const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query['edit'];
    if(!editMode) {
       return res.redirect('/')
    }
    const productId = req.params['productId'];
    Product.findById(productId)
        .then(product => {
            if(!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product
            });
        })
        .catch(err => console.error('DB error', err))
};

exports.postEditProduct = (req, res, next) => {
    const {productId, title, imageUrl, price, description} = req.body;
    const product = new Product(title, price, description, imageUrl, productId);
    product.save(productId)
        .then(() => res.redirect('/admin/products'))
        .catch(err => console.error('DB error', err));
};

exports.postAddProduct = (req, res, next) => {
    const {title, imageUrl, price, description} = req.body;
    const product = new Product(title, price, description, imageUrl, null, req.user._id);
    product
        .save()
        .then(() => res.redirect('/admin/products'))
        .catch(error => console.error('DB error', error))
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin products',
                path: '/admin/products'
            });
        })
        .catch(err => console.error('DB error', err))
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteById(prodId)
        .then(() => res.redirect('/admin/products'))
        .catch(err => console.error('DB error', err));
};