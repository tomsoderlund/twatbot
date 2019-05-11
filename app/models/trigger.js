// Trigger to listen to

'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var TriggerSchema = new Schema({
  text: { type: String, required: true, unique: true }, // text to search Twitter on
  question: { type: Boolean, default: false }, // must be a question (include "?") to trigger
  enabled: { type: Boolean, default: true },
  language: { type: String }, // e.g. 'en', 'fr'
  topic: { type: String }, // any string, limit Message:s sent to this topic
  dateFirstUsed: { type: Date },
  dateLastUsed: { type: Date },
  usedCount: { type: Number, default: 0 }
})

mongoose.model('Trigger', TriggerSchema)
