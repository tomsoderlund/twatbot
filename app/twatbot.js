'use strict'

const _ = require('lodash')
const async = require('async')
const mongoose = require('mongoose')

const twitterHelper = require('./twitterHelper')
const config = require('./config')

const User = mongoose.model('User')
const Trigger = mongoose.model('Trigger')
const Message = mongoose.model('Message')

var getTriggers = function (callback) {
  // var trig = new Trigger({ text: "from:tomsoderlund" });
  // trig.save();
  Trigger.find({}).exec(callback)
}

var removeBlacklistedTweets = function (trigger, tweets, dateField, limit, callback) {
  var screenNames = _.uniq(_.map(tweets, 'user.screen_name'))
  var searchParams = { screen_name: { $in: screenNames } }
  // If a dateField is specified, it must exist on user for user to be blacklisted/blocked from action
  if (dateField) {
    searchParams[dateField] = { $exists: true }
  }
  // Search
  User.find(searchParams).exec(function (err, users) {
    var blacklistedUsers = _.map(users, 'screen_name')
    var whitelistedTweets = _.filter(tweets, function (tweet) {
      // If the tweet's user is not in blacklistedUsers and not yourself, let it through
      return (blacklistedUsers.indexOf(tweet.user.screen_name) === -1) && (tweet.user.screen_name.toLowerCase() !== config.app.TWITTER_SCREEN_NAME.toLowerCase())
    })
    console.log('Remove tweets due to blacklist (' + trigger.text + ', ' + dateField + '):', tweets.length, '→', whitelistedTweets.length)
    var limitedTweets = _.slice(whitelistedTweets, 0, limit)
    console.log('Remove tweets due to limit (' + trigger.text + ', ' + dateField + '):', whitelistedTweets.length, '→', limitedTweets.length)
    callback(err, limitedTweets)
  })
}

var lastMessageUsed = ''

var getRandomMessageForTopic = function (topic, replyToStatusObj, callback) {
  Message.find({ topic: topic, text: { $ne: lastMessageUsed } }).exec(function (err, messages) {
    var messageObj = messages[Math.floor(Math.random() * messages.length)]
    err = (messages.length === 0 ? 'no matching message' : null) // no matching messages found -> error
    if (messageObj) {
      lastMessageUsed = messageObj.text
    }
    callback(err, messageObj)
  })
}

var searchTweetsByTrigger = function (trigger, callback) {
  twitterHelper.searchTweets(trigger.text, undefined, function (err, tweets) {
    // If trigger requires question, filter only those with '?'
    if (trigger.question) {
      tweets = _.filter(tweets, function (tweet) {
        return (tweet.text.indexOf('?') !== -1)
      })
    }
    callback(err, tweets)
  })
}

var getScreenNamesFromString = function (str) {
  var ary = str.match(/@([a-z\d]+)/ig)
  for (var i in ary) { ary[i] = ary[i].substr(1, ary[i].length) }
  return ary
}

var updateUser = function (userScreenName, properties, entireTweet, cbAfterSave) {
  // console.log('Save: @' + userScreenName, properties);
  User.update({ screen_name: userScreenName }, properties, { upsert: true }, function (err, data) {
    if (entireTweet) {
      // Add all usernames in Tweet
      var usernames = getScreenNamesFromString(entireTweet.text)
      async.each(usernames, function (username, cbEach) {
        User.update({ screen_name: username }, properties, { upsert: true }, cbEach)
      }, cbAfterSave)
    } else {
      cbAfterSave(err, data)
    }
  })
}

var saveOptions = function (trigger, messageObj, cbAfterSave) {
  async.parallel([
    // Trigger
    function (cb) {
      trigger.dateFirstUsed = trigger.dateFirstUsed || new Date()
      trigger.dateLastUsed = new Date()
      trigger.usedCount++
      trigger.save(cb)
    },
    // Message
    function (cb) {
      messageObj.dateFirstUsed = trigger.dateFirstUsed || new Date()
      messageObj.dateLastUsed = new Date()
      messageObj.usedCount++
      messageObj.save(cb)
    }
  ],
  // When all done
  cbAfterSave)
}

var doInRandomTime = function (callback) {
  setTimeout(
    callback,
    Math.floor(Math.random() * config.app.TWATBOT_REPLY_TIME_MAX_SECONDS * 1000)
  )
}

var sendPersonalMessage = function (trigger, replyToStatusObj, cbAfterSend) {
  // 4. Get a suitable message template
  getRandomMessageForTopic(
    trigger.topic,
    replyToStatusObj,
    function (err, messageObj) {
      if (err) {
        cbAfterSend(null, null) // Don't propagate this error
      } else {
        // Personalize message
        var messageText
        if (messageObj.text.indexOf('{{screen_name}}') !== -1) {
          // {{screen_name}} is in template
          messageText = messageObj.text.replace(/{{screen_name}}/g, '@' + replyToStatusObj.user.screen_name)
        } else {
          // {{screen_name}} NOT in template
          messageText = '@' + replyToStatusObj.user.screen_name + ' ' + messageObj.text
        }
        // 5. Send them a tweet
        twitterHelper.postTweet(messageText, replyToStatusObj, function (err, newTweet) {
          saveOptions(trigger, messageObj, function (err) {
            cbAfterSend(err, newTweet)
          })
        })
      }
    }
  )
}

var processTrigger = function (trigger, cbAfterTrigger) {
  // 2. Search Twitter for search trigger/phrase
  searchTweetsByTrigger(trigger, function (err, tweets) {
    async.parallel([
      // Follow user
      function (cbParallel) {
        removeBlacklistedTweets(trigger, tweets, 'dateFollowed', config.app.TWATBOT_FOLLOWING_LIMIT, function (err, newTweets) {
          var usersToFollow = _.uniq(_.map(newTweets, 'user'))
          async.each(usersToFollow, function (user, cbEachUser) {
            async.waterfall([
              function (cbWaterfall) {
                twitterHelper.followUser(user, cbWaterfall)
              },
              function (followData, cbWaterfall) {
                updateUser(followData.screen_name, {
                  dateFollowed: new Date(),
                  triggerText: trigger.text
                }, false, cbWaterfall)
              }
            ], cbEachUser)
          }, cbParallel)
        })
      },
      // Favorite the tweet
      function (cbParallel) {
        removeBlacklistedTweets(trigger, tweets, 'dateLastFavorited', config.app.TWATBOT_FAVORITES_LIMIT, function (err, newTweets) {
          async.each(newTweets, function (tweet, cbEachTweet) {
            async.waterfall([
              function (cbWaterfall) {
                twitterHelper.makeTweetFavorite(tweet, function (err, tweet) {
                  cbWaterfall(null, tweet) // NOTE: ignore Twitter Favorite error
                })
              },
              function (favoriteData, cbWaterfall) {
                updateUser(tweet.user.screen_name, {
                  dateLastFavorited: new Date(),
                  lastFavoritedTweetId: tweet.id_str
                }, false, cbWaterfall)
              }
            ], cbEachTweet)
          }, cbParallel)
        })
      },
      // Send a reply tweet
      function (cbParallel) {
        removeBlacklistedTweets(trigger, tweets, 'dateLastSent', config.app.TWATBOT_SEND_TWEETS_LIMIT, function (err, newTweets) {
          async.each(newTweets, function (tweet, cbEachTweet) {
            async.waterfall([
              function (cbWaterfall) {
                doInRandomTime(function () {
                  sendPersonalMessage(trigger, tweet, cbWaterfall)
                })
              },
              function (newTweet, cbWaterfall) {
                if (newTweet) {
                  updateUser(tweet.user.screen_name, {
                    dateLastSent: new Date(),
                    lastSentTweetId: newTweet.id_str
                  }, tweet, cbWaterfall)
                } else {
                  cbWaterfall(null)
                }
              }
            ], cbEachTweet)
          }, cbParallel)
        })
      }
    ],
    // When search trigger has been processed
    cbAfterTrigger)
  })
}

var searchAndTweet = function (callbackWhenDone) {
  // 1. For each 'trigger'
  // 2. Search Twitter for trigger
  // 3. Find first user not on the user list
  // 4. Get a suitable message template
  // 5. Send them a tweet
  // 6. Save user, trigger, and message objects

  // 1. For each 'trigger'
  getTriggers(function (err, triggers) {
    console.log('Triggers found:', triggers.length)
    async.each(triggers, processTrigger, callbackWhenDone)
  })
}

var unfollowNonFollowers = function (callbackWhenDone) {
  async.waterfall([
    // 1. Get friend list
    twitterHelper.getMyFriends,
    // 2. Find unfollowers
    function (friends, cbWaterfall) {
      var nonFollowers = _.filter(friends, function (friend) {
        // If the friend doesn't have followed by
        return friend.connections.indexOf('followed_by') === -1
      })
      // Reverse to avoid unfollow recent friends
      nonFollowers.reverse()
      cbWaterfall(null, _.slice(nonFollowers, 0, config.app.TWATBOT_UNFOLLOWING_LIMIT))
    },
    // 3. Unfriend them
    function (users, cbWaterfall) {
      async.each(users, twitterHelper.unfollowUser, cbWaterfall)
    }
  ], callbackWhenDone)
}

// ------ PUBLIC METHODS ------

module.exports = {

  start: function (cbAfterRun) {
    async.series([
      function (cbSeries) {
        console.log('TwatBot starting up')
        // console.log('  config:', config.app);
        cbSeries(null)
      },

      twitterHelper.init,
      searchAndTweet,
      unfollowNonFollowers,

      function (cbSeries) {
        console.log('TwatBot is done!')
        cbSeries(null)
      }
    ],
    function (err, results) {
      if (err) {
        console.error('TwatBot error:', err, results)
      }
      cbAfterRun(err, results)
    })

    // Send 1 tweet test
    // twitterHelper.init();
    // unfollowNonFollowers(cbAfterRun);
    // twitterHelper.postTweet("Ho\nHo\nHo", undefined, cbAfterRun);
  }

}
