'use strict';

var twitterConfig = require("../config/twitter-account");
var TwitterBot = require("node-twitterbot").TwitterBot;

var Twit = require('twit')
var T = new Twit(twitterConfig);

module.exports = {

	start: function () {
		console.log('START');
		//var Bot = new TwitterBot(twitterConfig);

		var stream = T.stream('user');

		stream.on('direct_message', function (event) {
			console.log('T.direct_message:', event);
		});

		// stream.on('user_event', function (event) {
		// 	console.log('T.user_event:', event);
		// });

	}

}