var mongoose = require("mongoose");
var userSchema = mongoose.Schema({
    hypothesisCreation: String,
    duringPrediction: String,
    resetPasswordConfirmation: String,
    usingEmail: String,
    usingText: String,
    shareOnFacebook: String,
    reTweetOnTwitter: String
});

module.exports = mongoose.model("event-config", userSchema);