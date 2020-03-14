const bcrypt = require('bcryptjs');
const User = require('../models/user');


exports.getLogin = (req, res, next) => {
    const messages = req.flash('error');
    const errorMessage = messages.length > 0 ? messages[0] : null;
    res.render('auth/login', {
        path: '/auth/login',
        pageTitle: 'Login',
        errorMessage: errorMessage
    })
};

exports.postLogin = (req, res, next) => {
    const {email, password} = req.body;
    User.findOne({email})
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password.');
                return res.session.save().then(() => res.redirect('/login'))
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(() => {
                            res.redirect('/');
                        });
                    }

                    req.flash('error', 'Invalid email or password.');
                    return res.session.save().then(() => res.redirect('/login'))
                })
                .catch(error => res.redirect('/login'));
        })
    .catch(error => console.error('Error DB', error));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};


exports.getSignup = (req, res, next) => {
    const messages = req.flash('error');
    const errorMessage = messages.length > 0 ? messages[0] : null;
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: errorMessage
    });
};
exports.postSignup = (req, res, next) => {
    const {email, password, confirmPassword} = req.body;
    User
        .findOne({email: email})
        .then(userData => {
            if (userData) {
                req.flash('error', 'Invalid email or password.');
                return req.session.save().then(() => res.redirect('/signup'));
            }
            return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User(
                        {
                            email: email,
                            password: hashedPassword,
                            cart: {items: []}
                        });

                    return user.save();
                })
                .then(() => res.redirect('/login'))
        })
        .catch(error => console.error('Error DB', error))
};
