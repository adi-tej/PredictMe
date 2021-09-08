var User = require("../routes/user.js");
var UserDomain = require("../routes/userdomain.js");
var UserEntity = require("../routes/userentity.js");
var userKeysUtil = require("../routes/userKeysUtil");
var cipher = require('../routes/cipher.js').myCiphering;
var emailModule = require("../routes/email");
module.exports = function(app){
	app.get("/", function(req,res){
		res.render("index.html", {message: req.flash("loginMessage")});
	});

	/*app.post('/user/sendmail', function(req, res) {

		//var userId = request.body.userId;


		var userName;
		var appKey;
		var secretKey;
		var userId= res.req.user.id;

		User.findOne({'_id': userId}, function(err, user) {
				if(user){
					return userKeysUtil.getKeys(userId);
						userName = user.userName;
						appKey = user.appkey;
						secretKey = user.secretkey;
						appKey = cipher.decrypt(appKey);
						secretKey = cipher.decrypt(secretKey);

						sendMail(appKey, secretKey, userName, res);
						res.send({success:true});
					}else{
					response.send("ERROR : Appkeys not found for user id : " + userid);
					return;
				}
		});

	});
	app.post('/user/learn-and-predict', function (req, res) {
		var userId = res.req.user.id;
		var domainName = request.body.domainName;
		var entityName = request.body.entityName;
		var targetClass = request.body.targetClass;

		Parse.Cloud.httpRequest({
			url: "https://api.parse.com/1/jobs/learnAndPredict",
			method: "POST",
			headers: {
				'X-Parse-Application-Id': "rn1Mhdyhe14gTyef5LDDp0LsSqyVMbLlS9EheNVg",
				'X-Parse-Master-Key': "19JpVebWgdxUNL7VSfXwUUGCgyvTRoioZfinoy0J",
				'Content-Type': "application/json"
			},
			body: {
				'userId': userId,
				'domainName': domainName,
				'entityName':entityName,
				'targetClass': targetClass
			}/!*,
			 success: function (httpResponse) {
			 console.log('successResponse :: ' + JSON.stringify(httpResponse));
			 },
			 error: function (error) {
			 console.log('errorResponse :: ' + JSON.stringify(error));
			 }*!/
		}).then(function (httpResponse) {
			console.log('successResponse :: ' + JSON.stringify(httpResponse));
			response.send({success: true, message: 'Submitted Request successfuly.'});
		}, function (error) {
			console.log('errorResponse :: ' + JSON.stringify(error));
			response.send({success: false, message: 'An error occurred while submitting the request.'});
		});
	});*/

	app.post('/user/headers', isLoggedIn, function (req, res) {
		var userId = res.req.user.id;
		var username = res.req.user.username;
		var domainName = req.body.domainName;
        //console.log('domain name:'+ req.body.domainName);
		var entityName = req.body.entityName;
        var headers = req.body.headers;
        //console.log(headers);
		User.findOne({_id: userId, 'domains':domainName}, function(err, user){
			if(err){

				user.domains.push(domainName);
                console.log('user data: '+ user );
				user.save(function (err, data) {
                    if (data) {
                        //console.log('user data: ' + data);
                    }
                    else {
                        console.log(err);
                    }

				});
                //var userDomain = UserDomain({'domainName': domainName});
                //userDomain.save();
                UserDomain.findOne({'domainName': domainName}, function(err, userdomain){
                    if(userdomain){
                        UserDomain.findOne({'domainName': domainName, 'entities': entityName}, function(err, userdomain){
                            if(err) {
                                userdomain.entities.push(entityName);
                                userdomain.save(function (err, data) {
                                    if (data) {
                                       // console.log('userDomain data: ' + data);
                                    }
                                    else {
                                        console.log(err);
                                    }
                                });
                            }else{}
                        });


                    }else {
                        var userDomain = UserDomain({'domainName': domainName});
                        userDomain.entities.push(entityName);
                        userDomain.save(function (err, data) {
                            if (data) {
                               // console.log('userDomain data: '+ data );
                            }
                            else {console.log(err);}
                        });
                    }
                });

                //var headerCollection = HeaderCollection({'userName': username,'domainName': domainName, 'entityName': entityName});
                //headerCollection.save();
                UserEntity.findOne({'userName': username,'domainName': domainName, 'entityName': entityName}, function(err, userEntity){
                    if(userEntity){
                        userEntity.headers.push(headers);
                        userEntity.save(function (err, data) {
                            if (data) {
                               // console.log('headerCollection data: '+ data );
                            }
                            else {console.log(err);}
                        });

                    }else {
                        var userEntity = UserEntity({'userName': username,'domainName': domainName, 'entityName': entityName});
                        userEntity.headers.push(headers);
                        userEntity.save(function (err, data) {
                            if (data) {
                               // console.log('headerCollection data: '+ data );
                            }
                            else {console.log(err);}
                        });
                    }
                });


                res.send({success: true, message: 'Submitted Request successfuly.'});


			}else(user)
            {
                console.log(user);
                UserDomain.findOne({'domainName': domainName}, function(err, userdomain){
                    if(userdomain){
                        UserDomain.findOne({'domainName': domainName, 'entities': entityName}, function(err, userdomain){
                            if(err) {
                                userdomain.entities.push(entityName);
                                userdomain.save(function (err, data) {
                                    if (data) {
                                       // console.log('userDomain data: ' + data);
                                    }
                                    else {
                                        console.log(err);
                                    }
                                });
                            }else{}
                        });


                    }else {
                        var userDomain = UserDomain({'domainName': domainName});
                        userDomain.entities.push(entityName);
                        userDomain.save(function (err, data) {
                            if (data) {
                               // console.log('userDomain data: '+ data );
                            }
                            else {console.log(err);}
                        });
                    }
                });

                //var headerCollection = HeaderCollection({'userName': username,'domainName': domainName, 'entityName': entityName});
                //headerCollection.save();
                UserEntity.findOne({'userName': username,'domainName': domainName, 'entityName': entityName}, function(err, userEntity){
                    if(userEntity){
                        userEntity.headers.push(headers);
                        userEntity.save(function (err, data) {
                            if (data) {
                              //  console.log('headerCollection data: '+ data );
                            }
                            else {console.log(err);}
                        });

                    }else {
                        var userEntity = UserEntity({'userName': username,'domainName': domainName, 'entityName': entityName});
                        userEntity.headers.push(headers);
                        userEntity.save(function (err, data) {
                            if (data) {
                               // console.log('headerCollection data: '+ data );
                            }
                            else {console.log(err);}
                        });
                    }
                });
                res.send({success: true, message: 'Submitted Request successfuly.'});
		}
		});

	});
	/*app.get("/:username/:password", function(req,res){
		var username = req.params.signup-username;
		var password = req.params.signup-password;
		
		var newUser = new User();
		newUser.local.username = username;
		newUser.local.password = password;
		
		console.log("username: "+ newUser.local.username+"\npassword: "+ newUser.local.password);
		newUser.save(function(err){
			if(err) {
				console.log("username: "+ newUser.local.username+"\npassword: "+ newUser.local.password);
				throw err;
			}
			else{
				console.log(" on success username: "+ newUser.local.username+"\npassword: "+ newUser.local.password);
			}
		});	
		
		res.send("success!");
		
		User.find(function (err, docs) {
            res.json(docs);
        });
		
	});*/
	
};

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		res.redirect("/");
	}
}
/*
function sendMail(appKey, secretKey, userName, res) {
	var subject = 'Welcome to Scientific Prediction';
	var text = 'Dear Subscriber,' + '\n\nThis is in response to your request for the appKey & secretKey of your account on ' + "`Tricon' PredictMe`.\nIf you haven't made the request, please consider changing your password." + '\n\nYour appKey: ' + appKey + '\nYour secretKey: ' + secretKey + '\n\nThanks,\nhttps://predictme.parseapp.com';

	var emailPromise = emailModule.sendEmail(subject,text,userName,res);
	emailPromise.then(
		function(successResponse) {
			res.send("success : "+successResponse);
		},
		function(errorResponse){
			res.send("error : "+errorResponse);
		}
	);

}*/
