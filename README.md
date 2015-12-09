# TwatBot

The smart Twitter bot.


## Features

**Implemented:**

* When someone asks a question, tweet a related reply to them.
* Save list of Twitter usernames so you don’t tweet same person twice.
* Support for grouping triggers/reply messages in "topics".
* Config in ENV variables.
* Support for questions - "?" in tweet.

**Planned:**

* Use "enabled" flag on triggers/messages.
* Personalize sent messages.
* When someone follows your Twitter account, send the a personalized direct message (DM).
* Have a time limit for tweets - not tweet too often.


## Usage

**Concepts:**

* Trigger: a search phrase to search on Twitter. Only `text` property is mandatory, optional parameters include `question` (only questions).
* Message: a text template to be used for sending a tweet to a user, e.g. "What’s up {{screen_name}}?".
* User: a Twitter user and recipient. Saved in database to avoid sending to same person twice.
* Topic: a way of grouping triggers and messages together. E.g. a "weather" trigger should only use "weather" messages as replies.

Can be used with a scheduler: https://devcenter.heroku.com/articles/scheduler

	heroku addons:create scheduler:standard
	heroku addons:open scheduler


## How to run

Just start with:

	npm install

	export TWATBOT_DEBUG=true
	export TWATBOT_SEARCH_LIMIT=60

	export TWITTER_CONSUMER_KEY=xxxxxxxxxxxxxxx
	export TWITTER_CONSUMER_SECRET=xxxxxxxxxxxxxxx
	export TWITTER_ACCESS_TOKEN=xxxxxxxxxxxxxxx
	export TWITTER_ACCESS_TOKEN_SECRET=xxxxxxxxxxxxxxx

	node app.js

You need Twitter access token: https://dev.twitter.com/oauth/overview/application-owner-access-tokens

## Implementation

Node.js, Twit