var User = require('../models/user');

module.exports = function(passport) {
    // Serialized and deserialized methods when got from session
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    // Setting up Passport Strategies for Login/SignUp
    require('./facebook')(passport);
}