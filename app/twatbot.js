'use strict';

var twitterConfig = require("../config/twitter-account");

var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var Twit = require('twit') // https://github.com/ttezel/twit
var TwitterBot = require("node-twitterbot").TwitterBot; // https://github.com/nkirby/node-twitterbot

var twitObj = new Twit(twitterConfig);

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Trigger = mongoose.model('Trigger');
var Message = mongoose.model('Message');


var DEBUG_MODE = true;
var TWEET_SEARCH_LIMIT = 50;


String.prototype.toSlug = function () {
	return this.trim().replace(/ /g,'-').replace(/[^\w-]+/g,'').toLowerCase();
};


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
var searchTweets = function (searchStr, options, callback) {
	// sinceDate = sinceDate || 
	// moment(sinceDate).format("YYYY-MM-DD")
	// 'banana since:2011-11-11'
	var params = {
		q: '“' + searchStr + '”',
		count: TWEET_SEARCH_LIMIT,
	};
	twitObj.get('search/tweets', params, function (err, data, response) {
		console.log('Search:', params.q, data.statuses.length);
		callback(data.statuses);
	})
}

var postTweet = function (message, replyToStatusObj, sendForReal, callback) {
	var params = {
		status: message,
	};
	// Is a twitter reply?
	if (replyToStatusObj) {
		params.in_reply_to_status_id = replyToStatusObj.id_str;
		params.status = '@' + replyToStatusObj.user.screen_name + ' ' + params.status;
	}
	// Tweet!
	console.log('Tweet:' + sendForReal, '“' + params.status + '”' + (replyToStatusObj ? ' (reply to “' + replyToStatusObj.text + '”)' : ''));
	if (sendForReal) {
		twitObj.post('statuses/update', params, callback)
	}
	else {
		callback(null);
	}
};


var getTriggers = function (callback) {
	// var trig = new Trigger({ text: "from:tomsoderlund" });
	// trig.save();
	Trigger.find({}).exec(callback);
};

var getExistingUsernames = function (callback) {
	// var user = new User({ screen_name: "tomsoderlund" });
	// user.save();
	User.find({}).exec(function (err, users) {
		var usernameArray = _.pluck(users, 'screen_name');
		callback(usernameArray);
	});
};

var getRandomMessageForTopic = function (topic, replyToStatusObj, callback) {
	// var message = new Message({ text: "Have you tried Weld? https://www.weld.io?utm_content=tweet-tried-weld" });
	// message.save();
	Message.find({ topic: topic }).exec(function (err, messages) {
		var messageObj = messages[Math.floor(Math.random() * messages.length)];
		callback(messageObj);
	});
};

var searchAndTweet = function (callbackWhenDone) {

// 1. For each 'trigger'
// 2. Search Twitter for trigger
// 3. Find first user not on the user list
// 4. Get a suitable message template
// 5. Send them a tweet
// 6. Save user, trigger, and message objects

	var sendMessageAndUpdateRecords = function (trigger, replyToStatusObj, callback) {
		// 4. Get a suitable message template
		getRandomMessageForTopic(
			trigger.topic,
			replyToStatusObj,
			function (messageObj) {
				// 5. Send them a tweet
				postTweet(
					messageObj.text,
					replyToStatusObj,
					!DEBUG_MODE,
					function () {
						// 6. Save user, trigger, and message objects
						async.parallel([
							// User
							function (cb) {
								var user = new User({ screen_name: replyToStatusObj.user.screen_name });
								user.save(cb);
							},
							// Trigger
							function (cb) {
								trigger.dateLastUsed = new Date();
								trigger.usedCount++;
								trigger.save(cb);
							},
							// Message
							function (cb) {
								messageObj.dateLastUsed = new Date();
								messageObj.usedCount++;
								messageObj.save(cb);
							},
						],
						// optional callback
						function (err, results) {
							callback(null);
						});

					}
				);
			}
		);
	};

	// First get array of users
	getExistingUsernames(function (usernameArray) {
		// 1. For each 'trigger'
		getTriggers(function (err, triggers) {
			for (var t in triggers) {
				var trigger = triggers[t];
				// 2. Search Twitter for trigger
				searchTweets(trigger.text, undefined, function (statuses) {
					// 3. Find first user not on the user list
					var alreadySentToOneUser = false;
					for (var s in statuses) {
						var status = statuses[s];
						if (usernameArray.indexOf(status.user.screen_name) === -1 && !alreadySentToOneUser) {
							sendMessageAndUpdateRecords(trigger, status, callbackWhenDone);
							alreadySentToOneUser = true;
						}
					};
				});
			};
		});
	});

}


module.exports = {

	start: function (callback) {
		console.log('START');

		async.series([
			searchAndTweet,
			callback
		]);

	}

}