var mongoose = require("mongoose");
var userSchema = mongoose.Schema({
    domainName: String,
    entities: [] //m.array.push(1); //m.ofString.push("strings!"); //ofString:   [String],
});

module.exports = mongoose.model("UserDomain", userSchema);