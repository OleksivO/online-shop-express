const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: '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'
    }
}));

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
                .then((user) => {
                    res.redirect('/login');
                    return transporter.sendMail({
                        to: email,
                        from: 'info@express-shop.com',
                        subject: 'SignUp succeeded ',
                        html: '<h1>Your account was successfully registered!</h1>'
                    });
                })
        })
        .catch(error => console.error('Error DB', error))
};

exports.getReset = (req, res, next) => {
    const messages = req.flash('error');
    const errorMessage = messages.length > 0 ? messages[0] : null;
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset',
        errorMessage: errorMessage
    })
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (error, buffer) => {
        if (error) {
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
            .then(user => {
                if(!user) {
                    req.flesh('error', 'No account with that email found!')
                }

                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save()
            })
            .then(result => {
                res.redirect('/');
               return transporter.sendMail({
                   to: req.body.email,
                   from: 'info@express-shop.com',
                   subject: 'Password Reset',
                   html: `
                      <p>You requested a password reset!</p>
                      <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password:</p>
                   `
               });
            })
            .catch(err => {
                console.error(err);
            })
    })
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({
        resetToken: token,
        resetTokenExpiration: {$gt: Date.now()},
    })
        .then(user => {
            const messages = req.flash('error');
            const errorMessage = messages.length > 0 ? messages[0] : null;
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: errorMessage,
                userId: user._id.toString(),
                passwordToken: token
            })
        })
        .catch(error => console.error(error));
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const token = req.body.passwordToken;
    let resetUser;
    User.findOne({
        resetToken: token,
        resetTokenExpiration: {$gt: Date.now()},
        _id: userId
    })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12)
        })
        .then(password => {
            resetUser.password = password;
            resetUser.resetToken = null;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save()
        })
        .then(() => {
            res.redirect('/login')
        })
        .catch(error => {
            console.log(error);
        })
};