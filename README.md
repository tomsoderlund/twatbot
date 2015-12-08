# TwatBot

The smart Twitter bot.


## Features

**Implemented:**

* When someone asks a question, tweet a related reply to them.
* Save list of Twitter usernames so you don’t tweet same person twice.
* Support for grouping triggers/reply messages in "topics".
* Config in ENV variables.

**Planned:**

* Support for questions - "?" in tweet.
* Use "enabled" flag on triggers/messages.
* Personalize sent messages.
* When someone follows your Twitter account, send the a personalized direct message (DM).
* Have a time limit for tweets - not tweet too often.


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

## Usage

Can be used with a scheduler: https://devcenter.heroku.com/articles/scheduler

	heroku addons:create scheduler:standard
	heroku addons:open scheduler

## Implementation

Node.js, Twit