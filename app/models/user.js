// Twitter user

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	screen_name: { type: String, required: true, unique: true },
	dateLastSent: { type: Date, default: Date.now },
	lastTweetId: { type: String },
});

mongoose.model('User', UserSchema);