const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const {mongoConnect} = require('./util/database');

const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const errorsController = require("./controllers/error");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('5e623820587317e93893ac00')
        .then(user => {
            req.user = new User(user.name, user.email, user.cart, user._id);
            next()
        })
        .catch(error => console.error('Error DB', error));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorsController.getPageNotFound);

mongoConnect(() => {
    app.listen(3000)
});