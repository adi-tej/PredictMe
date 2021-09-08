var User = require("../routes/user.js");
module.exports = function() {
	var express = require('express');
	var app = express();

app.post('/', function (request, response) {
	var cipher = require('../routes/cipher.js').myCiphering;
	var username;
	var secretKey;
	var appKey;
    username= request.User.username;
	//var userId=request.body.userId;
								
	/*var appSecret = Parse.Object.extend("UserAppSecretKeys");
	var query = new Parse.Query(appSecret);
	query.equalTo("userObjectId",userId);
	query.find({*/
    User.findOne({'username': username},{
		success: function(user) {
			if (user && user.length) {
				appKey = user[0].get("appKey");
				secretKey = user[0].get("secretKey");
				
				appKey = cipher.decrypt(appKey);
				secretKey = cipher.decrypt(secretKey);
				
				response.send({message: "User DecryptedKeys", appKey: appKey, secretKey: secretKey , success:true});
			} 
			else{
				response.send({message: "Keys not generated!" ,success:false});
			}
		}, error: function (error) {
			response.send({message: "Decryption of keys failed!" ,success:false});
		}
		
	});
	
});	
	return app;
}();