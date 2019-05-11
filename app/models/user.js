// Twitter user

'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var UserSchema = new Schema({
  screen_name: { type: String, required: true, unique: true },
  dateFollowed: { type: Date },
  dateLastFavorited: { type: Date },
  dateLastSent: { type: Date },
  lastSentTweetId: { type: String },
  lastFavoritedTweetId: { type: String },
  triggerText: { type: String }
})

mongoose.model('User', UserSchema)
