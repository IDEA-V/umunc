express = require('express')
mongoose = require('mongoose')
_ = require('underscore')
promise = require('bluebird')
port = process.env.PORT || 5000
//models
Delegate = require('./models/delegateModel')
Academic = require('./models/academicModel')
Admin = require('./models/adminModel')
Committee = require('./models/committeeModel')
News = require('./models/newsModel')
File = require('./models/fileModel')

app = express()
mongoose.connect('mongodb://localhost/umunc')
app.use(require('body-parser')())
var server = app.listen(port,function(){
	var host = server.address().address
	var port = server.address().port

	console.log("Accessing address: http://%s:%s", host,port)
})

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
multer = require('multer')
storage = multer.diskStorage({
	destination:function(req,file,cb){
		cb(null,'./public/images/')
	},
	filename:function(req,file,cb){
		cb(null,'a'+Date.now())
	}
})
upload = multer({
	storage:storage
})
fs = require('fs')

//gets&posts
app.post('/login',function login(req,res) {
	//tested
	var email = req.body.email
	var password = req.body.password
	var condition = {email:email}

	findOneInThree(condition,function(result){
		result = result.toObject()
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
						req.session.verified = result.verified
						console.log(email + ' has loged in')
						if (result.role == 'delegate'){
							if (result.registerStep == 3){
								res.send(response)
							}else{
								res.redirect('/register/'+(result.registerStep+1))
							}
						}else{
							if (result.registerStep == 2){
								res.send(response)
							}else{
								res.redirect('/register/'+(result.registerStep+1))
							}
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
	})
})
app.get('/verify/*',function verify(req,res) {
	//used to verify the v_id in the url
	//url example: /verify/wanwt@shanghaitech.edu.cn/id=123456
	//tested
	var url = req.url
	var pos=url.search('id=')
	var email = url.slice(8,pos-1)
	var id = url.slice(pos+3)
	var condition = {email:email}

	findOneInThree(condition,function(result){
		if (result.get('v_id') == id) {
				result.verified = true
				result.save(function(err){
					if (err) {
						res.send({err:true,msg:'Saving error'})
					}
				})
				res.send()
		}
	})
})
app.post('/register/1',function buildUser(req,res) {
	//tested
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
					seat:null,
					applystatus:0,
					roomateRequire:[],
					roomate:null,
			})
			newDelegate.save(function(err){
				if (err){
					console.log(err)
					res.send({err: true,msg:'Saving error'})
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

				interviewee:[],
				roomateRequire:[],
				roomate:null,
			})
			newAcademic.save(function(err){
				if (err){
					console.log(err)
					res.send({err: true,msg:'Saving error'})
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

				roomateRequire:[],
				roomate:null,
			})
			newAdmin.save(function(err){
				if (err){
					console.log(err)
					res.send({err: true,msg:'Saving error'})
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
	//tested
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
					res.send({err: true})
				}
				_delegate=_.extend(delegate,obj)
				_delegate.registerStep = 2
				_delegate.save(function (err) {
					if (err){
						console.log(err.message)
						res.send({err: true,msg:'Saving error'})
					}else{
						res.redirect('register/3/team')
						res.end()
					}
				})
			})
			break
		case 'academic':
			Academic.findOne({email:email},function (err,academic) {
				if (err){
					res.send({err: true})
				}
				_academic=_.extend(academic,obj)
				_academic.registerStep = 2
				_academic.save(function (err) {
					if (err){
						res.send({err: true,msg:'Saving error'})
					}else{
						res.redirect('register/3/team')
						res.end()
					}
				})
			})
			break
		case 'admin':
			Admin.findOne({email:email},function (err,admin) {
				if (err){
					res.send({err: true})
				}
				_admin=_.extend(admin,obj)
				_admin.registerStep = 2
				_admin.save(function (err) {
					if (err){
						res.send({err: true,msg:'Saving error'})
					}else{
						res.redirect('register/3/team')
						res.end()
					}
				})
			})
			break
	}
})
app.post('/register/3',function addAdvancedInfo(req,res) {
	//tested
	var session = req.session
	var obj = req.body
	var email = session.email
	if (!email) {
		res.send({err:"Haven't log in"})
	}else{
		Delegate.findOne({email:email},function (err,delegate) {
			if (err){
				res.send({err: true})
			}
			_delegate=_.extend(delegate,obj)
			_delegate.registerStep = 2
			_delegate.save(function (err) {
				if (err){
					res.send({err: true,msg:'Saving error'})
				}else{
					res.redirect('/dashborad')
				}
			})
		})
	}
})

//delegate actions
app.get('/applyStatus',function(req,res){
	//tested
	var session = req.session
	var email = session.email
	if (!email) {
		res.send({err:"Haven't log in"})
	}else{
		if (session.verified){
			if (req.session.role != 'delegate'){
				res.send({err:true,msg:'Wrong role'})
			}else{
				Delegate.findOne({email:email},function (err,result) {
					if (err){
						res.send({err:true})
					}else{
						result = result.toObject()
						res.send(result.applystatus.toString())
					}
				})
			}
		}else{
			res.send({err:true,msg:"Haven verify this account"})
		}
	}
})

app.get('/avaliableSeat',function(req,res){
	//tested
	var session = req.session
	var email = session.email
	var seat = req.body.seat
	if (!email) {
		res.send({err:true,msg:"Haven't log in"})
	}else{
		if (req.session.role != 'delegate'){
			res.send({err:true,msg:'Wrong role'})
		}else{
			Delegate.findOne({email:email},function(err,delegate){
				var conditon = {name:delegate.get('committee')}
				Committee.findOne(conditon,function(err,committee){
					var seats = committee.get('avaliableSeat')
					console.log(seats)
					var list = []
					for (x in seats){
						if (seats[x].indexOf(email)!=-1){
							list.push(x)
						}
					}
					res.send(list)
				})
			})
		}
	}
})

app.get('/committee',function(req,res){
	//tested
	var session = req.session
	var email = session.email
	if (!email) {
		res.send({err:true,msg:"Haven't log in"})
	}else{
		if (req.session.role != 'delegate'){
			res.send({err:true,msg:'Wrong role'})
		}else{
			Delegate.findOne({email:email},function (err,result) {
				if (err){
					res.send({err:true})
				}else{
					result = result.toObject()
					res.send(result.committee)
				}
			})
		}
	}
})

app.get('/interviewer',function(req,res){
	//tested
	var session = req.session
	var email = session.email
	if (!email) {
		res.send({err:true,msg:"Haven't log in"})
	}else{
		if (req.session.role != 'delegate'){
			res.send({err:true,msg:'Wrong role'})
		}else{
			Delegate.findOne({email:email},function (err,result) {
				if (err){
					res.send({err:true})
				}else{
					result = result.toObject()
					res.send(result.interviewer)
				}
			})
		}
	}
})

app.get('/team',function(req,res){
	var session = req.session
	var email = session.email
	if (!email) {
		res.send({err:true,msg:"Haven't log in"})
	}else{
		if (req.session.role != 'delegate'){
			res.send({err:true,msg:'Wrong role'})
		}else{
			Delegate.findOne({email:email},function (err,result) {
				if (err){
					res.send({err:true})
				}else{
					result = result.toObject()
					res.send({
						teamname:result.interviewer,
						leader:result.leader
					})
				}
			})
		}
	}
})

app.post('/chooseSeat',function(req,res){
	//tested
	var session = req.session
	var email = session.email
	var seat = req.body.seat
	if (!email) {
		res.send({err:true,msg:"Haven't log in"})
	}else{
		if (req.session.role != 'delegate'){
			res.send({err:true,msg:'Wrong role'})
		}else{
			Delegate.findOne({email:email},function(err,delegate){
				var conditon = {name:delegate.get('committee')}
				Committee.findOne(conditon,function(err,committee){
					var seats = committee.get('avaliableSeat')
					var list = []
					for (x in seats){
						if (seats[x].indexOf(email)!=-1){
							list.push(x)
						}
					}
					if (list.indexOf(seat)!=-1){
						seats[seat]=[]
						committee.avaliableSeat = seats
						committee.markModified('avaliableSeat')
						committee.save(function(err){
							if (err) {
								res.send({err:true,msg:'Saving error'})
							}else{
								Delegate.findOne({email:email},function(err,result){
									result.seat = seat
									result.save(function(err){
										if (err) {
											res.send({err:true,msg:'Saving error'})
										}else{
											res.send({err:false})
										}
									})
								})
							}
						})
					}else{
						res.send({err:true,msg:"This seat is not avaliable"})
					}
				})
			})
		}
	}
})

//academic
app.get('/delegateInfo',function delegateInfo(req,res){
	//tested
	if (req.session.role == 'delegate'){
		res.send({err:true,msg:'Wrong role'})
	}else{
		Delegate.find({},function(err,delegates){
			delegates.forEach(function(item,index){
				item = item.toObject()
			})
			res.send(delegates)
		})
	}
})

app.post('/arrangeInterviewer',function arrangeInterviewer (req,res) {
	//need delegate's email and interviewer's email
	//tested
	var delegateEmail = req.body.delegateEmail
	var interviewerEmail = req.body.interviewerEmail
	if (req.session.role == 'delegate'){
		res.send({err:true,msg:'Wrong role'})
	}else{
		function find(){
			return new promise(function(resolve,reject){
				Delegate.findOne({email:delegateEmail},function (err,delegate) {
					if (delegate.get('interviewer')){
						res.send({err:true,msg:'Already have interviewer'})
						reject()
					}else{
						delegate.set("interviewer",interviewerEmail)
						delegate.save(function (err) {
							if (err){
								res.send({err:true,msg:'Saving error'})
								reject()
							}
						})
					}
				})
				resolve()
			})
		}
		find()
		.then(function(){
			Academic.findOne({email:interviewerEmail},function (err,academic) {
				if (academic) {
					var array = academic.get('interviewee')
					array.push(delegateEmail)
					academic.interviewee = array
					academic.save(function (err) {
						if (err){
							res.send({err:true,msg:'Saving error'})
						}else{
							res.send({err:false})
						}
					})
				}else{
					res.send({err:true,msg:"interviewer doesn't exist"})
				}
			})
		},function(){})
	}
})

app.post('/changeInterviewer',function changeCommittee (req,res) {
	//tested
	var delegateEmail = req.body.delegateEmail
	var interviewerEmail1
	var interviewerEmail2 = req.body.interviewerEmail2
	if (req.session.role == 'delegate'){
		res.send({err:true,msg:'Wrong role'})
	}else{
		function find(){
			return new promise(function(resolve,reject){
				Delegate.findOne({email:delegateEmail},function (err,delegate) {
					interviewerEmail1 = delegate.get('interviewer')
					delegate.set("interviewer",interviewerEmail2)
					if (interviewerEmail1){
						delegate.save(function (err) {
							if (err){
								console.log(err.message)
								res.send({err:true,msg:'Saving'})
								reject()
							}else{
								resolve()
							}
						})
					}else{
						reject()
					}
				})
			})
		}
		find()
		.then(function(){
			console.log(interviewerEmail1)
			return new promise(function(resolve,reject){
				Academic.findOne({email:interviewerEmail1},function (err,academic) {
					var array = academic.get('interviewee')
					array.splice(array.indexOf(delegateEmail),1)
					academic.interviewee = array
					academic.save(function (err) {
						if (err){
							console.log(err.message)
							res.send({err:true,msg:'Saving error'})
							reject()
						}else{
							resolve()
						}
					})
				})
			})
		},function(){
			return new promise(function(resolve,reject){reject()})
		})
		.then(function(){
			console.log()
			Academic.findOne({email:interviewerEmail2},function (err,academic) {
				if (academic) {
					var array = academic.get('interviewee')
					array.push(delegateEmail)
					academic.interviewee = array
					academic.save(function (err) {
						if (err){
							console.log(err.message)
							res.send({err:true,msg:'Saving error'})
						}else{
							res.send({err:false})
						}
					})
				}else{
					res.send({err:true,msg:"the new interviewer doesn't exist"})
				}
			})
		},function(){})
	}
})

app.post('/dropInterviewer',function dropCommittee (req,res) {
	//tested
	var delegateEmail = req.body.delegateEmail
	if (req.session.role == 'delegate'){
		res.send({err:true,msg:'Wrong role'})
	}else{
		Delegate.findOne({email:delegateEmail},function (err,delegate) {
			delegate.set("interviewer",null)
			delegate.save(function (err) {
				if (err){
					res.send({err:true,msg:'Saving error'})
				}else{
					res.send({err:false})
				}
			})
		})
	}
})

app.post('/arrangeSeat', function arrangeSeat(req,res){
	//tested
	var delegateEmail = req.body.delegateEmail
	var seatList = req.body.seatList
	if (req.session.role == 'delegate'){
		res.send({err:true,msg:'Wrong role'})
	}else{
		Delegate.findOne({email:delegateEmail},function (err,delegate) {
			var committee = delegate.get('committee')
			if (committee) {
				Committee.findOne({name:committee},function(err,result){
					if (result){
						console.log(result.toObject())
						var seats = result.get('avaliableSeat')
						seatList.forEach(function(item,index){
							seats[item].push(delegateEmail)
						})
						result.avaliableSeat = seats
						result.markModified('avaliableSeat')
						result.save(function(err){
							if (err){
								res.send({err:true,msg:'Saving error'})
							}else{
								res.send({err:false})
							}
						})
					}
				})
			}else{
				res.send({err:true,msg:"Don't have a committee yet"})
			}
		})
	}
})

//admin actions
app.post('/newsUpload',upload.any(),function(req,res){
	var session = req.session
	var email = session.email
	var role = session.role
	var array = []
	console.log(req.body.text)
	if (!email) {
		res.send({err:true,msg:"Haven't log in"})
	}else{
		if (req.session.role != 'admin'){
			res.send({err:true,msg:'Wrong role'})
		}else{
			req.files.forEach(function(item,index){
				var newName = email+Date.now()+'('+index+')'
				fs.rename(item.path,'./public/images/'+newName)
				array.push(newName)
			})	
			newNews = new News({
				text: req.body.text,
				email:email,
				role:role,
				images:array
			})
			newNews.save(function(err){
				if (err) {
					res.send({err:true,msg:'Saving error'})
				}else{
					res.send({err:false})
				}
			})
		}
	}
})


app.post('/uploadingFiles',upload.any(),function(err,req){
	var session = req.session                         
	var email = session.email
	var type = req.type
	var role= session.role
	var newName = email+Date.now()
	if (!email) {
		res.send({err:true,msg:"Haven't log in"})
	}else{
		if (req.session.role != 'admin'){
			res.send({err:true,msg:'Wrong role'})
		}else{
			fs.rename(req.files[0].path,'./public/files/'+newName)
			newFile = new File({
				name:newName,
				email:email,
				role:role,
				type:type
			})
			newNews.save(function(err){
				if (err) {
					res.send({err:true,msg:'Saving error'})
				}else{
					res.send({err:false})
				}
			})
		}
	}
})

app.post('/addCommittee',function addCommittee (req,res) {
	//tested
	if (req.session.role != 'admin'){
		res.send({err:true,msg:'Wrong role'})
	}else{
		var name = req.body.name
		var allSeat = req.body.allSeat
		var obj = {}
		var member = req.body.member
		allSeat.forEach(function(item,index){
			obj[item] = []
		})
		var newCommittee = new Committee({
			name:name,
			avaliableSeat:obj
		})
		newCommittee.save(function (err) {
			if (err){
				res.send({err:true,msg:'Saving error'})
			}else{
				member.forEach(function(item,index){
					Delegate.findOne({email:item},function(err,result){
						result.committee = name
						result.save(function(err){
							if (err){
								res.send({err:true,msg:'Saving error'})
							}else{
								res.send({err:false})
							}
						})
					})
				})
			}
		})
	}
})
app.post('/dropCommittee',function dropCommittee(req,res){
	//tested
	if (req.session.role != 'admin'){
		res.send({err:true,msg:'Wrong role'})
	}else{
		var committee = req.body.committee
		Committee.deleteOne({name:committee},function(err){
			if(err){
				console.log(err.message)
				res.send({err:true,msg:'Deleting error'})
			}else{
				Delegate.findOne({committee:committee},function(err,result){
					if (result){
						result.committee = null
						result.seat = null
						result.save(function(err){
							if (err){
								res.send({err:true,msg:'Saving error'})
							}else{
								res.send({err:false})
							}
						})
					}
				})
			}
		})
	}
})
app.post('/committeeAdd',function addSeat(req,res){
	//tested
	if (req.session.role != 'admin'){
		res.send({err:true,msg:'Wrong role'})
	}else{
		var committee = req.body.committee
		var seats = req.body.seats
		Committee.findOne({name:committee},function(err,result){
			obj = result.get('avaliableSeat')
			seats.forEach(function(item,index){
				obj[item] = []
			})
			console.log(obj)
			result.avaliableSeat = obj
			result.markModified('avaliableSeat')
			result.save(function(err){
				if (err) {
					res.send({err:true,msg:'Saving error'})
				}else{
					res.send({err:false})
				}
			})
		})
	}
})
app.post('/committeeDrop',function dropSeat(req,res){
	//tested
	if (req.session.role != 'admin'){
		res.send({err:true,msg:'Wrong role'})
	}else{
		var committee = req.body.committee
		var seats = req.body.seats
		Committee.findOne({name:committee},function(err,result){
			obj = result.get('avaliableSeat')
			seats.forEach(function(item,index){
				delete obj[item]
			})
			result.avaliableSeat = obj
			result.markModified('avaliableSeat')
			result.save(function(err){
				if (err) {
					res.send({err:true,msg:'Saving error'})
				}else{
					res.send({err:false})
				}
			})
		})
	}
})

app.post('/resetPassword',function(req,res){
	//tested
	if (req.session.role != 'admin'){
		res.send({err:true,msg:'Wrong role'})
	}else{
		var email = req.body.email
		var newPassword = uuidV1()
		var newPassword = newPassword.slice(0,newPassword.indexOf('-'))
		Delegate.findOne({email:email},function(err,result){
			result.password = newPassword
			result.save(function(err){
				if (err) {
					res.send({err:true,msg:'Saving error'})
				}else{
					mailTransport.sendMail({
						//send the email
						from:'wangweitian@hotmail.com',
						to:email,
						subject: '[Umunc] Your password has been reset',
						text:'This is your new password: '+newPassword
					},function (err) {
						if (err) {
							console.log(err.message)
							res.send({err:true,message:"Can't send email"})
						}else{
							res.send({err:false})
						}
					})
				}
			})
		})
	}
})

app.post('/uploadingFiles',upload.any(),function(err,req){
	var session = req.session
	var email = session.email
	var type = req.type
	var role= session.role
	var newName = email+Date.now()
	if (!email) {
			res.send({err:true,msg:"Haven't log in"})
	}else{
		if (req.session.role != 'admin'){
			res.send({err:true,msg:'Wrong role'})
		}else{
			fs.rename(req.files[0].path,'./public/files/'+newName)
			newFile = new File({
				name:newName,
				email:email,
				role:role,
				type:type
			})
			newNews.save(function(err){
				if (err) {
					res.send({err:true,msg:'Saving error'})
				}else{
					res.send({err:false})
				}
			})
		}
	}
})

//common actions
app.get('/roomateRequests',function(req,res){
	//tested
	var session = req.session
	var email = session.email
	if (!email) {
		res.send({err:true,msg:"Haven't log in"})
	}else{
		var condition = {email:email}
		findOneInThree(condition,function(result){
			res.send(result.get('roomateRequire'))
		})
	}
})
app.post('/roomateChoose',function(req,res){
	//tested
	var session = req.session
	var email1 = session.email
	var email2 = req.body.email
	if (!email1) {
		res.send({err:true,msg:"Haven't log in"})
	}else{
		var condition1 = {email:email1}
		var condition2 = {email:email2}
		findOneInThree(condition1,function(result){
			if (result.get('roomateRequire').indexOf(email2)!=-1){
				findOneInThree(condition2,function(theOther){
					if (theOther.roomate){
						res.send({err:true,msg:'Out of date'})
						var array = result.get('roomateRequests')
						array.splice(array.indexOf(email2),1)
						theOther.roomateRequests = array
						theOther.save()
					}else{
						result.roomate = email2
						theOther.roomate = email1
						result.save(function(err){
							if (err){
								res.send({err:true,msg:'Saving error'})
							}else{
								theOther.save(function(err){
									if (err) {
										res.send({err:true,msg:'Saving error'})
									}else{
										res.send({err:false})
									}
								})
							}
						})
					}
				})
			}else{
				res.send({err:true,msg:'Not in the request list'})
			}
		})
	}
})
app.post('/roomateRequests',function(req,res){
	//tested
	var session = req.session
	var email1 = session.email
	var email2 = req.body.email
	if (!email1) {
		res.send({err:"Haven't log in"})
	}else{
		var condition1 = {email:email1}
		var condition2 = {email:email2}
		findOneInThree(condition1,function(result){
			var obj1 = result.toObject()
			findOneInThree(condition2,function(theOther){
				if (theOther) {
					var obj2 = theOther.toObject()
					if (obj2.gender==obj1.gender&&obj2.roomate==null&&obj1.roomate==null){
						var array = theOther.get('roomateRequire')
						array.push(email1) 
						theOther.roomateRequire = array
						theOther.save(function(err){
							if (err) {
								res.send({err:true,msg:'Saving error'})
							}else{
								res.send({err:false})
							}
						})
					}else{
						res.send({err:true,msg:'Different gender'})
					}
				}else{
					res.send({err:true,msg:"the email doesn't exist"})
				}
			})
		})
	}
})

app.post('/changePassword',function changePassword(req,res){
	//tested
	var session = req.session
	var email = session.email
	var role = session.role
	var oldPassword = req.body.oldPassword
	var newPassword = req.body.newPassword

	if (!email) {
		res.send({err:true,msg:"Haven't log in"})
	}else{
		switch (role) {
			case 'delegate':
				Delegate.findOne({email:email},function (err,delegate) {
					if (err){
						res.send({err: true})
					}else{
						if (delegate.get('password') == oldPassword){
							delegate.password = newPassword
						}
						delegate.save(function (err) {
							if (err){
								res.send({err:true,msg:'Saving error'})
							}else{
								res.send({err:false})
							}
						})
					}
				})
				break
			case 'academic':
				Academic.findOne({email:email},function (err,academic) {
					if (err){
						res.send({err: true})
					}else{
						if (academic.get('password') == oldPassword){
							academic.password = newPassword
						}
						academic.save(function (err) {
							if (err){
								res.send({err:true,msg:'Saving error'})
							}else{
								res.send({err:false})
							}
						})
					}
				})
				break
			case 'admin':
				Admin.findOne({email:email},function (err,admin) {
					if (err){
						res.send({err: true})
					}else{
						if (admin.get('password') == oldPassword){
							admin.password = newPassword
						}
						admin.save(function (err) {
							if (err){
								res.send({err:true,msg:'Saving error'})
							}else{
								res.send({err:false})
							}
						})
					}
				})
				break
		}
	}
})
app.post('/forgetPassword/1',function(req,res){
	//tested
	var email = req.body.email
	var v_id = uuidV1()
	findOneInThree({email:email},function(result){
		if (result){
	 	req.session.regenerate(function(err){
			if(err){
				console.log('session generation failed')
				res.send({err:true,message:'session generation failed'})
			}else{
				req.session.email = email
				req.session.role = result.role
			}
		})
			result.v_id = v_id
			mailTransport.sendMail({
			//send the email
			from:'wangweitian@hotmail.com',
			to:email,
			subject: '[Umunc] Recover your password',
			text:'Please enter this string:' + v_id,
		},function (err) {
			if (err) {
				console.log(err.message)
				res.send({err:true,msg:"Can't send email"})
			}else{
				result.save(function(err){
					if (err) {
						res.send({err:true,msg:'Saving error'})
					}else{
						res.send({err:false})
					}
				})
			}
		})
		}else{
			res.send({err:true,msg:"This email haven't be registered"})
		}
	})
})
app.post('/forgetPassword/2',function(req,res){
	//tested
	var v_id = req.body.v_id
	var newPassword = req.body.newPassword
	var session = req.session
	var email = session.email
	var role = session.role
	if (!email) {
		res.send({err:true,msg:"Haven't log in"})
	}else{
		switch (role) {
			case 'delegate':
				Delegate.findOne({email:email},function (err,delegate) {
					if (err){
						res.send({err: true})
					}else{
						if (delegate.get('v_id') == v_id){
							delegate.password = newPassword
							delegate.save(function (err) {
								if (err){
									res.send({err:true,msg:'Saving error'})
								}else{
									res.send({err:false})
								}
							})
						}else{
							res.send({err:true,msg:'Wrong v_id'})
						}
					}
				})
				break
			case 'academic':
				Academic.findOne({email:email},function (err,academic) {
					if (err){
						res.send({err: true})
					}else{
						if (academic.get('v_id') == v_id){
							academic.password = newPassword
							academic.save(function (err) {
								if (err){
									res.send({err:true,msg:'Saving error'})
								}else{
									res.send({err:false})
								}
							})
						}else{
							res.send({err:true,msg:'Wrong v_id'})
						}
					}
				})
				break
			case 'admin':
				Admin.findOne({email:email},function (err,admin) {
					if (err){
						res.send({err: true})
					}else{
						if (admin.get('v_id') == v_id){
							admin.password = newPassword
							admin.save(function (err) {
								if (err){
									res.send({err:true,msg:'Saving error'})
								}else{
									res.send({err:false})
								}
							})
						}else{
							res.send({err:true,msg:'Wrong v_id'})
						}
					}
				})
				break
		}
	}
})

app.get('/download/*',function(req,res){
	var session = req.session
	var email = session.email
	var role= session.role
	if (!email) {
		res.send({err:true,msg:"Haven't log in"})
	}else{
		var url = req.url
		var pos = url.search('d/')
		var name = url.slice(pos+2)
		File.findOne({name:name},function(err,result){
			if (result.get('type')=='note'){
				if (role != 'delegate'){
					res.download('public/files/'+name)
				}else{
					res.send({err:true,msg:'wrong role'})
				}
			}else{
				res.download('public/files/'+name)
			}
		})
	}
})
app.get('/files',function(req,res){
	var session = req.session
	var email = session.email
	var role= session.role
	if (!email) {
		res.send({err:true,msg:"Haven't log in"})
	}else{
		if (role != 'delegate'){
			Files.find({},function(err,result){
				if (result){
					result.forEach(function(item,index){
						item = item.toObject()
					})
					res.send(result)
				}else{
					res.send('Nothing')
				}
			})
		}else{
			Files.find({type:'file'},function(err,result){
				if (result){
					result.forEach(function(item,index){
						item = item.toObject()
					})
					res.send(result)
				}else{
					res.send('Nothing')
				}
			})
		}
	}
})

app.get('/news',function(req,res){
	News.find({},function(err,news){
		news.forEach(function(item,index){
			item = item.toObject()
		})
		res.send(news)
	})
})

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
						}else{
							exec(null)
						}
					})
				}
			})
		}
	})
}