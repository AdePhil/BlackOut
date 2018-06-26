const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Invalid Email Address'],
        required: 'Please Supply an email address'
    },
    firstname: {
        type: String,
        required: 'Please supply a name',
        trim: true
    },
    lastname: {
        type: String,
        required: 'Please supply a name',
        trim: true
    },
    isAdmin: {
        type: Boolean,
        default: false

    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

userSchema.virtual('gravatar').get(function gravatar() {
    const hash = md5(this.email);
    return `https://gravatar.com/avatar/${hash}?s=30`;
});

userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email'
});
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);