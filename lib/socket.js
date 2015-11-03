module.exports = function(server) {
    var io = require('socket.io')(server);

    /**
     * Pairs: User model _id -> socket.io id
     */
    var users = {};

    io.on('connection', function(socket) {
        // User model _id
        var _id = '';
        // Add user _id to users object
        // data { _id: Number }
        socket.on('register', function(data) {
            var _id = data._id;
            users[_id] = socket.id;
        })
        // You added a user to the list
        // data { _id: Number }
        socket.on('new list', function(data) {

        })
        // Remove user from users object
        socket.on('disconnect', function() {
            if (_id.length) {
                delete users[_id];
            }
        });
    });
}