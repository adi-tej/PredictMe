module.exports = function () {
	var express = require('express');
	var app = express();
	
	app.post('/', function (request, response) {
		var userId = request.body.userId;
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
			}/*,
			success: function (httpResponse) {
				console.log('successResponse :: ' + JSON.stringify(httpResponse));
			},
			error: function (error) {
				console.log('errorResponse :: ' + JSON.stringify(error));
			}*/
		}).then(function (httpResponse) {
			console.log('successResponse :: ' + JSON.stringify(httpResponse));
			response.send({success: true, message: 'Submitted Request successfuly.'});
		}, function (error) {
			console.log('errorResponse :: ' + JSON.stringify(error));
			response.send({success: false, message: 'An error occurred while submitting the request.'});
		});
	});
	
	return app;
}();