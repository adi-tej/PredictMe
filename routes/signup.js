module.exports = function() {
	var express = require('express');
	var body = require('body-parser');
	var assert = require('assert');
	//var mongoDb = require('./cloud/db.js');
	var app = express();

	app.post('/', function(request, response) {
		//var user = new Parse.User();
		var db = req.db;
		var name = request.body.username;
		var pass = request.body.password;
		request.session.regenerate(function(err){
				// will have a new session here
				});
		var sessionId = request.session.id;
		db.collection('users').insert({'username': name , 'password': pass, 'userId' : ObjectId()});
		//user.set("username", name);
		
		
		//user.set("password", pass);
		
		var query_clause = {
			'username': name
	    };
		
		//var query = new Parse.Query(user);
		//query.equalTo("username", name);
		db.collection('users').find(query_clause).toArray(function(err, result){
			if(err){
				response.send("SignUp Error: request : "
											+ request.toString() + " : " + name
											+ pass);
				console.log(err);
			
			}	else{
				console.log("success"+JSON.stringify(result));
				request.session.username= name;
				response.send({
					success: true,
					message: "signedup",
				})	
			}
			/*success : function(results) {
				if (!result.length) {

					user.signUp(null,
							{
								success : function(user) {
									response.send({
										message : "SignedUp",
										user : user
									});
								},
								error : function(error) {
									response.send("SignUp Error: request : "
											+ request.toString() + " : " + name
											+ pass);

								}
							});

				} else {
					response.send({
						message : "The user already exists!"
					});
				}
			},
			error : function(model, error) {
				response.send({
					error : error
				});
			}
		});*/
		db.close();
	});

	return app;
}();
