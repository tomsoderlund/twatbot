'use strict';

var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var twitterHelper = require('./twitterHelper');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Trigger = mongoose.model('Trigger');
var Message = mongoose.model('Message');

var TWATBOT_TWEETS_PER_TRIGGER = (process.env['TWATBOT_TWEETS_PER_TRIGGER']  ? parseInt(process.env['TWATBOT_TWEETS_PER_TRIGGER']) : 1);

var getTriggers = function (callback) {
	// var trig = new Trigger({ text: "from:tomsoderlund" });
	// trig.save();
	Trigger.find({}).exec(callback);
};

var isUserWhitelisted = function (userObj, callback) {
	// var user = new User({ screen_name: "tomsoderlund" });
	// user.save();
	User.find({ screen_name: userObj.screen_name }).exec(function (err, userData) {
		err = (userData.length !== 0); // found = not whitelisted
		callback(err, userData);
	});
};

var lastMessageUsed = "";

var getRandomMessageForTopic = function (topic, replyToStatusObj, callback) {
	// var message = new Message({ text: "Have you tried Weld? https://www.weld.io?utm_content=tweet-tried-weld" });
	// message.save();
	Message.find({ topic: topic, text: { $ne: lastMessageUsed } }).exec(function (err, messages) {
		var messageObj = messages[Math.floor(Math.random() * messages.length)];
		err = (messages.length === 0); // no matching messages found -> error
		if (messageObj) {
			lastMessageUsed = messageObj.text;
		}
		callback(err, messageObj);
	});
};

var searchTweetsByTrigger = function (trigger, callback) {
	twitterHelper.searchTweets(trigger.text, undefined, function (err, tweets) {
		// If trigger requires question, filter only those with '?'
		if (trigger.question) {
			tweets = _.filter(tweets, function (tweet) {
				return (tweet.text.indexOf('?') !== -1);
			});
		}
		callback(err, tweets);
	});
};

var searchAndTweet = function (callbackWhenDone) {

	// 1. For each 'trigger'
	// 2. Search Twitter for trigger
	// 3. Find first user not on the user list
	// 4. Get a suitable message template
	// 5. Send them a tweet
	// 6. Save user, trigger, and message objects

	var saveOptions = function (userObj, trigger, messageObj, newTweetObj, cbAfterSave) {
		async.parallel([
			// User
			function (cb) {
				var user = new User({
					screen_name: userObj.screen_name,
					lastSentTweetId: newTweetObj.id_str
				});
				user.save(cb);
			},
			// Trigger
			function (cb) {
				trigger.dateFirstUsed = trigger.dateFirstUsed || new Date();
				trigger.dateLastUsed = new Date();
				trigger.usedCount++;
				trigger.save(cb);
			},
			// Message
			function (cb) {
				messageObj.dateFirstUsed = trigger.dateFirstUsed || new Date();
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
				if (!err) {
					// Personalize message
					if (messageObj.text.indexOf('{{screen_name}}') !== -1) {
						// {{screen_name}} is in template
						var personalMessage = messageObj.text.replace(/{{screen_name}}/g, '@' + replyToStatusObj.user.screen_name);
					}
					else {
						// {{screen_name}} NOT in template
						var personalMessage = '@' + replyToStatusObj.user.screen_name + ' ' + messageObj.text;
					}
					// 5. Send them a tweet
					twitterHelper.postTweet(personalMessage, replyToStatusObj,
						function (err, newTweetObj) {
							// 6. Save user, trigger, and message objects
							saveOptions(replyToStatusObj.user, trigger, messageObj, newTweetObj, cbAfterSend);
						}
					);
				}
			}
		);
	};

	var processTrigger = function (trigger, cbAfterTrigger) {
		// 2. Search Twitter for trigger
		searchTweetsByTrigger(trigger, function (err, tweets) {
			// 3. Find first user not on the user list
			var tweetsSentForThisTrigger = 0;
			async.each(tweets, function (tweet, cbEachTweet) {
				// For each tweet found:
				console.log('Read: ' + twitterHelper.formatTweet(tweet) + '; ' + twitterHelper.formatTweetURL(tweet));
				async.parallel([
					// Follow user
					function (cb) {
						twitterHelper.followUser(tweet.user, cb);
					},
					// Favorite the tweet
					function (cb) {
						twitterHelper.makeTweetFavorite(tweet, cb);
					},
					// Send a reply - if conditions
					function (cb) {
						isUserWhitelisted(tweet.user, function (err, tweets) {
							if (!err && tweetsSentForThisTrigger < TWATBOT_TWEETS_PER_TRIGGER) {
								sendMessageAndUpdateRecords(trigger, tweet, cb);
								tweetsSentForThisTrigger++;
							}
							else {
								cbEachTweet(null);
							}
						});
					},
				],
				// When all done
				function (err, results) {
					cbEachTweet(null);
				});
			},
			cbAfterTrigger);
		});
	};

	// 1. For each 'trigger'
	getTriggers(function (err, triggers) {
		console.log('Triggers:', triggers.length);
		async.each(triggers, processTrigger, callbackWhenDone);
	});

}

//------ PUBLIC METHODS ------

module.exports = {

	start: function (cbAfterRun) {

		async.series([
			twitterHelper.init,
			searchAndTweet
		],
		cbAfterRun);

		// Send 1 tweet test
		// twitterHelper.init();
		// twitterHelper.postTweet("Ho\nHo\nHo", undefined, cbAfterRun);

	}

}