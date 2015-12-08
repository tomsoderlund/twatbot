'use strict';

var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var Twit = require('twit') // https://github.com/ttezel/twit
//var TwitterBot = require("node-twitterbot").TwitterBot; // https://github.com/nkirby/node-twitterbot

var twitObj;

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Trigger = mongoose.model('Trigger');
var Message = mongoose.model('Message');


var TWATBOT_DEBUG = (process.env['TWATBOT_DEBUG'] === 'false' ? false : true);
var TWATBOT_SEARCH_LIMIT = (process.env['TWATBOT_SEARCH_LIMIT']  ? parseInt(process.env['TWATBOT_SEARCH_LIMIT']) : 50);


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
	console.log('Tweet ' + (TWATBOT_DEBUG ? '(test)' : '(LIVE)') + ':', '“' + params.status + '”' + (replyToStatusObj ? ' - reply to @' + replyToStatusObj.user.screen_name + ':“' + replyToStatusObj.text + '” https://twitter.com/' + replyToStatusObj.user.screen_name + '/status/' + replyToStatusObj.id_str : ''));
	if (!TWATBOT_DEBUG) {
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
		callback(err, usernameArray);
	});
};

var getRandomMessageForTopic = function (topic, replyToStatusObj, callback) {
	// var message = new Message({ text: "Have you tried Weld? https://www.weld.io?utm_content=tweet-tried-weld" });
	// message.save();
	Message.find({ topic: topic }).exec(function (err, messages) {
		var messageObj = messages[Math.floor(Math.random() * messages.length)];
		callback(err, messageObj);
	});
};

var searchAndTweet = function (callbackWhenDone) {

	// 1. For each 'trigger'
	// 2. Search Twitter for trigger
	// 3. Find first user not on the user list
	// 4. Get a suitable message template
	// 5. Send them a tweet
	// 6. Save user, trigger, and message objects

	var saveOptions = function (userObj, trigger, messageObj, cbAfterSave) {
		async.parallel([
			// User
			function (cb) {
				var user = new User({ screen_name: userObj.screen_name });
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
		// When all done
		function (err, results) {
			cbAfterSave(null);
		});
	};

	var sendMessageAndUpdateRecords = function (trigger, replyToStatusObj, cbAfterSend) {
		// 4. Get a suitable message template
		getRandomMessageForTopic(
			trigger.topic,
			replyToStatusObj,
			function (err, messageObj) {
				if (err) {
					console.error('sendMessageAndUpdateRecords:', err);
					cbAfterSend(err);
				}
				else {
					// Personalize message
					var personalMessage = '@' + replyToStatusObj.user.screen_name + ' ' + messageObj.text;
					// 5. Send them a tweet
					postTweet(personalMessage, replyToStatusObj,
						function (err, data) {
							// 6. Save user, trigger, and message objects
							saveOptions(replyToStatusObj.user, trigger, messageObj, cbAfterSend);
						}
					);
				}
			}
		);
	};

	var usernameArray;

	var processTrigger = function (trigger, cbAfterTrigger) {
		// 2. Search Twitter for trigger
		searchTweets(trigger.text, undefined, function (err, tweets) {
			// 3. Find first user not on the user list
			var alreadySentToOneUser = false;
			async.each(tweets, function (tweet, cbEach) {
				if (usernameArray.indexOf(tweet.user.screen_name) === -1 && !alreadySentToOneUser) {
					sendMessageAndUpdateRecords(trigger, tweet, cbEach);
					alreadySentToOneUser = true;
				}
				else {
					cbEach(null);
				}
			},
			cbAfterTrigger);
		});
	};

	// First get array of users
	getExistingUsernames(function (err, userArray) {
		usernameArray = userArray;
		// 1. For each 'trigger'
		getTriggers(function (err, triggers) {
			console.log('Triggers:', triggers.length);
			async.each(triggers, processTrigger, callbackWhenDone);
		});
	});

}

//------ PUBLIC METHODS ------

module.exports = {

	start: function (cbAfterRun) {

		if (!process.env['TWITTER_CONSUMER_KEY']) {
			console.error('Twitter settings not found in environment.');
			cbAfterRun(null);
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

			async.series([
				searchAndTweet,
				cbAfterRun
			]);
		}

	}

}