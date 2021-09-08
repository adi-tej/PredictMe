var User = require("../routes/user.js");
var Promise = require('promise');
module.exports = {

	getKeys : function(userId) {
		var appSecret = Parse.Object.extend("UserAppSecretKeys");
		var query = new Parse.Query(appSecret);
		query.equalTo("userObjectId", userId);
		return query.find();
	},

	authenticateUserKeys : function(appKey,secretKey){		
		var cipher = require('../routes/cipher.js').myCiphering;
		var promise = new Promise();
		
		if(null == appKey){
			promise.reject({error:"appKey missing"});
		}else if(null == secretKey){
			promise.reject({error:"secretKey missing"});
		}		
		
	var	appKey = cipher.encrypt(appKey);
	var	secretKey = cipher.encrypt(secretKey);
		
		
		var appSecret = Parse.Object.extend("UserAppSecretKeys");
		var query = new Parse.Query(appSecret);
		query.equalTo("appKey", appKey);
		query.equalTo("secretKey", secretKey);
		query.find({
			success : function(results) {
				
				if(results && results.length == 1){
					promise.resolve(results[0]);
				}else{
					promise.reject({error:"invalid user"});
				}
				
			},
			error : function(error) {
				promise.reject(error);
			}
		});
		
		return promise;
	}

};