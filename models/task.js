var mongoose = require('mongoose');
var Tag = mongoose.model('Tag');

var taskSchema = new mongoose.Schema({
    name: {
        type: String
    },
    list: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List'
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    done: {
        type: Boolean,
        default: false
    },
    description: {
        type: String
    },
    priority: {
        type: Number,
        default: 0
    }
})
module.exports = mongoose.model('Task', taskSchema);