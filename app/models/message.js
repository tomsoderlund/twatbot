// Message to listen to

'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var MessageSchema = new Schema({
  text: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true },
  language: { type: String }, // e.g. 'en', 'fr'
  topic: { type: String }, // any string, limit to Trigger:s on this topic
  dateFirstUsed: { type: Date },
  dateLastUsed: { type: Date },
  usedCount: { type: Number, default: 0 }
})

mongoose.model('Message', MessageSchema)
