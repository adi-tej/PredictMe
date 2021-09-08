module.exports = {
	getAll: function (className) {
		var promise = new Parse.Promise();
		var result = [];
		
		var processCallback = function(res) {
			result = result.concat(res);
			if (res.length === 1000) {
				process(res[res.length-1].id);
				return;
			}
			// do something about the result, result is all the object you needed.
			promise.resolve({message: "final length " + result.length, records: result});
		}
		
		var process = function(skip) {
			var query = new Parse.Query(className);
			if (skip) {
				//console.log("in if");
				query.greaterThan("objectId", skip);
			}
			query.limit(1000);
			query.ascending("objectId");
			query.find().then(function querySuccess(res) {
				processCallback(res);
			}, function queryFailed(reason) {
				promise.reject({message: "query unsuccessful, length of result " + result.length + ", error:" + reason});
			});
		}
		
		process(false);
		
		return promise;
	},
	
	getTrainData: function (className, targetAttr) {
		var promise = new Parse.Promise();
		var result = [];
		
		var processCallback = function(res) {
			result = result.concat(res);
			if (res.length === 1000) {
				process(res[res.length-1].id);
				return;
			}
			// do something about the result, result is all the object you needed.
			promise.resolve({message: "final length " + result.length, records: result});
		}
		
		var process = function(skip) {
			var query = new Parse.Query(className);
			if (skip) {
				//console.log("in if");
				query.greaterThan("objectId", skip);
			}
			query.limit(1000);
			query.ascending('objectId');
			query.exists(targetAttr);
			console.log('records :: getTrainData :: targetAttr : ' + targetAttr);
			query.find().then(function querySuccess(res) {
				processCallback(res);
			}, function queryFailed(reason) {
				promise.reject({message: "query unsuccessful, length of result " + result.length + ", error:" + reason});
			});
		}
		
		process(false);
		
		return promise;
	},
	
	getTestData: function (className, targetAttr) {
		var promise = new Parse.Promise();
		var result = [];
		
		var processCallback = function(res) {
			result = result.concat(res);
			if (res.length === 1000) {
				process(res[res.length-1].id);
				return;
			}
			// do something about the result, result is all the object you needed.
			promise.resolve({message: "final length " + result.length, records: result});
		}
		
		var process = function(skip) {
			var query = new Parse.Query(className);
			if (skip) {
				//console.log("in if");
				query.greaterThan("objectId", skip);
			}
			query.limit(1000);
			query.ascending('objectId');
			query.doesNotExist(targetAttr);
			console.log('records :: getTestData :: targetAttr : ' + targetAttr);
			query.find().then(function querySuccess(res) {
				processCallback(res);
			}, function queryFailed(reason) {
				promise.reject({message: "query unsuccessful, length of result " + result.length + ", error:" + reason});
			});
		}
		
		process(false);
		
		return promise;
	},
	
	getPredictionEntry: function (className, targetAttr) {
		var promise = new Parse.Promise();
		var result = [];
		
		var processCallback = function(res) {
			result = result.concat(res);
			if (res.length === 1000) {
				process(res[res.length-1].id);
				return;
			}
			// do something about the result, result is all the object you needed.
			promise.resolve({message: "final length " + result.length, records: result});
		}
		
		var process = function(skip) {
			var query = new Parse.Query(className);
			if (skip) {
				//console.log("in if");
				query.greaterThan("objectId", skip);
			}
			query.limit(1000);
			query.ascending('objectId');
			query.doesNotExist(targetAttr);
			query.doesNotExist('predicted' + '_' + targetAttr);
			console.log('records :: getPredictionEntry :: targetAttr : ' + targetAttr);
			query.find().then(function querySuccess(res) {
				processCallback(res);
			}, function queryFailed(reason) {
				promise.reject({message: "query unsuccessful, length of result " + result.length + ", error:" + reason});
			});
		}
		
		process(false);
		
		return promise;
	}
};
