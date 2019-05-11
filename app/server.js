var mongoose = require('mongoose')
var glob = require('glob')
var config = require('./config')

mongoose.connect(config.db, { useMongoClient: true })
mongoose.connection.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db)
})

var models = glob.sync(config.root + '/app/models/*.js')
models.forEach(function (model) {
  require(model)
})

var twatbot = require('./twatbot')

twatbot.start(function (err) {
  mongoose.connection.close()
})
