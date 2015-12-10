// Twitter user

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	screen_name: { type: String, required: true, unique: true },
	dateLastUsed: { type: Date, default: Date.now },
	dateLastSent: { type: Date },
	lastSentTweetId: { type: String },
});

mongoose.model('User', UserSchema);