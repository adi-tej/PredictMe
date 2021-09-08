
require('cloud/app.js');

Parse.Cloud.job('learnAndPredict', function (request, status) {
	var recordsModule = require('cloud/util/records');
	var convnetjs = require('cloud/util/convnet');
	var arrayHelpers = require('cloud/util/array-helpers');
	var emailModule = require("cloud/util/email");
	var userModule = require("cloud/util/user");
	
	var requestBody = JSON.parse(request.body);
	var userId = requestBody.userId;
	var domainName = requestBody.domainName;
	var entityName = requestBody.entityName;
	var targetClass = requestBody.targetClass;
	var predictedClass = 'predicted' + '_' + targetClass;
	
	var className = domainName + '_' + entityName + '_' + userId;
	
	recordsModule.getTrainData(className, targetClass).then(function querySuccess(trainResult) {
		console.log('learnAndPredict :: getAll :: ' + className + ' :: records : ' + trainResult.records.length);
		if (trainResult.records && trainResult.records.length) {
			var trainRecords = trainResult.records;
			console.log('learnAndPredict :: getAll :: ' + className + ' :: records : ' + trainRecords.length);
			var i;
			var attributes = trainRecords[0].attributes;
			attributes = Object.keys(attributes);
			console.log('learnAndPredict :: getTrainData :: attributes : ' + attributes.toString());
			attributes.splice(attributes.indexOf('createdAt'), 1);
			attributes.splice(attributes.indexOf('updatedAt'), 1);
			if (attributes.indexOf(targetClass) != -1) {
				attributes.splice(attributes.indexOf(targetClass), 1);
			}
			if (attributes.indexOf('predicted' + '_' + targetClass) != -1) {
				attributes.splice(attributes.indexOf('predicted' + '_' + targetClass), 1);
			}
			for (i = 0; i < attributes.length; i++) {
				if (attributes[i].indexOf('predicted_') > -1) {
					attributes.splice(i, 1);
				}
			}
			console.log('learnAndPredict :: getTrainData :: attributes spliced : ' + attributes.toString());
			var trainData = [];
			var trainLabels = [];
			var uniqueLabels = [];
			for(i = 0; i < trainRecords.length; i++){
				var record = [];
				var j;
				for(j = 0; j < attributes.length; j++){
					record.push(trainRecords[i].get(attributes[j]));
				}
				trainData.push(new convnetjs.Vol(record));
				if (!arrayHelpers.contains(uniqueLabels, trainRecords[i].get(targetClass))) {
					uniqueLabels.push(trainRecords[i].get(targetClass));
				}
				trainLabels.push(uniqueLabels.indexOf(trainRecords[i].get(targetClass)));
			}
			
			console.log('learnAndPredict :: getAll :: uniqueLabels : ' + uniqueLabels.toString() + ' :: trainLabels :: '+ arrayHelpers.unique(trainLabels).toString());
			
			var finishedBatches = function() {
				console.log('Finished training the Neural Network..');
				recordsModule.getTestData(className, targetClass).then(function getSuccess (testResult) {
					if (testResult.records && testResult.records.length) {
						var testRecords = testResult.records;
						var testAttr = testRecords[0].attributes;
						console.log('learnAndPredict :: getTestData :: testRecords : ' + testRecords.length);
						testAttr = Object.keys(testAttr);
						testAttr.splice(testAttr.indexOf('createdAt'), 1);
						testAttr.splice(testAttr.indexOf('updatedAt'), 1);
						if (testAttr.indexOf(targetClass) != -1) {
							testAttr.splice(testAttr.indexOf(targetClass), 1);
						}
						if (testAttr.indexOf('predicted' + '_' + targetClass) != -1) {
							testAttr.splice(testAttr.indexOf('predicted' + '_' + targetClass), 1);
						}
						for (i = 0; i < testAttr.length; i++) {
							if (testAttr[i].indexOf('predicted_') > -1) {
								testAttr.splice(i, 1);
							}
						}
						console.log('learnAndPredict :: finishedBatches :: testAttr : ' + testAttr.toString());
						
						var predictedLabels = [];
						var rawTestData = [];	//To use it for framing the mail
						var m;
						for(m = 0; m < testRecords.length; m++){
							var record = [];
							var n;
							for(n = 0; n < testAttr.length; n++){
								record.push(testRecords[m].get(testAttr[n]));
							}
							var object = testRecords[m];
							var objectPred = magicNet.predict(new convnetjs.Vol(record));
							object.set(predictedClass, uniqueLabels[objectPred]);
							object.save();
							predictedLabels.push(uniqueLabels[objectPred]);
							rawTestData.push(record);
						}
						
						console.log('learnAndPredict :: magicNet JSON: ' + JSON.stringify(magicNet.toJSON()));
						
						var subject = "Prediction Done !!!";
						var userName;
						var text;
						
						text = 'Prediction results are as below..\n\n';
						text = text + testAttr.toString() + ',predicted_result\n';
						
						for (l = 0; l < predictedLabels.length; l++) {
							text = text + rawTestData[l].toString() + ',' + predictedLabels[l] + '\n\n\n\n';
						}
						
						var html = '<table style="width:100%" border="1">';
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
						
						userModule.getUserById(userId).then(function(results) {
							if (results.length) {
								userName = results[0].get("username");
								emailModule.sendEmail(subject,text,userName, null, html).then(
									function (successResponse) {
										status.success('All is well..');
									}, function (errorResponse) {
										status.error('An error occurred while sending the email.');
									}
								);
							} else {
								status.error('No user found for the userId.');
							}
						});
					}
				}, function getFailed (testError) {
					status.error(testError.message);
				});
			};
			
			var opts = {}; //options struct
			//opts.train_ratio = 0.8;
			//opts.num_epochs = 25;//50
			//opts.num_folds = 5;//10
			//opts.ensemble_size = 5;//10
			//opts.num_candidates = 25;//50
			
			var magicNet = new convnetjs.MagicNet(trainData, trainLabels, opts);
			magicNet.onFinishBatch(finishedBatches);
			var folds = magicNet.folds;
			var trainLength = folds[0].train_ix.length;
			var numEpochs = magicNet.num_epochs;
			var numFolds = folds.length;
			var minIterations = trainLength * numEpochs * numFolds;
			console.log('Started training the Neural Network..');
			var k;
			for (k = 0; k < minIterations; k++) {
				magicNet.step();
				if (k % 10000 == 0) {
					console.log('Still training the Neural Network..');
				}
			}
		}
	}, function queryFailed(error) {
		status.error(error.message);
	});
});

Parse.Cloud.job('learnAndPredictOneEntry', function (request, status) {
	var recordsModule = require('cloud/util/records');
	var convnetjs = require('cloud/util/convnet');
	var arrayHelpers = require('cloud/util/array-helpers');
	var emailModule = require("cloud/util/email");
	var userModule = require("cloud/util/user");
	
	var requestBody = JSON.parse(request.body);
	var userId = requestBody.userId;
	var domainName = requestBody.domainName;
	var entityName = requestBody.entityName;
	var targetClass = requestBody.targetClass;
	var predictedClass = 'predicted' + '_' + targetClass;
	
	var className = domainName + '_' + entityName + '_' + userId;
	
	recordsModule.getTrainData(className, targetClass).then(function querySuccess(trainResult) {
		console.log('learnAndPredict :: getAll :: ' + className + ' :: records : ' + trainResult.records.length);
		if (trainResult.records && trainResult.records.length) {
			var trainRecords = trainResult.records;
			console.log('learnAndPredict :: getAll :: ' + className + ' :: records : ' + trainRecords.length);
			var i;
			var attributes = trainRecords[0].attributes;
			attributes = Object.keys(attributes);
			console.log('learnAndPredict :: getTrainData :: attributes : ' + attributes.toString());
			attributes.splice(attributes.indexOf('createdAt'), 1);
			attributes.splice(attributes.indexOf('updatedAt'), 1);
			if (attributes.indexOf(targetClass) != -1) {
				attributes.splice(attributes.indexOf(targetClass), 1);
			}
			if (attributes.indexOf('predicted' + '_' + targetClass) != -1) {
				attributes.splice(attributes.indexOf('predicted' + '_' + targetClass), 1);
			}
			for (i = 0; i < attributes.length; i++) {
				if (attributes[i].indexOf('predicted_') > -1) {
					attributes.splice(i, 1);
				}
			}
			console.log('learnAndPredict :: getTrainData :: attributes spliced : ' + attributes.toString());
			var trainData = [];
			var trainLabels = [];
			var uniqueLabels = [];
			for(i = 0; i < trainRecords.length; i++){
				var record = [];
				var j;
				for(j = 0; j < attributes.length; j++){
					record.push(trainRecords[i].get(attributes[j]));
				}
				trainData.push(new convnetjs.Vol(record));
				if (!arrayHelpers.contains(uniqueLabels, trainRecords[i].get(targetClass))) {
					uniqueLabels.push(trainRecords[i].get(targetClass));
				}
				trainLabels.push(uniqueLabels.indexOf(trainRecords[i].get(targetClass)));
			}
			
			console.log('learnAndPredict :: getAll :: uniqueLabels : ' + uniqueLabels.toString() + ' :: trainLabels :: '+ arrayHelpers.unique(trainLabels).toString());
			
			var finishedBatches = function() {
				console.log('Finished training the Neural Network..');
				recordsModule.getPredictionEntry(className, targetClass).then(function getSuccess (testResult) {
					if (testResult.records && testResult.records.length) {
						var testRecords = testResult.records;
						var testAttr = testRecords[0].attributes;
						console.log('learnAndPredict :: getTestData :: testRecords : ' + testRecords.length);
						testAttr = Object.keys(testAttr);
						testAttr.splice(testAttr.indexOf('createdAt'), 1);
						testAttr.splice(testAttr.indexOf('updatedAt'), 1);
						if (testAttr.indexOf(targetClass) != -1) {
							testAttr.splice(testAttr.indexOf(targetClass), 1);
						}
						if (testAttr.indexOf('predicted' + '_' + targetClass) != -1) {
							testAttr.splice(testAttr.indexOf('predicted' + '_' + targetClass), 1);
						}
						for (i = 0; i < testAttr.length; i++) {
							if (testAttr[i].indexOf('predicted_') > -1) {
								testAttr.splice(i, 1);
							}
						}
						console.log('learnAndPredict :: finishedBatches :: testAttr : ' + testAttr.toString());
						
						var predictedLabels = [];
						var rawTestData = [];	//To use it for framing the mail
						var m;
						for(m = 0; m < testRecords.length; m++){
							var record = [];
							var n;
							for(n = 0; n < testAttr.length; n++){
								record.push(testRecords[m].get(testAttr[n]));
							}
							var object = testRecords[m];
							var objectPred = magicNet.predict(new convnetjs.Vol(record));
							object.set(predictedClass, uniqueLabels[objectPred]);
							object.save();
							predictedLabels.push(uniqueLabels[objectPred]);
							rawTestData.push(record);
						}
						
						console.log('learnAndPredict :: magicNet JSON: ' + JSON.stringify(magicNet.toJSON()));
						
						var subject = "Prediction Done !!!";
						var userName;
						var text;
						
						text = 'Prediction results are as below..\n\n';
						text = text + testAttr.toString() + ',predicted_result\n';
						
						for (l = 0; l < predictedLabels.length; l++) {
							text = text + rawTestData[l].toString() + ',' + predictedLabels[l] + '\n\n\n\n';
						}
						
						var html = '<table style="width:100%" border="1">';
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
						
						userModule.getUserById(userId).then(function(results) {
							if (results.length) {
								userName = results[0].get("username");
								emailModule.sendEmail(subject,text,userName, null, html).then(
									function (successResponse) {
										status.success('All is well..');
									}, function (errorResponse) {
										status.error('An error occurred while sending the email.');
									}
								);
							} else {
								status.error('No user found for the userId.');
							}
						});
					}
				}, function getFailed (testError) {
					status.error(testError.message);
				});
			};
			
			var opts = {}; //options struct
			//opts.train_ratio = 0.8;
			//opts.num_epochs = 25;//50
			//opts.num_folds = 5;//10
			//opts.ensemble_size = 5;//10
			//opts.num_candidates = 25;//50
			
			var magicNet = new convnetjs.MagicNet(trainData, trainLabels, opts);
			magicNet.onFinishBatch(finishedBatches);
			var folds = magicNet.folds;
			var trainLength = folds[0].train_ix.length;
			var numEpochs = magicNet.num_epochs;
			var numFolds = folds.length;
			var minIterations = trainLength * numEpochs * numFolds;
			console.log('Started training the Neural Network..');
			var k;
			for (k = 0; k < minIterations; k++) {
				magicNet.step();
				if (k % 10000 == 0) {
					console.log('Still training the Neural Network..');
				}
			}
		}
	}, function queryFailed(error) {
		status.error(error.message);
	});
});

Parse.Cloud.afterSave('Experiments', function (request) {
	console.log('####&&&&&****** Experiments :: afterSave :: ' + JSON.stringify(request));
	
	var querystring = require('querystring');
	var body = querystring.stringify({'experiment': request.object});
	
	Parse.Cloud.httpRequest({
		url: "https://api.parse.com/1/jobs/trackExperiments",
		method: "POST",
		headers: {
			'X-Parse-Application-Id': "rn1Mhdyhe14gTyef5LDDp0LsSqyVMbLlS9EheNVg",
			'X-Parse-Master-Key': "19JpVebWgdxUNL7VSfXwUUGCgyvTRoioZfinoy0J",
			'Content-Type': "application/json"
		},
		body: {
      "experiment": request.object
    },
		success: function (httpResponse) {
			console.log('Experiments :: afterSave :: httpRequest :: job :: trackExperiments :: successResponse :: ' + JSON.stringify(httpResponse));
		},
		error: function (error) {
			console.log('Experiments :: afterSave :: httpRequest :: job :: trackExperiments :: errorResponse :: ' + JSON.stringify(error));
		}
	});
	
});

Parse.Cloud.job('trackExperiments', function (request, status) {
	Parse.Cloud.useMasterKey();
	console.log('####&&&&&****** trackExperiments :: job :: request :: ' + JSON.stringify(request));
	
	var requestBody = JSON.parse(request.body);
	var experiment = requestBody.experiment;
	console.log('####&&&&&****** trackExperiments :: job :: requestBody :: ' + JSON.stringify(requestBody));
	console.log('####&&&&&****** trackExperiments :: job :: experiment :: ' + JSON.stringify(experiment));
	
	var TrackExperimentsClass = Parse.Object.extend('TrackExperiments');
	var trackExperimentsObject = new TrackExperimentsClass();
	trackExperimentsObject.set('experName', experiment.experName);
	trackExperimentsObject.set('isInserted', 'Yes');
	trackExperimentsObject.save({success: function (result) {
		status.success("Reached the trackExperiments job successfully & inserted record in TrackExperiments.");
	}, error: function (error) {
		status.error("Uh oh, something went wrong.");
	}});
	/*var objectId = request.body.experiment.objectId;
	var ExperimentClass = Parse.Object.extend('Experiments');
	var experimentQuery = new Parse.Query(ExperimentClass);
	experimentQuery.equalTo('objectId', objectId);
	experimentQuery.find({success: function (result) {
		status.success("Reached the trackExperiments job successfully.");
	}, error: function (error) {
		status.success("Reached the trackExperiments job successfully.");
	}});*/
	//status.success("Reached the trackExperiments job successfully.");
});

Parse.Cloud.job('learnIrisFor4D1T1WKwJc', function (request, status) {
	var recordsModule = require('cloud/util/records');
	var convnetjs = require('cloud/util/convnet');
	var emailModule = require("cloud/util/email");
	var userModule = require("cloud/util/user");
	
	var domainName = 'Iris';
	var userId = '4D1T1WKwJc';
	var className = domainName + '_Train_' + userId;
	recordsModule.getAll(className).then(function querySuccess(result) {
		if (result.records) {
			records = result.records;
			var i;
			var attributes = records[0].attributes;
			attributes = Object.keys(attributes);
			attributes.splice(attributes.indexOf('createdAt'), 1);
			attributes.splice(attributes.indexOf('updatedAt'), 1);
			attributes.splice(attributes.indexOf('class'), 1);
			var trainData = [];
			var trainLabels = [];
			for(i = 0; i < records.length; i++){	//TODO: i < 150 is made for testing.. replace it before pushing..
				var record = [];
				var j;
				for(j = 0; j < attributes.length; j++){
					record.push(records[i].get(attributes[j]));
				}
				trainData.push(new convnetjs.Vol(record));
				trainLabels.push(records[i].get('class'));
			}
			
			var finishedBatches = function() {

				var currK = k;
				var numEpochs = magicNet.num_epochs;
				var folds = magicNet.folds;
				var evaluatedCandidates1 = magicNet.evaluated_candidates;
				
				var l;
				var predictedLabels = [];
				console.log('magicNet JSON: ' + JSON.stringify(magicNet.toJSON()));
				for (l = 0; l < trainData.length; l++) {
					predictedLabels.push(magicNet.predict(trainData[l]));
				}
				
				var evaluatedCandidates2 = magicNet.evaluated_candidates;
				
				/*var candModel;
				var accuracy;
				if (magicNet.evaluated_candidates.length > 0) {
					candModel = magicNet.evaluated_candidates[0];
					accuracy = candModel.accv / candModel.acc.length;
				}*/
				
				var netJson = magicNet.toJSON();
				var netStr = JSON.stringify(netJson);
				
				var subject = "Prediction Done !!!";
				var userName;
				var text = 'Original Set of outputs: ' + trainLabels.toString() + '\n\nPredicted set of outputs: ' + predictedLabels.toString();
				console.log('prediction result :: \n' + text);
				
				userModule.getUserById(userId).then(function(results) {
					if(results.length){
						userName = results[0].get("username");
						emailModule.sendEmail(subject,text,userName).then(
							function(successResponse) {
								//status.success({success : true, message: 'Prediction results are sent to ' + userName, numEpochs: numEpochs, folds: folds, k: currK, trainData: trainData, trainLabels: trainLabels, records: records, evaluatedCandidates1: evaluatedCandidates1, evaluatedCandidates2: evaluatedCandidates2});
								status.success('All is well..');
							}, function(errorResponse){
								//status.success(JSON.stringify({success : true, message: "error : " + errorResponse}));
								status.success('Error in sending email..');
							}
						);
					}else{
						//status.error(JSON.stringify({success: false, message:"ERROR :: user not found with id : " + userId}));
						status.success('Error in finding userId..');
					}
				});
			};
			
			var opts = {}; //options struct
			//opts.train_ratio = 0.8;
			//opts.num_epochs = 25;//4
			//opts.num_folds = 5;//2
			//opts.ensemble_size = 5;
			//opts.num_candidates = 25;
			
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
			//magicNet.finish_batch_callback();
		}
	}, function queryFailed(error) {
		status.error("getAll records query failed");
	});
});

Parse.Cloud.job('learnDiabetesFor4D1T1WKwJc', function (request, status) {
	var recordsModule = require('cloud/util/records');
	var convnetjs = require('cloud/util/convnet');
	var emailModule = require("cloud/util/email");
	var userModule = require("cloud/util/user");
	
	console.log(':: job :: learnDiabetesFor4D1T1WKwJc :: request object : ' + JSON.stringify(request));
	
	var domainName = 'Diabetes';
	var userId = '4D1T1WKwJc';
	var className = domainName + '_Train_' + userId;
	recordsModule.getAll(className).then(function querySuccess(result) {
		if (result.records) {
			records = result.records;
			var i;
			var attributes = records[0].attributes;
			attributes = Object.keys(attributes);
			//remove 'createdAt' 'updatedAt' & 'class' from list of attributes..
			//'class' is the target attribute & other two are default columns for Parse Class..
			attributes.splice(attributes.indexOf('createdAt'), 1);
			attributes.splice(attributes.indexOf('updatedAt'), 1);
			attributes.splice(attributes.indexOf('class'), 1);
			var trainData = [];
			var trainLabels = [];
			for(i = 0; i < records.length; i++){	//TODO: i < 150 is made for testing.. replace it before pushing..
				var record = [];
				var j;
				for(j = 0; j < attributes.length; j++){
					record.push(records[i].get(attributes[j]));
				}
				trainData.push(new convnetjs.Vol(record));
				trainLabels.push(records[i].get('class'));
			}
			
			var finishedBatches = function() {

				var currK = k;
				var numEpochs = magicNet.num_epochs;
				var folds = magicNet.folds;
				var evaluatedCandidates1 = magicNet.evaluated_candidates;
				
				var l;
				var predictedLabels = [];
				console.log('magicNet JSON: ' + JSON.stringify(magicNet.toJSON()));
				for (l = 0; l < trainData.length; l++) {
					predictedLabels.push(magicNet.predict(trainData[l]));
				}
				
				var evaluatedCandidates2 = magicNet.evaluated_candidates;
				
				/*var candModel;
				var accuracy;
				if (magicNet.evaluated_candidates.length > 0) {
					candModel = magicNet.evaluated_candidates[0];
					accuracy = candModel.accv / candModel.acc.length;
				}*/
				
				var netJson = magicNet.toJSON();
				var netStr = JSON.stringify(netJson);
				
				var subject = "Prediction Done !!!";
				var userName;
				var text = 'Original Set of outputs: ' + trainLabels.toString() + '\n\nPredicted set of outputs: ' + predictedLabels.toString();
				console.log('prediction result :: \n' + text);
				var trainsetAccuracy = 0;
				var m;
				for (m = 0; m < trainLabels.length; m++) {
					if (trainLabels[m] == predictedLabels[m]) {
						trainsetAccuracy++;
					}
				}
				trainsetAccuracy = (trainsetAccuracy / trainLabels.length) * 100;
				console.log('trainsetAccuracy :: ' + trainsetAccuracy);
				predictedLabels = predictedLabels.sort();
				console.log('predictedLabels[0] :: ' + predictedLabels[0]);
				console.log('predictedLabels[predictedLabels.length - 1] :: ' + predictedLabels[predictedLabels.length - 1]);
				
				userModule.getUserById(userId).then(function(results) {
					if(results.length){
						userName = results[0].get("username");
						emailModule.sendEmail(subject,text,userName).then(
							function(successResponse) {
								//status.success({success : true, message: 'Prediction results are sent to ' + userName, numEpochs: numEpochs, folds: folds, k: currK, trainData: trainData, trainLabels: trainLabels, records: records, evaluatedCandidates1: evaluatedCandidates1, evaluatedCandidates2: evaluatedCandidates2});
								status.success('All is well..');
							}, function(errorResponse){
								//status.success(JSON.stringify({success : true, message: "error : " + errorResponse}));
								status.success('Error in sending email..');
							}
						);
					}else{
						//status.error(JSON.stringify({success: false, message:"ERROR :: user not found with id : " + userId}));
						status.success('Error in finding userId..');
					}
				});
			};
			
			var opts = {}; //options struct
			//opts.train_ratio = 0.8;
			//opts.num_epochs = 25;//4
			//opts.num_folds = 5;//2
			//opts.ensemble_size = 5;
			//opts.num_candidates = 25;
			
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
			//magicNet.finish_batch_callback();
		}
	}, function queryFailed(error) {
		status.error("getAll records query failed");
	});
});

Parse.Cloud.job('learnIrisTrainFor4D1T1WKwJc', function (request, status) {
	var recordsModule = require('cloud/util/records');
	var convnetjs = require('cloud/util/convnet');
	var arrayHelpers = require('cloud/util/array-helpers');
	var emailModule = require("cloud/util/email");
	var userModule = require("cloud/util/user");
	
	var domainName = 'IrisUpload3';
	var userId = '4D1T1WKwJc';
	var className = domainName + '_Train_' + userId;
	recordsModule.getAll(className).then(function querySuccess(result) {
		if (result.records) {
			records = result.records;
			var i;
			var attributes = records[0].attributes;
			attributes = Object.keys(attributes);
			attributes.splice(attributes.indexOf('createdAt'), 1);
			attributes.splice(attributes.indexOf('updatedAt'), 1);
			attributes.splice(attributes.indexOf('class'), 1);
			var trainData = [];
			var trainLabels = [];
			var uniqueLabels = [];
			for(i = 0; i < records.length; i++){	//TODO: i < 150 is made for testing.. replace it before pushing..
				var record = [];
				var j;
				for(j = 0; j < attributes.length; j++){
					record.push(records[i].get(attributes[j]));
				}
				trainData.push(new convnetjs.Vol(record));
				if (!arrayHelpers.contains(uniqueLabels, records[i].get('class'))) {
					uniqueLabels.push(records[i].get('class'));
				}
				trainLabels.push(uniqueLabels.indexOf(records[i].get('class')));
				//trainLabels.push(records[i].get('class'));
			}
			
			console.log('buildClassifier :: getAll :: unique trainLabels : ' + arrayHelpers.unique(trainLabels).toString());
			
			var finishedBatches = function() {
			
				var testClassName = domainName + '_Test_' + userId;
				recordsModule.getAll(testClassName).then(function getSuccess (testResult) {
					if (testResult.records) {
						var testRecords = testResult.records;
						var testAttr = testRecords[0].attributes;
						testAttr = Object.keys(testAttr);
						testAttr.splice(testAttr.indexOf('createdAt'), 1);
						testAttr.splice(testAttr.indexOf('updatedAt'), 1);
						testAttr.splice(testAttr.indexOf('class'), 1);
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
							object.set('class', uniqueLabels[objectPred]);
							object.save();
							//console.log('buildClassifier :: prediction :: saved testRecords[m] str : ' + JSON.stringify(testRecords[m]));
							predictedLabels.push(uniqueLabels[objectPred]);
							//testData.push(new convnetjs.Vol(record));
							rawTestData.push(record);
							//trainLabels.push(testRecords[m].get('class'));
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
							text = text + rawTestData[l].toString() + ',' + predictedLabels[l] + '\n';
						}
							
						var html = '<table style="width:100%"> <tr> <td>Jill</td> <td>Smith</td> <td>50</td> </tr> <tr> <td>Eve</td> <td>Jackson</td> <td>94</td> </tr> </table>'
						
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
						
						console.log('prediction result :: \n' + predictedLabels.toString());
						
						userModule.getUserById(userId).then(function(results) {
							if (results.length) {
								userName = results[0].get("username");
								emailModule.sendEmail(subject,text,userName, null, html).then(
									function (successResponse) {
										//response.send({success : true, message: 'Prediction results are sent to ' + userName});
										status.success('All is well..');
									}, function (errorResponse) {
										//response.send({success : true, message: "error : " + errorResponse});
										status.error('Error in sending email..');
									}
								);
							} else {
								//response.send({success: false, message:"ERROR :: user not found with id : " + userId});
								status.error('Error in finding userId..');
							}
						});
					}
				}, function getFailed (testError) {
					status.error(testError.message);
				});
			};
			
			var opts = {}; //options struct
			//opts.train_ratio = 0.8;
			//opts.num_epochs = 25;//4
			//opts.num_folds = 5;//2
			//opts.ensemble_size = 5;
			//opts.num_candidates = 25;
			
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
			//magicNet.finish_batch_callback();
		}
	}, function queryFailed(error) {
		status.error("getAll records query failed");
	});
});

Parse.Cloud.define("getDecryptedKeys", function (request, response) {
	var cipher = require('cloud/util/cipher.js').myCiphering;
	
	var secretKey;
	var appKey;
								
	var appSecret = Parse.Object.extend("UserAppSecretKeys");
	var query = new Parse.Query(appSecret);
	query.equalTo("userObjectId",request.params.userId);
	query.find({
		success: function(results) {
			if (results && results.length) {
				appKey = results[0].get("appKey");
				secretKey = results[0].get("secretKey");
				
				appKey = cipher.decrypt(appKey);
				secretKey = cipher.decrypt(secretKey);
				
				response.success({message: 'got the keys successfully', appKey: appKey, secretKey: secretKey, resultLength: results.length});
			} else {
				response.success({message: 'got the keys successfully', appKey: appKey, secretKey: secretKey, resultLength: 0});
			}
		}, error: function () {
			
		}
	});
});

Parse.Cloud.define("encryptAndSaveKeys", function(request, response) {
	var appKey = request.params.appKey;
	//var crypto = require('cloud/md5.js');
	//var encryptedAppkey = crypto.hex_md5(appKey);
	//response.success(encryptedAppkey.toString());
	var crypto = require('crypto');
	var password = "123456";
	
	var encrypt = function encrypt(appKey, password) {
		var key = generateKey(password);
		var initializationVector = generateInitializationVector(password);

		var data = new Buffer(appKey.toString(), 'utf8').toString('binary');

		var cipher = crypto.createCipheriv('aes-256-cbc', key, initializationVector.slice(0,16));
		var encrypted = cipher.update(data, 'utf8', 'hex');
		encrypted += cipher.final('hex');   
		var encoded = new Buffer(encrypted, 'binary').toString('base64');

		return encoded;
	};
 
	var generateKey = function generateKey(password) {
    var cryptographicHash = crypto.createHash('md5');
    cryptographicHash.update(password);
    key = cryptographicHash.digest('hex');
 
    return key;
	};
	
	var generateInitializationVector = function generateInitializationVector(password) {
    var cryptographicHash = crypto.createHash('md5');
    cryptographicHash.update(password + key);
    initializationVector = cryptographicHash.digest('hex');
 
    return initializationVector;
	};
	
	response.success(encrypt);
});



Parse.Cloud.define("createDomainDetails", function (request, response) {	
  var domainName = request.params.domainName;
  var domainAppKey = request.params.domainAppKey;
  var domainSecretKey = request.params.domainSecretKey;
  var userObjectId=request.params.userObjectId;
	
	var Domaindetails = Parse.Object.extend("DomainDetails");
	var domainDetails = new Domaindetails();
	domainDetails.set("userObjectId",userObjectId);
	domainDetails.set("domainName", domainName);
	domainDetails.set("domainAppKey", domainAppKey);
	domainDetails.set("domainSecretKey", domainSecretKey);
	
	domainDetails.save({
											success: function(object) {
											response.success("Domain details saved");
											},error: function(error) {
											response.error("Error..Could not save the domain details");
											}
										});

});