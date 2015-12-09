'use strict';

var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var twitterHelper = require('./twitterHelper');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Trigger = mongoose.model('Trigger');
var Message = mongoose.model('Message');

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
				if (err) {
					console.error('sendMessageAndUpdateRecords:', err);
					cbAfterSend(err);
				}
				else {
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

	var usernameArray;

	var processTrigger = function (trigger, cbAfterTrigger) {
		// 2. Search Twitter for trigger
		searchTweetsByTrigger(trigger, function (err, tweets) {
			// 3. Find first user not on the user list
			var alreadySentToOneUser = false;
			async.each(tweets, function (tweet, cbEach) {
				if (usernameArray.indexOf(tweet.user.screen_name) === -1 && !alreadySentToOneUser) {
					console.log('Read: @' + tweet.user.screen_name + ': “' + tweet.text + '” - ' + twitterHelper.makeTweetURL(tweet));
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

		async.series([
			twitterHelper.init,
			searchAndTweet
		],
		cbAfterRun);

	}

}