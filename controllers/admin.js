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
    Product.findByPk(productId)
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

    Product.findByPk(productId)
        .then(product => {
            product.title = title;
            product.description = description;
            product.price = price;
            product.imageUrl = imageUrl;
            return product.save();
        })
        .then(() => res.redirect('/admin/products'))
        .catch(err => console.error('DB error', err));
};

exports.postAddProduct = (req, res, next) => {
    const {title, imageUrl, price, description} = req.body;
    Product.create({
        title,
        price,
        imageUrl,
        description
    })
        .then(() => res.redirect('/admin/products'))
        .catch(error => console.error('DB error', error))
};

exports.getProducts = (req, res, next) => {
    Product.findAll()
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
    Product.findByPk(prodId)
        .then(product => product.destroy())
        .then(() => res.redirect('/admin/products'))
        .catch(err => console.error('DB error', err));
};