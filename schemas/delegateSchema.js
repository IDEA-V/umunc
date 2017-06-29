var mongoose = require('mongoose');

var DelegateSchema = new mongoose.schema({
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
	teaminfo:{
		teamname:String,
		leader:Number,
	},
	applyinfo:{
		worktime:Number,
		application1:String,
		application2:String,
		acceptchange:Number,
		experience:String,
	},
	manageinfo:{
		interviewer:String,
		committee:String,
		seat:String,
		applystatus:String,
		roomateRequire:[Number],
		roomate:String,
		mealinfo:{type:Schema.Types.ObjectId,ref: 'mealInfo'},

	}
},{collection: 'delegates'});

module.exports = DelegateSchema