var mongoose = require('mongoose');
var postFind = require('mongoose-post-find');
var async = require('async');

var Task = mongoose.model('Task');
var Tag = mongoose.model('Tag');

var listSchema = new mongoose.Schema({
    name: {
        type: String
    },
    users: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User'
    },
    tasks: {
        type: [mongoose.Schema.Types.Mixed]
    },
    color: {
        type: String,
        default: 'FFF'
    }
});
module.exports = mongoose.model('List', listSchema);