var express = require('express');
var router = express.Router();

module.exports = function(passport) {
    router.get('/logged', function(req, res) {
        console.log(req.isAuthenticated() ? ('user logged as ' + req.user.auth.facebook.name) : ('user not logged'))
        res.send(req.isAuthenticated() ? true : false);
    });
    router.post('/logout', function(req, res) {
        req.logout();
        res.sendStatus(200);
    });
    router.get('/auth/facebook', passport.authenticate('facebook', { // send to facebook to do the authentication
        scope: ['email']
    }));
    router.get('/auth/facebook/callback', // handle the callback after facebook has authenticated the user
        passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/'
        }));
    router.get('/connect/facebook', passport.authorize('facebook', { // send to facebook to do the authentication
        scope: ['email']
    }));
    router.get('/connect/facebook/callback', // handle the callback after facebook has authorized the user
        passport.authorize('facebook', {
            successRedirect: '/',
            failureRedirect: '/'
        }));
    router.get('/unlink/facebook', auth, function(req, res) {
        var user = req.user;
        user.auth.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/');
        });
    });
    return router;
}

function auth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}