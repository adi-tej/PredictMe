module.exports = function () {
	var express = require('express');
	var app = express();
	var cipher = require('../routes/cipher.js').myCiphering;
	
	app.post('/', function (request, response) {
		var userId;// = request.body.userId;
		var domainName = request.body.domainName;
		var entityName = request.body.entityName;
		var data = request.body.data;
		var appKey = request.body.appKey;
		var secretKey = request.body.secretKey;
		
		if (appKey && secretKey) {
			var userAppSecretKeys = Parse.Object.extend('UserAppSecretKeys');
			var query = new Parse.Query(userAppSecretKeys);
			query.equalTo('appKey', cipher.encrypt(appKey));
			query.equalTo('secretKey', cipher.encrypt(secretKey));
			query.find({
					success: function (results) {
						if(results && results.length == 1){
							userId = results[0].get('userObjectId');
							console.log('saveEntityData :: get user :: ' + JSON.stringify(results[0]));
		
							console.log('saveEntityData :: request.body : ' + JSON.stringify(request.body));
							
							console.log('saveEntityData :: userId : ' + userId);
							console.log('saveEntityData :: domainName : ' + domainName);
							console.log('saveEntityData :: entityName : ' + entityName);
							console.log('saveEntityData :: data : ' + data);
							
							if (data && data.length && domainName && entityName && userId) {
								var attributes = Object.keys(data[0]);
								var entityObjects = [];
								var i;
								var Entity = Parse.Object.extend(domainName + '_' + entityName + '_' + userId);
								for (i = 0; i < data.length; i++) {	//i = 1, to ignore header
									var entityObject = new Entity();
									var j;
									for (j = 0; j < attributes.length; j++) {
										entityObject.set(attributes[j], data[i][attributes[j]] ? data[i][attributes[j]] : undefined);
									}
									entityObjects.push(entityObject);
								}
								Parse.Object.saveAll(entityObjects, {
									success: function(objs) {
										response.send({success: true, message: 'Saved all the data.'});
									},
									error: function(error) {
										response.send({success: false, message: 'Error occurred while saving the data.'});
									}
								});
							}
						}
					}, error: function (error) {
						response.send({success: false, message: 'Error occurred while retrieving the user info. Please check appKey & secretKey.'});
					}
				});
		}
	});
	
	return app;
}();