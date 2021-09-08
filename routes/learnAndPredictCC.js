module.exports = function() {
	var express = require('express');
	var app = express();
	var recordsModule = require('../routes/records');
	var convnetjs = require('../routes/convnet');
	var arrayHelpers = require('../routes/array-helpers');
	var emailModule = require("../routes/email");
	var userModule = require("../routes/user");
	
	app.get('/', function(request, response) {
		var userId = request.query.userId;
		var domainName = request.query.domainName;
		var entityName = request.query.entityName;
		var targetClass = request.query.targetClass;
		var predictedClass = 'predicted' + '_' + targetClass;
		var className = domainName + '_' + entityName + '_' + userId;
		recordsModule.getTrainData(className, targetClass).then(function querySuccess(result) {
			if (result.records) {
				records = result.records;
				console.log('buildClassifier :: getAll :: ' + className + ' :: records : ' + records.length);
				var i;
				var attributes = records[0].attributes;
				attributes = Object.keys(attributes);
				attributes.splice(attributes.indexOf('createdAt'), 1);
				attributes.splice(attributes.indexOf('updatedAt'), 1);
				if (attributes.indexOf(targetClass) != -1) {
					attributes.splice(attributes.indexOf(targetClass), 1);
				}
				if (attributes.indexOf('predicted' + '_' + targetClass) != -1) {
					attributes.splice(attributes.indexOf('predicted' + '_' + targetClass), 1);
				}
				var trainData = [];
				var trainLabels = [];
				var uniqueLabels = [];
				var recordsLimit = records.length > 150 ? 150 : records.length;	//TODO: limit of 150 is made bcoz cloud function should return in 30sec.. rectify it before pushing..
				for(i = 0; i < recordsLimit; i++){
					var record = [];
					var j;
					for(j = 0; j < attributes.length; j++){
						record.push(records[i].get(attributes[j]));
					}
					trainData.push(new convnetjs.Vol(record));
					if (!arrayHelpers.contains(uniqueLabels, records[i].get(targetClass))) {
						uniqueLabels.push(records[i].get(targetClass));
					}
					trainLabels.push(uniqueLabels.indexOf(records[i].get(targetClass)));
				}
				
				console.log('buildClassifier :: getAll :: uniqueLabels : ' + uniqueLabels.toString() + ' :: trainLabels :: '+ arrayHelpers.unique(trainLabels).toString());
				
				var finishedBatches = function() {

					//var testClassName = domainName + '_Test_' + userId;
					recordsModule.getTestData(className, targetClass).then(function getSuccess (testResult) {
						if (testResult.records) {
							var testRecords = testResult.records;
							var testAttr = testRecords[0].attributes;
							console.log('buildClassifier :: getTestData :: testRecords : ' + testRecords.length);
							testAttr = Object.keys(testAttr);
							testAttr.splice(testAttr.indexOf('createdAt'), 1);
							testAttr.splice(testAttr.indexOf('updatedAt'), 1);
							if (testAttr.indexOf(targetClass) != -1) {
								testAttr.splice(testAttr.indexOf(targetClass), 1);
							}
							if (testAttr.indexOf('predicted' + '_' + targetClass) != -1) {
								testAttr.splice(testAttr.indexOf('predicted' + '_' + targetClass), 1);
							}
							//var testData = [];	//To use it for predict from the neural network
							var predictedLabels = [];
							var rawTestData = [];	//To use it for framing the mail
							//rawTestData.push(testAttr);
							var testRecordsLimit = testRecords.length > 150 ? 150 : testRecords.length;	//TODO: limit of 150 is made bcoz cloud function should return in 30sec.. rectify it before pushing..
							var m;
							for(m = 0; m < testRecordsLimit; m++){
								var record = [];
								var n;
								for(n = 0; n < testAttr.length; n++){
									record.push(testRecords[m].get(testAttr[n]));
								}
								//console.log('buildClassifier :: prediction :: testRecords[m] : ' + testRecords[m] + ' :: testRecords[m] str : ' + JSON.stringify(testRecords[m]));
								var object = testRecords[m];
								var objectPred = magicNet.predict(new convnetjs.Vol(record));
								object.set(predictedClass, uniqueLabels[objectPred]);
								object.save();
								//console.log('buildClassifier :: prediction :: saved testRecords[m] str : ' + JSON.stringify(testRecords[m]));
								predictedLabels.push(uniqueLabels[objectPred]);
								//testData.push(new convnetjs.Vol(record));
								rawTestData.push(record);
								//trainLabels.push(testRecords[m].get(targetClass));
							}
							
							console.log('magicNet JSON: ' + JSON.stringify(magicNet.toJSON()));
							/*for (l = 0; l < testData.length; l++) {
								predictedLabels.push(magicNet.predict(testData[l]));
							}*/
							
							var subject = "Prediction Done !!!";
							var userName;
							var text;
							
							text = 'Prediction results are as below..\n\n';
							text = text + testAttr.toString() + ',predicted_result\n';
							
							for (l = 0; l < predictedLabels.length; l++) {
								text = text + rawTestData[l].toString() + ',' + predictedLabels[l] + '\n\n\n\n';
							}
							
							var html = '<table style="width:100%" border="1"> <tr> <td>Jill</td> <td>Smith</td> <td>50</td> </tr> <tr> <td>Eve</td> <td>Jackson</td> <td>94</td> </tr> </table>'
							
							var html = '<table style="width:100%">';
							html = html + '<tr>'
							for (l = 0; l < testAttr.length; l++) {
								html = html + '<td>' + testAttr[l] + '</td>';
							}
							html = html + '<td><b>' + 'predicted_result' + '</b></td>';
							html = html + '</tr>';
							
							for (l = 0; l < predictedLabels.length; l++) {
								html = html + '<tr>';
								var m;
								for (m = 0; m < rawTestData[l].length; m++) {
									html = html + '<td>' + rawTestData[l][m] + '</td>';
								}
								html = html + '<td><b>' + predictedLabels[l] + '</b></td>';
								html = html + '</tr>';
							}
							html = html + '</table>';
							
							//console.log('prediction result :: \n' + text);
							
							userModule.getUserById(userId).then(function(results) {
								if (results.length) {
									userName = results[0].get("username");
									emailModule.sendEmail(subject,text,userName, null, html).then(
										function (successResponse) {
											response.send({success : true, message: 'Prediction results are sent to ' + userName});
										}, function (errorResponse) {
											response.send({success : true, message: "error : " + errorResponse});
										}
									);
								} else {
									response.send({success: false, message:"ERROR :: user not found with id : " + userId});
								}
							});
						}
					}, function getFailed (testError) {
						response.send(testError.message);
					});
				};
				
				var opts = {}; //options struct
				//opts.train_ratio = 0.8;
				opts.num_epochs = 25;//50
				opts.num_folds = 5;//10
				opts.ensemble_size = 5;//10
				opts.num_candidates = 25;//50
				
				var magicNet = new convnetjs.MagicNet(trainData, trainLabels, opts);
				magicNet.onFinishBatch(finishedBatches);
				var folds = magicNet.folds;
				var trainLength = folds[0].train_ix.length;
				var numEpochs = magicNet.num_epochs;
				var numFolds = folds.length;
				var minIterations = trainLength * numEpochs * numFolds;
				var k;
				for (k = 0; k < minIterations; k++) {
					magicNet.step();
				}
			}
		}, function queryFailed(error) {
			response.send(error.message);
		});
	});
	
	return app;
}();
