var express = require('express');
var router = express.Router();

require('../lib/connection');

var me = require('./me');
var pass = require('./passport');
var task = require('./task');
var list = require('./list');

module.exports = function(passport) {
    router.get('/', function(req, res, next) {
        res.sendFile('index.html');
    });
    router.use('/me', auth, me);
    router.use('/task', auth, task);
    router.use('/list', auth, list);
    router.use('/passport', pass(passport));
    return router;
};

function auth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}