var mongoose = require('mongoose');
var postFind = require('mongoose-post-find');
var async = require('async');
var bcrypt = require('bcrypt-nodejs');

var List = mongoose.model('List');
var Task = mongoose.model('Task');

var userSchema = new mongoose.Schema({
    auth: {
        facebook: {
            id: String,
            token: String,
            email: String,
            name: String
        }
    },
    lists: {
        type: [mongoose.Schema.Types.Mixed]
    },
    tasks: {
        type: [mongoose.Schema.Types.Mixed]
    },
    tags: {
        type: [mongoose.Schema.Types.Mixed]
    }
});
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};
// listen for findOne
userSchema.plugin(postFind, {
    findOne: function(user, callback) {
        List.find({
            users: user._id
        })
            .exec(function(error, lists) {
                if (error) {
                    return callback(error);
                }
                user.lists = lists;
                async.each(lists, function(item, callback) {
                    Task.find({
                        list: item._id
                    })
                        .populate('tags')
                        .exec(function(error, tasks) {
                            if (error) {
                                return callback(error);
                            }
                            user.tasks = user.tasks.concat(tasks);
                            callback(null, user);
                        });
                }, function(error) {
                    if (error) {
                        return callback(error);
                    }
                    callback(null, user)
                });
            });
    }
});
module.exports = mongoose.model('User', userSchema);