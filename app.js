
process.env.NODE_ENV = process.env.NODE_ENV || 'development';


var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var blocked = require ('blocked');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
console.log('connected to mongo@' + config.mongo.uri);

blocked(function(ms){
    console.log('BLOCKED FOR %sms', ms | 0);
});

var app = express();
require('./config/express_conf')(app);
require('./routes/')(app);

require("./lib/crawler");
// Start server
var server = require('http').createServer(app);
server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

/*process.on('uncaughtException', function (err) {
 console.log(err);
 });*/

var exports = module.exports = app;


module.exports = app;
