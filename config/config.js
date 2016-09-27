'use strict';

var path = require('path'),
	rootPath = path.normalize(__dirname + '/..'),
	env = process.env.NODE_ENV || 'development';
var _ = require('lodash');

var config = {

	DEFAULT: {
		root: rootPath,
		app: {
			name: 'twatbot',
			TWATBOT_DEBUG: process.env.TWATBOT_DEBUG !== undefined ? JSON.parse(process.env.TWATBOT_DEBUG) : true,
			TWATBOT_FAVORITES_LIMIT: process.env.TWATBOT_FAVORITES_LIMIT !== undefined ? parseInt(process.env.TWATBOT_FAVORITES_LIMIT) : 0,
			TWATBOT_FOLLOWING_LIMIT: process.env.TWATBOT_FOLLOWING_LIMIT !== undefined ? parseInt(process.env.TWATBOT_FOLLOWING_LIMIT) : 0,
			TWATBOT_REPLY_TIME_MAX_SECONDS: process.env.TWATBOT_REPLY_TIME_MAX_SECONDS !== undefined ? parseInt(process.env.TWATBOT_REPLY_TIME_MAX_SECONDS) : 300,
			TWATBOT_SEARCH_LIMIT: process.env.TWATBOT_SEARCH_LIMIT !== undefined ? parseInt(process.env.TWATBOT_SEARCH_LIMIT) : 100,
			TWATBOT_SEND_TWEETS_LIMIT: process.env.TWATBOT_SEND_TWEETS_LIMIT !== undefined ? parseInt(process.env.TWATBOT_SEND_TWEETS_LIMIT) : 0,
			TWATBOT_UNFOLLOWING_LIMIT: process.env.TWATBOT_UNFOLLOWING_LIMIT !== undefined ? parseInt(process.env.TWATBOT_UNFOLLOWING_LIMIT) : 0,

			TWITTER_SCREEN_NAME: process.env.TWITTER_SCREEN_NAME,
			TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY,
			TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET,
			TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
			TWITTER_ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET,
		},
	},

	development: {
		port: 3003,
		db: 'mongodb://localhost/twatbot-development',
	},

	test: {
		port: 3000,
		db: 'mongodb://localhost/twatbot-test',
	},

	production: {
		port: 3000,
		db: process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://localhost/twatbot-production',
	}

};

module.exports = _.extend(config['DEFAULT'], config[env]);
