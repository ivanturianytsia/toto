var mongoose = require('mongoose');
var dbUrl = 'mongodb://hell:hell@ds033744.mongolab.com:33744/toto';
mongoose.connect(dbUrl);

// Close the Mongoose connection on Control+C
process.on('SIGINT', function() {
    mongoose.connection.close(function() {
        process.exit(0);
    });
});