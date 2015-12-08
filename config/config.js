'use strict';

var path = require('path'),
	rootPath = path.normalize(__dirname + '/..'),
	env = process.env.NODE_ENV || 'development';

var config = {

	development: {
		root: rootPath,
		app: {
			name: 'twatbot'
		},
		port: 3003,
		db: 'mongodb://localhost/twatbot-development'
	},

	test: {
		root: rootPath,
		app: {
			name: 'twatbot'
		},
		port: 3000,
		db: 'mongodb://localhost/twatbot-test'
	},

	production: {
		root: rootPath,
		app: {
			name: 'twatbot'
		},
		port: 3000,
		db: process.env.MONGOLAB_URI || 'mongodb://localhost/twatbot-production'
	}

};

module.exports = config[env];