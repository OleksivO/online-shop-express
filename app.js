const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

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
    User.findById('5e6268b1a038aaef53c1578a')
        .then(user => {
            req.user = user;
            next()
        })
        .catch(error => console.error('Error DB', error));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorsController.getPageNotFound);

mongoose
    .connect('mongodb+srv://oleksandr:mHYKUUPJDc8fuvjN@cluster0-1ulot.mongodb.net/express-shop?retryWrites=true&w=majority')
    .then(() => {
        User.findOne().then(user => {
           if(!user) {
               const user = new User({
                   name: 'Test',
                   email: 'test@test.com',
                   cart: {items: []}
               });
               user.save();
           }
        });
        app.listen(3000)
    })
    .catch(error => console.error('Error DB', error));