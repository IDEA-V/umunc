var mongoose = require('mongoose')
var adminSchema = require('../schemas/adminSchema')
var Admin = mongoose.model('Admin',adminSchema)

module.exports = Admin