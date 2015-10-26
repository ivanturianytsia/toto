var mongoose = require('mongoose');
var tagSchema = new mongoose.Schema({
    name: {
        type: String
    }
})
module.exports = mongoose.model('Tag', tagSchema);