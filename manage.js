var mongoose = require('mongoose');
var glob = require('glob');
var config = require('./config/config');

mongoose.connect(config.db);
mongoose.connection.on('error', function () {
	throw new Error('unable to connect to database at ' + config.db);
});

var models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
	require(model);
});

var Trigger = mongoose.model('Trigger');
var Message = mongoose.model('Message');


if ((process.argv.length - 2) < 3) {
	console.log('Usage: node manage.js [action] [collection] [values]');
	console.log('  E.g: node manage.js add trigger "hello world"');
	mongoose.connection.close();
}
else {
	var cmdAction = process.argv[2];
	var cmdCollection = process.argv[3];
	var cmdText = process.argv[4];
	var cmdTopic = process.argv[5];

	switch (cmdCollection) {
		case 'trigger':
			var searchKey = { text: cmdText };
			var dataToSave = { enabled: true };
			if (cmdTopic) {
				dataToSave.topic = cmdTopic;
			}
			Trigger.update(searchKey, dataToSave, { upsert: true }, function (err, data) {
				console.log('Trigger:', err, data);
				mongoose.connection.close();
			});
			break;
		case 'message':
			var searchKey = { text: cmdText };
			var dataToSave = { enabled: true };
			if (cmdTopic) {
				dataToSave.topic = cmdTopic;
			}
			Message.update(searchKey, dataToSave, { upsert: true }, function (err, data) {
				console.log('Message:', err, data);
				mongoose.connection.close();
			});
			break;
		default:
			console.log('Unknown collection');
			mongoose.connection.close();
			break;
	}

}
