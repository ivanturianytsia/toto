var express = require('express');
var mongoose = require('mongoose');
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
// Remove user from list and delete list and it's tasks if 0 users found
router.put('/delete', function(req, res, next) {
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
router.put('/edit', function(req, res, next) {
    // Change name
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
module.exports = router;