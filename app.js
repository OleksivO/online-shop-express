const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const errorsController = require("./controllers/error");

const sequelize = require('./util/database.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            req['user'] = user;
            next()
        })
        .catch(error => console.error('Error DB', error))
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorsController.getPageNotFound);

//Product-User relation - 1 to many
Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);

// User - Cart telation - 1 to many
User.hasOne(Cart);
Cart.belongsTo(User);

// Cart - Product relation - many to many
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});

// User - Order relation - 1 to many
Order.belongsTo(User);
User.hasMany(Order);

//Product - Order relation - many to many
Order.belongsToMany(Product, {through: OrderItem});



//force optional is only for dev mode, force changes in tables config {force: true}
sequelize
    .sync()
    .then(result => {
        return User.findByPk(1);
    })
    .then(user => {
        if(!user) {
            return User.create({
                name: 'Test',
                email: 'test@test.com',
                password: 'supersecret'
            })
        }
        return user;
    })
    .then(user => user.createCart())
    .then(cart => app.listen(3000))
    .catch(error => console.error('Error', error));
