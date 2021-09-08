module.exports = {
	 authenticateUserKeys : function(req,res){

		var cipher = require('cloud/util/cipher.js').myCiphering;
		var promise = new Parse.Promise();
		
		var	appKey=req.body.appKey;
		var secretKey=req.body.secretKey;
		if(null == appKey){
			promise.reject({error:"appKey missing"});
		}else if(null == secretKey){
			promise.reject({error:"secretKey missing"});
		}		
		
	appKey = cipher.encrypt(appKey);
	secretKey = cipher.encrypt(secretKey);
		
		
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
			
				promise.reject({error:error});
			}
		});
		
		return promise;
	}

};