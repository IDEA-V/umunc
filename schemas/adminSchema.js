var mongoose = require('mongoose');

var AdminSchema = new mongoose.schema({
	email:{type:String,unique:true},
	password:String,
	role:String,
	basicinfo:{
		name:String,
		gender:Number,
		age:Number,
		idnum:String,
		school:String,
		grade:Number,
		phone1:Number,
		phone2:Number,
		guardian:String,
		phoneg:Number,
		qq:String,
		wechat:String,
		skype:String,
	},
	manageinfo:{
		roomateRequire:[Number],
		roomate:String,
		mealinfo:{type:Schema.Types.ObjectId,ref: 'mealInfo'},

	}
},{collection: 'academics'});

module.exports = AdminSchema