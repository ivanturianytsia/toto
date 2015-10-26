var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('mongoose').model('User');
var config = require('./config');

module.exports = function(passport) {
    passport.use('facebook', new FacebookStrategy({
            clientID: config.facebook.clientID,
            clientSecret: config.facebook.clientSecret,
            callbackURL: config.facebook.callbackURL,
            passReqToCallback: true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
            profileFields: ['id', 'emails', 'name']
        },
        function(req, token, refreshToken, profile, done) {
            // asynchronous
            process.nextTick(function() {
                if (!req.user) { // check if the user is already logged in
                    User.findOne({
                        'auth.facebook.id': profile.id
                    }, function(err, user) {
                        if (err) {
                            return done(err);
                        }
                        console.log(profile);
                        if (user) {
                            if (!user.auth.facebook.token) { // if there is a user id already but no token (user was linked at one point and then removed)
                                user.auth.facebook.token = token;
                                user.auth.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                                user.auth.facebook.email = (profile.emails[0].value || '').toLowerCase();

                                user.save(function(err) {
                                    if (err) {
                                        return done(err);
                                    }
                                    return done(null, user);
                                });
                            }
                            return done(null, user); // user found, return that user
                        } else { // if there is no user, create it
                            var newUser = new User();
                            newUser.auth.facebook.id = profile.id;
                            newUser.auth.facebook.token = token;
                            newUser.auth.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                            newUser.auth.facebook.email = (profile.emails[0].value || '').toLowerCase();
                            newUser.save(function(err) {
                                if (err) {
                                    return done(err);
                                }
                                return done(null, newUser);
                            });
                        }
                    });
                } else { // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session
                    user.auth.facebook.id = profile.id;
                    user.auth.facebook.token = token;
                    user.auth.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                    user.auth.facebook.email = (profile.emails[0].value || '').toLowerCase();
                    user.save(function(err) {
                        if (err) {
                            return done(err);
                        }
                        return done(null, user);
                    });
                }
            });
        }));
}