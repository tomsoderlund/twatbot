'use strict';

var twitterConfig = require("../config/twitter-account");

var moment = require('moment');
var Twit = require('twit') // https://github.com/ttezel/twit
var TwitterBot = require("node-twitterbot").TwitterBot; // https://github.com/nkirby/node-twitterbot

var twitObj = new Twit(twitterConfig);


var triggerOnDirectMessage = function () {
	var stream = twitObj.stream('user');

	stream.on('direct_message', function (event) {
		console.log('twitObj.direct_message:', event);
	});

	// stream.on('user_event', function (event) {
	// 	console.log('twitObj.user_event:', event);
	// });
}

var searchTweets = function (searchStr, options) {
	// sinceDate = sinceDate || 
	// moment(sinceDate).format("YYYY-MM-DD")
	// 'banana since:2011-11-11'
	var searchParams = {
		q: '“' + searchStr + '”',
		count: 5,
	};
	twitObj.get('search/tweets', searchParams, function (err, data, response) {
		for (var s in data.statuses) {
			var status = data.statuses[s];
			console.log('Msg', status.text, status.user.screen_name);
		};
	})
}


module.exports = {

	start: function () {
		console.log('START');

		searchTweets('easier than WordPress');

	}

}