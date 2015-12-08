var mongoose = require('mongoose');
var glob = require('glob');
var config = require('./config/config');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
	throw new Error('unable to connect to database at ' + config.db);
});

var models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
	require(model);
});

var twatbot = require('./app/twatbot');
twatbot.start();