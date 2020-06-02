const express = require('express');

const {check, body} = require('express-validator/check');

const User = require('../models/user');

const router = express.Router();

const authController = require('../controllers/auth');

const isAuth = require('../middleware/is-auth');

router.get('/login',
    // [
    //     body('email')
    //         .isEmail()
    //         .withMessage('Please, enter a valid email'),
    //     body('password', 'Password should be at least 6 characters long')
    //         .isLength({min: 6})
    //         .isAlphanumeric()
    //         .custom((value, {req}) => {
    //             const password = bcrypt.hash(value, 12);
    //             User.findOne({})
    //         })
    //
    // ],
    authController.getLogin);
router.get('/signup', authController.getSignup);
router.post('/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Please, enter a valid email')
            .custom((value, {req}) => {
                User.findOne({email: value})
                    .then(userData => {
                        if (userData) {
                            return Promise.reject('User with such a password already exists.')
                        }
                    })
            }),
        body('password', 'Password should be at least 6 characters long').isLength({min: 6}).isAlphanumeric(),
        body('confirmPassword').custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match!')
            }
            return true
        })
    ],
    authController.postSignup);
router.post('/login', authController.postLogin);
router.post('/logout', isAuth, authController.postLogout);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/new-password/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;