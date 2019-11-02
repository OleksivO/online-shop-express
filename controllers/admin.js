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
        .then(([products]) => {
            if(!products[0]) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: products[0]
            });
        })
        .catch(err => console.error('DB error', err))
};

exports.postEditProduct = (req, res, next) => {
    const {productId, title, imageUrl, price, description} = req.body;
    const updatedProduct = new Product(productId, title, imageUrl, description, price);
    updatedProduct.save()
        .then(() => res.redirect('/admin/products'))
        .catch(err => console.error('DB error', err))

};

exports.postAddProduct = (req, res, next) => {
    const {title, imageUrl, price, description} = req.body;
    const product = new Product(null, title, imageUrl, description, price);
    product.save()
        .then(() => res.redirect('/'))
        .catch(err => console.log('DB error', err))
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(([products, fieldData]) => {
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
    Product.deleteById(prodId);
    res.redirect('/admin/products');
};