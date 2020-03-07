const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://oleksandr:mHYKUUPJDc8fuvjN@cluster0-1ulot.mongodb.net/express-shop?w=majority';

const app = express();

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const errorsController = require("./controllers/error");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
        secret: 'test secret string',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log('DB error', err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorsController.getPageNotFound);

mongoose
    .connect(MONGODB_URI)
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