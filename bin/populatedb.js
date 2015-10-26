var async = require('async');
var mongoose = require('mongoose');
require(process.cwd() + '/lib/connection');
require(process.cwd() + '/models/tag');
require(process.cwd() + '/models/task');
require(process.cwd() + '/models/list');
require(process.cwd() + '/models/user');
var User = mongoose.model('User');
var List = mongoose.model('List');
var Task = mongoose.model('Task');
var Tag = mongoose.model('Tag');

var data = {
    lists: [{
        name: 'Shopping',
        color: 'FFF',
        users: ['561d82dfc99e3215261f4310']
    }, {
        name: 'Presents',
        color: 'FFF',
        users: ['561d82dfc99e3215261f4310']
    }],
    tasks: [{
        name: "Veggies",
        description: "Some",
        priority: 80,
        tags: []
    }, {
        name: "Bithes",
        description: "More",
        priority: 99,
        tags: []
    }],
    tags: [{
        name: "food"
    }, {
        name: "love"
    }]
};
var deleteLists = function(callback) {
    console.info('Deleting lists...');
    List.remove({}, function(error, response) {
        if (error) {
            console.error('Error deleting lists: ' + error);
        }
        console.info('Done deleting lists!');
        callback();
    });
};
var deleteTasks = function(callback) {
    console.info('Deleting tasks...');
    Task.remove({}, function(error, response) {
        if (error) {
            console.error('Error deleting tasks: ' + error);
        }
        console.info('Done deleting tasks!');
        callback();
    });
};
var deleteTags = function(callback) {
    console.info('Deleting tags...');
    Tag.remove({}, function(error, response) {
        if (error) {
            console.error('Error deleting tags: ' + error);
        }
        console.info('Done deleting tags!');
        callback();
    });
};
var addLists = function(callback) {
    console.info('Adding lists...');
    List.create(data.lists, function(error, lists) {
        if (error) {
            console.error('Error adding lists: ' + error);
        } else {
            data.tasks.forEach(function(element) {
                element.list = lists[0]._id
            })
            console.info('Done adding lists!');
            callback();
        }
    })
}
var addTags = function(callback) {
    console.info('Adding tags...');
    Tag.create(data.tags, function(error, tags) {
        if (error) {
            console.error('Error adding tags: ' + error);
        } else {
            data.tasks[0].tags.push(tags[0]._id);
            data.tasks[1].tags.push(tags[1]._id);
            console.info('Done adding tags!');
            callback();
        }
    })
}
var addTasks = function(callback) {
    console.info('Adding tasks...');
    Task.create(data.tasks, function(error, tasks) {
        if (error) {
            console.error('Error adding tasks: ' + error);
        } else {
            console.info('Done adding tasks!');
            callback();
        }
    })
}

async.series([
    deleteLists,
    deleteTasks,
    deleteTags,
    addLists,
    addTags,
    addTasks
], function(error, results) {
    if (error) {
        console.error('Error: ' + error);
    }
    mongoose.connection.close();
    console.log('Done!');
});