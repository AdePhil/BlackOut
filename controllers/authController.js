const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');


exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login!',
});

exports.logout = (req, res) => {
    req.logout();
    // req.flash('success', 'You are now logged out! 👋');
    res.redirect('/login');
};

exports.isLoggedIn = (req, res, next) => {
    // first check if the user is authenticated
    if (req.isAuthenticated()) {
        next(); // carry on! They are logged in!
        return;
    }
    res.redirect('/login');
};

exports.isLoggedInAsAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
        next(); // carry on! They are logged in!
        return;
    }
    res.redirect('/login');
}