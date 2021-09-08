var crypto = require('crypto');
var cryptoAlgorithm = "aes-128-cbc"; //to change algorithm see http://nodejs.org/api/crypto.html
var cryptoPassword = "hamaraBadaSecretPassphrase";	//TODO: change this encryption-salt ASAP..
//console.log("this is cypher.js");
exports.myCiphering = {
	encrypt:function(text){
		var cipher = crypto.createCipher(cryptoAlgorithm,cryptoPassword);
		var encrypted = cipher.update(text,'utf8','hex')
		encrypted += cipher.final('hex');
		return encrypted;
	},
	decrypt: function(text){
		var decipher = crypto.createDecipher(cryptoAlgorithm,cryptoPassword);
		var decrypted = decipher.update(text,'hex','utf8')
		decrypted += decipher.final('utf8');
		return decrypted;
	}
};