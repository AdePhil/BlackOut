const express = require('express');
const router = express.Router();
// const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const responseController = require('../controllers/responseController');
// const reviewController = require('../controllers/reviewController');
const {
  catchErrors
} = require('../handlers/errorHandlers');

const formHandler = require("../handlers/handleForm");


router.get('/account', authController.isLoggedIn, userController.questionaire);
router.get('/', userController.loginForm);
router.get('/login', userController.loginForm);
router.post('/login', authController.login, (req, res) => {
  if (req.user.isAdmin) {
    res.redirect('/admin/account');
  } else {
    res.redirect('/account');
  }
});
router.get('/register', userController.registerForm);

// 1. Validate the registration data
// 2. register the user
// 3. we need to log them in
router.post('/register',
  userController.validateRegister,
  userController.register
);

router.get('/logout', authController.logout);

router.post('/response', authController.isLoggedIn, responseController.post);

router.post("handleForm", formHandler.func);



//admin
router.get('/admin/account', userController.viewallresponses);
router.get('/admin/account/responses',
  authController.isLoggedInAsAdmin,
  userController.viewallresponses);

router.get('/admin/account/responses/:id', authController.isLoggedInAsAdmin, userController.viewResponseById);
router.get('/admin/account/responses/:id/page/:page', authController.isLoggedInAsAdmin, userController.viewResponseById);

module.exports = router;