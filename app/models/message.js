// Message to listen to

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var findOrCreate = require('mongoose-findorcreate');

var MessageSchema = new Schema({
	text: { type: String, required: true, unique: true },
	enabled: { type: Boolean, default: true },
	topic: { type: String }, // any string, limit to Trigger:s on this topic
	dateLastUsed: { type: Date },
	usedCount: { type: Number, default: 0 },
});

MessageSchema.plugin(findOrCreate);

// MessageSchema.methods.getUserTaskIndex = function (task) {
// 	for (var u in this.usertasks) {
// 		if (this.usertasks[u].name === task.name)
// 			return u;
// 	};
// 	return undefined;
// };

mongoose.model('Message', MessageSchema);