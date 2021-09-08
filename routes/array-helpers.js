var contains = function(arr, v) {
	for(var i = 0; i < arr.length; i++) {
		if(arr[i] === v) return true;
	}
	return false;
};

var unique = function(inputArr) {
	var arr = [];
	for(var i = 0; i < inputArr.length; i++) {
		if(!contains(arr, inputArr[i])) {
			arr.push(inputArr[i]);
		}
	}
	return arr; 
};

module.exports = {
	contains: contains,
	unique: unique
};

