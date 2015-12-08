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

// https://support.twitter.com/articles/71577
var searchTweets = function (searchStr, options) {
	// sinceDate = sinceDate || 
	// moment(sinceDate).format("YYYY-MM-DD")
	// 'banana since:2011-11-11'
	var params = {
		q: '“' + searchStr + '”',
		count: 3,
	};
	twitObj.get('search/tweets', params, function (err, data, response) {
		console.log('Tweets:', params.q, data.statuses.length);
		for (var s in data.statuses) {
			var status = data.statuses[s];
			console.log((parseInt(s)+1), status.text, status.user.screen_name);
			postTweet('What’s up?', status, false);
		};
	})
}

var postTweet = function (message, replyToStatusObj, sendForReal) {
	var params = {
		status: message,
	};
	// Is a twitter reply?
	if (replyToStatusObj) {
		params.in_reply_to_status_id = replyToStatusObj.id_str;
		params.status = '@' + replyToStatusObj.user.screen_name + ' ' + params.status;
	}
	// Tweet!
	console.log('Tweet:', sendForReal, params);
	if (sendForReal) {
		twitObj.post('statuses/update', params, function (err, data, response) {
			console.log(data);
		})
	}
};


module.exports = {

	start: function () {
		console.log('START');

		searchTweets('squarespace');
		//postTweet('Hunry!', undefined, true)

	}

}