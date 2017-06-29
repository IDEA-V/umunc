var express = require('express');
var mongoose = require('mongoose')

var port = process.env.PORT || 5000;

var Delegate = require('./models/delegateModel');
var Academic = require('./models/academicModel');
var Admin = require('./models/adminModel');

app = express();
mongoose.connect('mongodb://localhost/test');
app.use(require('body-parser')());
app.listen(port);

//build a user
function buildUser(req,res) {
	var role = req.body.obj.role;
	var obj = req.body.obj
	switch (role) {
		case 'delegate':
			newDelegate = new Delegate({
					email:obj.email,
					password:obj.password,
					role:obj.role
			});
			newDelegate.save(function(err,delegate){
			if (err){
				console.log(err)
			};

			res.redirect('/register/2');//redirect
			});
			break;
		case 'academic':
			newAcademic = new Academic({
				email:obj.email,
				password:obj.password,
				role:obj.role
			});
			newAcademic.save(function(err,delegate){
			if (err){
				console.log(err)
			};

			res.redirect('/register/2');//redirect
			});
			break;
		case 'admin':
			newAdmin = new Admin({
				email:obj.email,
				password:obj.password,
				role:obj.role
			});
			newAdmin.save(function(err,delegate){
			if (err){
				console.log(err)
			};

			res.redirect('/register/2');//redirect
			});
			break;
		default:
			console.log('wrong role');
	};
}


app.post('/register/1',buildUser())