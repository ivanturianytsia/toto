var express = require('express');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var List = mongoose.model('List');
var Task = mongoose.model('Task');
var router = express.Router();

router.post('/create', function(req, res, next) {
    List.create(req.body, function(error) {
        if (error) {
            return next(error);
        }
        res.sendStatus(200);
    });
});
router.put('/delete', function(req, res, next) { // Remove user from list and delete list and it's tasks if 0 users found
    List.findByIdAndUpdate(req.body.id, {
        $pull: {
            'users': req.body.user
        }
    })
        .exec(function(error, list) {
            if (error) {
                return next(error);
            }
            // No more users use the list
            if (list.users.length <= 1) {
                // Removing the list
                List.remove({
                    _id: req.body.id
                }).exec(function(error, list) {
                    if (error) {
                        return next(error);
                    }
                    // Removing tasks which belonged to a list
                    Task.remove({
                        list: req.body.id
                    }).exec(function(error, task) {
                        if (error) {
                            return next(error);
                        }
                        res.sendStatus(200);
                    })
                })
            } else {
                // Someone still using the list
                res.sendStatus(200);
            };
        });
});
router.put('/edit', function(req, res, next) { // Change name
    List.findByIdAndUpdate(req.body.id, {
        name: req.body.name
    })
        .exec(function(error) {
            if (error) {
                return next(error);
            }
            res.sendStatus(200);
        });
});
router.post('/users', function(req, res, next) { // Retrieve users of the list
    User.find({
        '_id': {
            $in: req.body.userIds
        }
    })
        .exec(function(error, users) {
            if (error) {
                return next(error);
            }
            res.json(users);
        });
});
router.put('/invite', function(req, res, next) { // Add a friend to users list
    User.find({
        'auth.facebook.id': req.body.facebookId
    })
        .exec(function(error, users) {
            if (error) {
                return next(error);
            }
            var user = users[0];
            console.log(__filename + ": user: " + user);
            List.findByIdAndUpdate(req.body.listId, {
                $addToSet: {
                    "users": user._id
                }
            })
                .exec(function(error) {
                    if (error) {
                        return next(error);
                    }
                    res.sendStatus(200);
                });
        });
});
module.exports = router;