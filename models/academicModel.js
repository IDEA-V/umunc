var mongoose = require('mongoose')
var academicSchema = require('../schemas/academicSchema')
var Academic = mongoose.model('Academic',academicSchema)

module.exports = Academic