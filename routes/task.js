var express = require('express');
var mongoose = require('mongoose');
var async = require('async');
var Task = mongoose.model('Task');
var Tag = mongoose.model('Tag');
var router = express.Router();

router.post('/create', function(req, res, next) {
    async.forEachOf(req.body.tags, function(item, key, callback) {
        if (item._id) {
            callback(null, req.body);
        } else {
            Tag.findOne({
                name: item.name
            }).exec(function(error, result) {
                if (error) {
                    return callback(error);
                }
                if (result) {
                    req.body.tags[key] = result._id;
                    callback(null, req.body);
                } else {
                    Tag.create({
                        name: item.name
                    }, function(error, tag) {
                        if (error) {
                            return callback(error);
                        }
                        req.body.tags[key] = tag._id;
                        callback(null, req.body);
                    });
                }
            })
        }
    }, function(error) {
        if (error) {
            return next(error);
        }
        Task.create(req.body, function(error) {
            if (error) {
                return next(error);
            }
            res.sendStatus(200);
        });
    });
});
router.put('/delete', function(req, res, next) {
    Task.remove({
        _id: req.body.id
    }).exec(function(error) {
        if (error) {
            return next(error);
        }
        res.sendStatus(200);
    });
});
router.put('/done', function(req, res, next) {
    Task.update({
        _id: req.body.id
    }, {
        done: req.body.done
    }).exec(function(error) {
        if (error) {
            return next(error);
        }
        res.sendStatus(200);
    });
});
module.exports = router;