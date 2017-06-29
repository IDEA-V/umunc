var mongoose = require('mongoose')
var delegateSchema = require('../schemas/delegateSchema')
var Delegate = mongoose.model('Delegate',delegateSchema)

module.exports = Delegate