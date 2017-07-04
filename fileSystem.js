express = require('express')
fs = require('fs')
app = express()
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

app.post('/fileupload',upload.any(),function(req,res){
	fs.rename(req.files[0].path,'./public/images/'+'1004797070')
})

server = app.listen(8081,function(){
	var host = server.address().address
	var port = server.address().port

	console.log("accessing address: http://%s:%s", host,port)
})