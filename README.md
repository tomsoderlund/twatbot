# TwatBot

The smart Twitter bot. Built with Node.js and [Twit](https://github.com/ttezel/twit).


## Features

**Implemented:**

- [x] When someone asks a question, tweet a related reply to them (limit: TWATBOT_TWEETS_PER_TRIGGER).
- [x] Save list of Twitter usernames so you don’t tweet same person twice.
- [x] Support for grouping triggers/reply messages in "topics".
- [x] Config in ENV variables.
- [x] Support for questions - "?" in tweet.
- [x] Follow users based on search (limit: TWATBOT_FOLLOWING_PER_SESSION).
- [x] Favorite tweets based on search.
- [x] Scale user list - not keep big array in memory.
- [x] Don't repeat same message two times in a row.
- [x] Tweet at random times (environment: TWATBOT_REPLY_TIME_MAX_SECONDS).
- [x] Have some triggers that only follow, doesn't tweet (set topic "follow-only" on trigger).
- [x] Unfollow non-followers automatically.
- [x] Check all @mentions on replied tweets and place them on userlist to avoid multi-post.

**Planned:**

- [ ] Retweet.
- [ ] Multi-language support.
- [ ] Use "enabled" flag on triggers/messages.
- [ ] Personalize sent messages: real name, location, tools, words used.
- [ ] When someone follows your Twitter account, send the a personalized direct message (DM).
- [ ] Time limit for tweets - tweet at random times, and not too often.


## Concepts

* **Trigger:** a search phrase to search on Twitter. Only `text` property is mandatory, optional parameters include `question` (only questions).
* **Message:** a text template to be used for sending a tweet to a user, e.g. "What’s up {{screen_name}}?".
* **User:** a Twitter user and recipient. Saved in database to avoid sending to same person twice.
* **Topic:** a way of grouping triggers and messages together. E.g. a "weather" trigger should only use "weather" messages as replies.


## How to run

Install:

	yarn

Set config variables in `.env` or with `export`:

	export TWATBOT_DEBUG=true
	export TWATBOT_SEARCH_LIMIT=60

	export TWITTER_CONSUMER_KEY=xxxxxxxxxxxxxxx
	export TWITTER_CONSUMER_SECRET=xxxxxxxxxxxxxxx
	export TWITTER_ACCESS_TOKEN=xxxxxxxxxxxxxxx
	export TWITTER_ACCESS_TOKEN_SECRET=xxxxxxxxxxxxxxx

Run the app:

	yarn dev

or:

	yarn start


## Administration – Manage data with command-line tool

	node app/manage.js add trigger "hello world"

on Heroku:

	heroku run node app/manage.js add trigger "hello world" -a APP_NAME


## Scheduler

Can be used with a scheduler: https://devcenter.heroku.com/articles/scheduler

	heroku addons:create scheduler:standard
	heroku addons:open scheduler


E.g. if it favorites a tweet every 10 minutes: 1 * 60/10 * 24 = 144 tweets per day.


## Configuration

- `NODE_ENV`
- `MONGODB_URI` (old: `MONGOLAB_URI`)

Twitter account*:

- `TWITTER_SCREEN_NAME`: username
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_TOKEN_SECRET`
- `TWITTER_CONSUMER_KEY`
- `TWITTER_CONSUMER_SECRET`

*You need Twitter access token: https://dev.twitter.com/oauth/overview/application-owner-access-tokens

TwatBot behavior:

- `TWATBOT_DEBUG`
- `TWATBOT_FAVORITES_LIMIT`
- `TWATBOT_FOLLOWING_LIMIT`
- `TWATBOT_REPLY_TIME_MAX_SECONDS`
- `TWATBOT_SEARCH_LIMIT`
- `TWATBOT_SEND_TWEETS_LIMIT`
- `TWATBOT_UNFOLLOWING_LIMIT`
