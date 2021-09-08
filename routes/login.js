//var mongoref = require('./db.js');
var User = require("../routes/user.js");
module.exports = function() {
	
	var express = require('express');
	var body = require('body-parser');
	//var store  = new express.session.MemoryStore;
	//var register = require('./cloud/register.js');
	//var mongo = require('mongoskin');
	//var db = mongo.db('mongodb://localhost:27017/test', {native_parser:true});
	
	
	//var db = mongoref();
	//console.log(db);
	//var assert = require('assert');
	//var assert = require('assert');
	//var util = require('./cloud/util.js');
	var app = express();
	
   // next();
	//app.use(session({secret:'somesecrettokenhere'}));
	//var controller = require('controller');
	app.post("/login", passport.authenticate("local-login", {
		successRedirect: "/profile",
		failureRedirect: "/",
		failureFlash: true
	}));
	app.post('/', function(request, response) {
		var db = req.db;
		var name = request.body.username;
		var pass = request.body.password;
		//var theAppLog = logger.getLogger();
		
		//db.collection('users').insert('sessionId': sessionId);
		var query_clause = {
			'username': name
	    };
		
		db.collection('users').find(query_clause).toArray(function(err, result){
			if(err){
				response.send({
					success: false,
					message: "Login failed. Error : " + error,
				})
				console.log(err);
			
			}	else{
				console.log("success"+JSON.stringify(result));
				
				
				
				var sessionId = request.sessionID;
				request.session.username = name;
				response.send({
					success: true,
					message: "loggedIn",
					user: result
				})	
			}
		db.close();
		});
		
		/*db.collection('users').find(query_clause).toArray(function(){
			success : function() {
				response.send({
					success: true,
					message : "loggedIn",
					
				});
			},
			error : function(error) {
				response.send({
					success: false,
					message : "Login failed. Error : " + error
				});
			}
		});*/
	});
return app;
		//++++++++
		/*mongoRef.find('users', query_clause, function (err, result) {
	        if (err) {
	        	throw err;
	        }
	        else {
	        	if (result.data.length == 0) {
	        		var obj = {};
	        		obj.code = 200;
		            obj.data = {"user":"invalid"};
		            util.sendResponse(res,obj);
		            return;
                }
                
                mongoRef.update('users', criteria, fields, res,function(err,result){
                	var obj = {};
                	if(err){
                		obj.err.responseHeaderCode = 500;
        	        	obj.err = err;
                	}else{
                		//securityTokenEmail.send(app.mailOptions);
                		obj.code = 200;
                		//TODO: need to be replaced in production mode
                		//obj.data = {"user":"valid"};
                		obj.data = {"user":"valid", "sec_token":sec_token};
                		//TODO: need to be replaced in production mode
                	}
                	util.sendResponse(res,obj);
                });
               // res.send(JSON.stringify(result.data[0]));
	        }
	  */
		//+++++++++++++++++++++++++++++
		/*collection.find({name: 'name'}).toArray(function (err, result) {
      if (err) {
		  console.log(err);
        
      } else if (post.password === pass) {
		  console.log('Found:', result);
		  request.session.user_id = db.collection.objactId();
        controller.logon(name, pass, {
			success : function(user) {
				controller.setSession(session);
				response.send({
					success: true,
					message : "loggedIn",
					user : user
				});
			},
			error : function(error) {
				response.send({
					success: false,
					message : "Login failed. Error : " + error
				});
			}
		});
      } else {
        console.log('No document(s) found with defined "find" criteria!');
      }
		
	})
	});*/

	
}();
/*app.post('/', function(request, response) {
		var name = request.body.username;
		var pass = request.body.password;
		Parse.User.logIn(name, pass, {
			success : function(user) {
				response.send({
					success: true,
					message : "loggedIn",
					user : user
				});
			},
			error : function(error) {
				response.send({
					success: false,
					message : "Login failed. Error : " + error
				});
			}
		});
	});*/
