'use strict'

var _ = require('lodash')
var Twit = require('twit') // https://github.com/ttezel/twit
var twitObj

var config = require('./config')

// var triggerOnDirectMessage = function () {
//   var stream = twitObj.stream('user')
//
//   stream.on('direct_message', function (event) {
//     console.log('twitObj.direct_message:', event)
//   })
//
//   // stream.on('user_event', function (event) {
//   //   console.log('twitObj.user_event:', event);
//   // });
// }

var formatTweet = function (tweetObj) {
  if (tweetObj) { return '@' + tweetObj.user.screen_name + ': “' + tweetObj.text + '”' } else { return '' }
}

var formatTweetURL = function (tweetObj) {
  if (tweetObj) { return 'https://twitter.com/' + tweetObj.user.screen_name + '/status/' + tweetObj.id_str } else { return '' }
}

var formatLiveDebugFlag = function () {
  return (config.app.TWATBOT_DEBUG ? '(debug)' : '(LIVE)')
}

// https://support.twitter.com/articles/71577
var searchTweets = function (searchStr, options, callback) {
  // sinceDate = sinceDate ||
  // moment(sinceDate).format("YYYY-MM-DD")
  // 'banana since:2011-11-11'
  var params = {
    q: '“' + searchStr + '”',
    count: config.app.TWATBOT_SEARCH_LIMIT
  }
  twitObj.get('search/tweets', params, function (err, data, response) {
    if (!data.statuses) {
      data.statuses = []
    }
    console.log('Search:', params.q, data.statuses.length)
    callback(err, data.statuses)
  })
}

var postTweet = function (message, replyToStatusObj, callback) {
  var params = {
    status: message
  }
  // Is this a reply? NOTE: must also have @recipient in text
  if (replyToStatusObj) {
    params.in_reply_to_status_id = replyToStatusObj.id_str
  }
  // Tweet!
  console.log(
    'Tweet: ' + formatLiveDebugFlag(),
    '“' + params.status + '”',
    '- reply to ' + formatTweet(replyToStatusObj) + '; ' + formatTweetURL(replyToStatusObj)
  )
  if (!config.app.TWATBOT_DEBUG) {
    twitObj.post('statuses/update', params, function (err, data, response) {
      callback(err, data)
    })
  } else {
    callback(null, { 'id_str': '(debug)' })
  }
}

var makeTweetFavorite = function (tweetObj, callback) {
  if (!tweetObj.favorited) {
    console.log('Favorite: ' + formatLiveDebugFlag() + ' ' + formatTweet(tweetObj) + '; ' + formatTweetURL(tweetObj))
    if (!config.app.TWATBOT_DEBUG) {
      twitObj.post('favorites/create', { id: tweetObj.id_str }, function (err, data, response) {
        callback(err, data)
      })
    } else {
      callback(null, tweetObj)
    }
  } else {
    callback(null, tweetObj)
  }
}

var followUser = function (userObj, callback) {
  if (!userObj.following) {
    console.log('Follow: ' + formatLiveDebugFlag() + ' @' + userObj.screen_name)
    if (!config.app.TWATBOT_DEBUG) {
      twitObj.post('friendships/create', { screen_name: userObj.screen_name }, function (err, data, response) {
        if (err) {
          console.log('Error following @' + userObj.screen_name + ':', err)
        }
        callback(null, data)
      })
    } else {
      callback(null, userObj)
    }
  } else {
    callback(null, userObj)
  }
}

var unfollowUser = function (userObj, callback) {
  console.log('Unfollow: ' + formatLiveDebugFlag() + ' @' + userObj.screen_name)
  if (!config.app.TWATBOT_DEBUG) {
    twitObj.post('friendships/destroy', { screen_name: userObj.screen_name }, function (err, data, response) {
      callback(err, data)
    })
  } else {
    callback(null, userObj)
  }
}

// friends/list, then friendships/lookup
var getMyFriends = function (callback) {
  var params = {
    screen_name: config.app.TWITTER_SCREEN_NAME,
    count: 100
  }
  twitObj.get('friends/list', params, function (err, result) {
    var userNames = _.map(result.users, 'screen_name')
    twitObj.get('friendships/lookup', { screen_name: userNames.join(',') }, function (err, friends) {
      callback(err, friends)
    })
  })
}

// ------ PUBLIC METHODS ------

module.exports = {

  init: function (cbAfterInit) {
    if (!config.app.TWITTER_CONSUMER_KEY) {
      console.error('Twitter settings not found in environment.')
      if (cbAfterInit) cbAfterInit('No settings')
    } else {
      twitObj = new Twit({
        'consumer_key': config.app.TWITTER_CONSUMER_KEY,
        'consumer_secret': config.app.TWITTER_CONSUMER_SECRET,
        'access_token': config.app.TWITTER_ACCESS_TOKEN,
        'access_token_secret': config.app.TWITTER_ACCESS_TOKEN_SECRET
      })

      console.log('Debug mode:', config.app.TWATBOT_DEBUG)

      if (cbAfterInit) cbAfterInit(null)
    }
  },

  formatTweet: formatTweet,
  formatTweetURL: formatTweetURL,
  searchTweets: searchTweets,
  postTweet: postTweet,
  makeTweetFavorite: makeTweetFavorite,
  followUser: followUser,
  unfollowUser: unfollowUser,
  getMyFriends: getMyFriends

}
