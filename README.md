# TwatBot

The smart Twitter bot.


## Features

**Implemented:**

* When someone asks a question, tweet a related reply to them (limit: TWATBOT_TWEETS_PER_TRIGGER).
* Save list of Twitter usernames so you don’t tweet same person twice.
* Support for grouping triggers/reply messages in "topics".
* Config in ENV variables.
* Support for questions - "?" in tweet.
* Follow users based on search (limit: TWATBOT_FOLLOWING_PER_SESSION).
* Favorite tweets based on search.
* Scale user list - not keep big array in memory.
* Don't repeat same message two times in a row.
* Tweet at random times (environment: TWATBOT_REPLY_TIME_MAX_SECONDS).
* Have some triggers that only follow, doesn't tweet (set topic "follow-only" on trigger).
* Unfollow non-followers automatically.
* Check all @mentions on replied tweets and place them on userlist to avoid multi-post.

**Planned:**

* Multi-language support.
* Use "enabled" flag on triggers/messages.
* Personalize sent messages: real name, location, tools, words used.
* When someone follows your Twitter account, send the a personalized direct message (DM).
* Time limit for tweets - tweet at random times, and not too often.


## Usage

**Concepts:**

* Trigger: a search phrase to search on Twitter. Only `text` property is mandatory, optional parameters include `question` (only questions).
* Message: a text template to be used for sending a tweet to a user, e.g. "What’s up {{screen_name}}?".
* User: a Twitter user and recipient. Saved in database to avoid sending to same person twice.
* Topic: a way of grouping triggers and messages together. E.g. a "weather" trigger should only use "weather" messages as replies.

Can be used with a scheduler: https://devcenter.heroku.com/articles/scheduler

	heroku addons:create scheduler:standard
	heroku addons:open scheduler


E.g. if it favorites a tweet every 10 minutes: 1 * 60/10 * 24 = 144 tweets per day.


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


## Manage data

	node manage.js add trigger "hello world"


## Implementation

Node.js, Twit
