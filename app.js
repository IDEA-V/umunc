express = require('express');
mongoose = require('mongoose')
_ = require('underscore')
port = process.env.PORT || 5000
//models
Delegate = require('./models/delegateModel')
Academic = require('./models/academicModel')
Admin = require('./models/adminModel')

app = express()
mongoose.connect('mongodb://localhost/test')
app.use(require('body-parser')())
app.listen(port)

//mail system
nodemailer = require('nodemailer')
mailTransport = nodemailer.createTransport({
	service: 'Hotmail',
	auth:{
		user:'wangweitian@hotmail.com',
		pass:'SW19611963',
	}
})
//uuid for generating random string
uuidV1 = require('uuid/v1')

//session
session = require('express-session')
app.use(session({
	name:'SessionID',
	secret:'umunc',
	resave: false,
	saveUninitialized: false,
}))
//fileSystem
upload = require('fileSystem')
fs = require('fs')

//gets&posts
app.post('/login',function login(req,res) {
	var email = req.body.email
	var password = req.body.password
	var condition = {email:email}

	findOneInThree(condition,function(result){
		result = result.toObject()
		if (err){
			console.log(err)
			res.send({err: true})
		}else{
			if (result){
				if (result.password==password){
					req.session.regenerate(function(err){
						//create session
						if(err){
							response = {
								err:'session creation failed'
							}
							console.log('session generation failed')
							res.send(response)
						}else{
							response = {
								role:result.role,
								verified:result.verified,
							}
							req.session.email = email
							req.session.role = result.role
							console.log(name + ' has loged in')
							if (result.registerStep == 3){
								res.send(response)
							}else{
								res.redirect('/register/'+(result.registerStep+1))
							}
						}
					})
				}else{
					response={
						err:'permission denied'
					}
					console.log('permission denied')
					res.send(response)
				}
			}else{
				response = {
					err:"user doesn't exist"
				}
				console.log("user doesn't exist")
				res.send(response)
			}
		}
	})
})
app.get('/verify/*',function verify(req,res) {
	//used to verify the v_id in the url
	//url example: /verify/wanwt@shanghaitech.edu.cn/id=123456
	var url = req.url
	var pos=url.search('id=')
	var email = url.slice(8,pos-1)
	var id = url.slice(pos+3)
	var condition = {email:email}

	findOneInThree(condition,function(result){
		if (result.get('v_id') == id) {
				result.verified = true
				result.save()
				res.send()
		}
	})
})
app.post('/register/1',function buildUser(req,res) {
	var role = req.body.role
	var email = req.body.email
	var obj = req.body
	var v_id = uuidV1()//generate random string for email verification
	
	mailTransport.sendMail({
		//send the email
		from:'wangweitian@hotmail.com',
		to:obj.email,
		subject: '[Umunc] Please verify your email account',
		text:'/verify/'+email+'/id='+v_id,
	},function (err) {
		if (err) console.log('Unable to send email: '+err)
	})

	//create session for page 2
	req.session.regenerate(function(err){
		if(err){
			response={
				err:'session creation failed'
			}
			console.log('session generation failed')
			res.send(response)
		}else{
			req.session.email = email
			req.session.role = role
			console.log(email + ' is registering')
		}
	})

	switch (role) {
		case 'delegate':
			var newDelegate = new Delegate({
					email:obj.email,
					password:obj.password,
					role:obj.role,
					registerStep:1,
					verified:false,
					v_id:v_id,
					name:null,
					gender:null,
					age:null,
					idnum:null,
					school:null,
					grade:null,
					phone1:null,
					phone2:null,
					guardian:null,
					phoneg:null,
					qq:null,
					wechat:null,
					skype:null,
					worktime:null,
					application1:null,
					application2:null,
					acceptchange:null,
					experience:null,

					teamname:null,
					leader:null,
					interviewer:null,
					committee:null,
					avaliableSeat:null,
					seat:null,
					applystatus:0,
					roomateRequire:[],
					roomate:null,
			})
			newDelegate.save(function(err,delegate){
			if (err){
				console.log(err)
				res.send({err: true})
			}

			res.redirect('/register/2')//redirect
			res.end()//end the response immdiately
			})
			break
		case 'academic':
			var newAcademic = new Academic({
				email:obj.email,
				password:obj.password,
				role:obj.role,
				verified:false,
				v_id:v_id
			})
			newAcademic.save(function(err,delegate){
			if (err){
				console.log(err)
				res.send({err: true})
			}

			res.redirect('/register/2')//redirect
			res.end()
			})
			break
		case 'admin':
			var newAdmin = new Admin({
				email:obj.email,
				password:obj.password,
				role:obj.role,
				verified:false,
				v_id:v_id
			})
			newAdmin.save(function(err,delegate){
			if (err){
				console.log(err)
				res.send({err: true})
			}

			res.redirect('/register/2')//redirect
			res.end()
			})
			break
		default:
				console.log('wrong role')
		}
})
app.post('/register/2',function addBasicInfo(req,res) {
	var session = req.session
	var obj = req.body
	var email = session.email
	var role = session.role
	if (!email) {
		res.send({err:"Haven't log in"})
	}
	switch (role) {
		case 'delegate':
			Delegate.findOne({email:email},function (err,delegate) {
				if (err){
					res.send({err: true});
				};
				_delegate=_.extend(delegate,obj);
				_delegate.save(function (err,delegate) {
					console.log(obj)
					console.log(_delegate)
					if (err){
						console.log(err);
						res.send({err: true});
					};
				});

				res.redirect('register/3/team');
			})
			break;
		case 'academic':
			Academic.findOne({email:email},function (err,academic) {
				if (err){
					res.send({err: true});
				};
				_academic=_.extend(academic,obj);
				_academic.save(function (err,academic) {
					if (err){
						console.log(err);
						res.send({err: true});
					};
				});

				res.redirect('register/3');
			})
			break;
		case 'admin':
			Admin.findOne({email:email},function (err,admin) {
				if (err){
					res.send({err: true});
				};
				_admin=_.extend(admin,obj);
				_admin.save(function (err,admin) {
					if (err){
						console.log(err);
						res.send({err: true});
					};
				});

				res.redirect('register/3');
			})
			break;
		default:
			console.log('wrong role');
			res.send('wrong role');
			break;
	}
	})

app.get('/applystatus',function(req,res){
	var session = req.session
	var email = session.email
	if (!email) {
		res.send({err:"Haven't log in"})
	}
	Delegate.findOne({email:email},function (err,result) {
		if (err){
			res.send({err:true})
		}else{
			result = result.toObject()
			res.send(result.applystatus)
		}
	})
})

app.get('/avaliableSeats',function(req,res){
	var session = req.session
	var email = session.email
	if (!email) {
		res.send({err:"Haven't log in"})
	}
	Delegate.findOne({email:email},function (err,result) {
		if (err){
			res.send({err:true})
		}else{
			result = result.toObject()
			res.send(result.avaliableSeats)
			
		}
	})
})

app.get('/committee',function(req,res){
	var session = req.session
	var email = session.email
	if (!email) {
		res.send({err:"Haven't log in"})
	}
	Delegate.findOne({email:email},function (err,result) {
		if (err){
			res.send({err:true})
		}else{
			result = result.toObject()
			res.send(result.committee)
		}
	})
})

app.get('/interviewer',function(req,res){
	var session = req.session
	var email = session.email
	if (!email) {
		res.send({err:"Haven't log in"})
	}
	Delegate.findOne({email:email},function (err,result) {
		if (err){
			res.send({err:true})
		}else{
			result = result.toObject()
			res.send(result.interviewer)
		}
	})
})

app.get('/team',function(req,res){
	var session = req.session
	var email = session.email
	if (!email) {
		res.send({err:"Haven't log in"})
	}
	Delegate.findOne({email:email},function (err,result) {
		if (err){
			res.send({err:true})
		}else{
			result = result.toObject()
			res.send({
				teamname:result.interviewer
				leadr:result.leader
			})
		}
	})
})

app.get('/roomateRequsts',function(req,res){
	var session = req.session
	var email = session.email
	if (!email) {
		res.send({err:"Haven't log in"})
	}
	Delegate.findOne({email:email},function(err,result){
		res.send(result.get('roomateRequire'))
	})
})

app.post('/roomateRequsts',function(req,res){
	var session = req.session
	var email1 = session.email
	var email2 = req.body.email
	if (!email1) {
		res.send({err:"Haven't log in"})
	}
	Delegate.findOne({email:email1},function(err,result){
		result.roomate = email2
		result.save()
		Delegate.findOne({email:email2},function(err,theOther){
			theOther.roomate = email1
			theOther.save()
		})
	})
})

app.post('/roomateChoose',function(req,res){
	var session = req.session
	var email1 = session.email
	var email2 = req.body.email
	if (!email1) {
		res.send({err:"Haven't log in"})
	}
	Delegate.findOne({email:email1},function(err,result){
		var obj1 = result.toObject()
		Delegate.findOne({email:email2},function(err,theOther){
			var obj2 = theOther.toObject()
			if (obj2.gender==obj1.gender&&obj2.roomate==null){
				var array = theOther.get('roomateRequire')
				array.push(email1) 
				theOther.roomateRequire = array
				theOther.save()
			}
		})
	})
})

app.post('/newsUpload',upload.any(),function(req,res){
	var session = req.session
	var email = session.email
	var role = session.role
	var arrty = []
	if (!email) {
		res.send({err:"Haven't log in"})
	}
	req.files.forEach(function(item,index){
		var newName = email+Date.now()
		fs.rename(item.path,'./public/images/'+newName)
		array.push(newName)
	})	
	newNews = new News({
		text: req.body.text,
		email:email,
		role:role
		images:array
	})
	newNews.save()
	res.send('success')


//functions
function findOneInThree(condition,exec){
	//use to find doc in three collections and do something to it
	//exec is a function that receive the doc finded
	Delegate.findOne(condition,function(err,result){
		if(result){
			exec(result)
		}else{
			Academic.findOne(condition,function(err,result){
				if(result){
					exec(result)
				}else{
					Admin.findOne(condition,function(err,result){
						if (result) {
							exec(result)
						}
					})
				}
			})
		}
	})
}
