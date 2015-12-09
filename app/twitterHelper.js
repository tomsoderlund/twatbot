'use strict';

var Twit = require('twit') // https://github.com/ttezel/twit
//var TwitterBot = require("node-twitterbot").TwitterBot; // https://github.com/nkirby/node-twitterbot

var twitObj;

var TWATBOT_DEBUG = (process.env['TWATBOT_DEBUG'] === 'false' ? false : true);
var TWATBOT_SEARCH_LIMIT = (process.env['TWATBOT_SEARCH_LIMIT']  ? parseInt(process.env['TWATBOT_SEARCH_LIMIT']) : 50);

var triggerOnDirectMessage = function () {
	var stream = twitObj.stream('user');

	stream.on('direct_message', function (event) {
		console.log('twitObj.direct_message:', event);
	});

	// stream.on('user_event', function (event) {
	// 	console.log('twitObj.user_event:', event);
	// });
}

var makeTweetURL = function (tweetObj) {
	return 'https://twitter.com/' + tweetObj.user.screen_name + '/status/' + tweetObj.id_str;
};

// https://support.twitter.com/articles/71577
var searchTweets = function (searchStr, options, callback) {
	// sinceDate = sinceDate || 
	// moment(sinceDate).format("YYYY-MM-DD")
	// 'banana since:2011-11-11'
	var params = {
		q: '“' + searchStr + '”',
		count: TWATBOT_SEARCH_LIMIT,
	};
	twitObj.get('search/tweets', params, function (err, data, response) {
		console.log('Search:', params.q, data.statuses.length);
		callback(err, data.statuses);
	})
}

var postTweet = function (message, replyToStatusObj, callback) {
	var params = {
		status: message,
	};
	// Is this a reply? NOTE: must also have @recipient in text
	if (replyToStatusObj) {
		params.in_reply_to_status_id = replyToStatusObj.id_str;
	}
	// Tweet!
	console.log('Tweet: ' + (TWATBOT_DEBUG ? '(test)' : '(LIVE)'), '“' + params.status + '”');
	if (!TWATBOT_DEBUG) {
		twitObj.post('statuses/update', params, function (err, data, response) {
			callback(err, data);
		});
	}
	else {
		callback(null, { id_str: '(debug)' });
	}
};

//------ PUBLIC METHODS ------

module.exports = {

	init: function (cbAfterInit) {

		if (!process.env['TWITTER_CONSUMER_KEY']) {
			console.error('Twitter settings not found in environment.');
			if (cbAfterInit) cbAfterInit('No settings');
		}
		else {
			twitObj = new Twit({
				"consumer_key": process.env['TWITTER_CONSUMER_KEY'],
				"consumer_secret": process.env['TWITTER_CONSUMER_SECRET'],
				"access_token": process.env['TWITTER_ACCESS_TOKEN'],
				"access_token_secret": process.env['TWITTER_ACCESS_TOKEN_SECRET']
			});

			console.log('TWATBOT_DEBUG:', TWATBOT_DEBUG);
			console.log('TWATBOT_SEARCH_LIMIT:', TWATBOT_SEARCH_LIMIT);
			if (cbAfterInit) cbAfterInit(null);
		}

	},

	makeTweetURL: makeTweetURL,
	searchTweets: searchTweets,
	postTweet: postTweet,

}