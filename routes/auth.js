const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');

const isAuth = require('../middleware/is-auth');

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.post('/login', authController.postLogin);
router.post('/logout', isAuth, authController.postLogout);

module.exports = router;