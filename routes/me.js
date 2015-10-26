var express = require('express');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var router = express.Router();

router.get('/', function(req, res, next) {
    User.findOne({
        _id: req.user._id
    }).exec(function(error, user) {
        if (error) {
            return next(error);
        }
        user.lists.forEach(function(list) {
            list.tasks.forEach(function(task) {
                user.tasks.push(task);
            })
        })
        res.json(user);
    });
});
module.exports = router;