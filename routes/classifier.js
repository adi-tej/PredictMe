/**
 * 
 */
module.exports = function () {
	var express = require('express');
	var app = express();
	var emailModule = require("../routes/email");
	var userModule = require("../routes/user");
	var $ = require('../routes/jquery.min.js');
	//require('./jquery.csv.js');
	
	app.post('/', function (request, response) {
		
		var userId = request.body.userId;
		var trainingData = Parse.Object.extend('TrainingData');
		var query = new Parse.Query(trainingData);
		query.equalTo('userId', userId);
		query.find({
			success : function (result) {
				var i;
				var found;
				var url;
				for (i = 0; i < result.length; i++) {
					if (result[i].isTrainData && !found) {	// !found is introduced to catch only the first file
						found = true;
						url = result[i].data.url;
					}
				}
				
				/*Parse.Cloud.httpRequest({ url: url }).then(function(file) {
					response.send({success: true, file: file});
				});*/
				
				/*var result;
				var error;
				
				$.ajax({
					url: url,
					type: 'GET',
					success: function (result) {
						response.send({success: true, result: result});
					},
					error: function (error) {
						response.send({success: false, result: error});
					}
				});*/
				response.send({success: true, result: result});
			}, error : function (error) {
				response.send({success: false, result: error});
			}
		});
	});
	
	return app;
}();