const User = require('../models/user');


exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/auth/login',
        pageTitle: 'Login',
        isAuthenticated: req.session.isLoggedIn
    })
};

exports.postLogin = (req, res, next) => {
    User.findById('5e6268b1a038aaef53c1578a')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(() => {
                res.redirect('/');
            });
        })
    .catch(error => console.error('Error DB', error));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};