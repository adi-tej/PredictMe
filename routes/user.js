var mongoose = require("mongoose");
var userSchema = mongoose.Schema({
		//userId: String,
		username: String,
		password: String,
		resetPasswordToken: String,
		resetPasswordExpires: Date,
		updated: { type: Date, default: Date.now },
		appKey: String,
		secretKey: String,
		domains: [String], //m.array.push(1); //m.ofString.push("strings!"); //ofString:   [String],
		eventConfigId: String
});

module.exports = mongoose.model("User", userSchema);