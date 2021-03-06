const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const Response = require('../models/Response');


//users
exports.questionaire = (req, res) => {
    res.render('questiontest', { title: 'account'});
}

exports.loginForm = (req, res) => {
    res.render('login');
}

exports.registerForm = (req, res) => {
    res.render('register');
}

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('firstname');
    req.checkBody('firstname', 'You must supply a name!').notEmpty();
    req.sanitizeBody('lastname');
    req.checkBody('lastname', 'You must supply a name!').notEmpty();
    req.checkBody('email', 'That Email is not valid!').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        gmail_remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
    req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
    req.checkBody('password-confirm', 'Oops! Your passwords do not match').equals(req.body.password);

    const errors = req.validationErrors();
    if (errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('register', {
            title: 'Register',
            body: req.body,
            flashes: req.flash()
        });
        return; // stop the fn from running
    }
    next(); // there were no errors!
};

exports.register = async (req, res, next) => {
    const user = new User({
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname
    });
    const register = promisify(User.register, User);
    await register(user, req.body.password);
    // next(); // pass to authController.login
    res.redirect('/login');
};



//admins
exports.admindashboard = async (req, res) => {
    res.render('adminindex');
}

exports.viewallresponses = async (req, res) => {
    const page = req.params.page || 1;
    const perPage = 6;
    const skip = (perPage * page) - perPage;
    const responsesPromise = Response.find({})
        .skip(skip).
        limit(perPage)
        .populate('user');
    const countPromise = Response.find({}).count();

    const [responses, count] = await Promise.all([responsesPromise, countPromise]);

    const pages = Math.ceil(count / perPage);

    res.render('allresponses', { responses, page, pages, count, title: 'allresponses' });
}

exports.viewResponseById = async (req, res) => {
    const page = req.params.page || 1;
    const perPage = 5;
    const skip = (perPage * page) - perPage;

    const answersPromies = Response.findOne({ _id: req.params.id }).populate({
        path: 'response',
        options: {
            limit: perPage,
            skip: skip
        }
    }).populate('user');



    const countPromise = Response.findOne({ _id: req.params.id }, { response: 1 });

    const [answers, totalResponses] = await Promise.all([answersPromies, countPromise]);
    const count = totalResponses.response.length;


    const pages = Math.ceil(count / perPage);
    res.render('aresponse', { answers, page, pages, count, title: 'allresponses' });
    // res.json(answers);
}

