var mongoose = require("mongoose");
var userSchema = mongoose.Schema({
    userId: String,
    domainName: String,
    entityName: String, //m.array.push(1); //m.ofString.push("strings!"); //ofString:   [String],
    attributeHeaders: [{
         index: Number,
         attributeName: String,
         attributeType: String,
         optionValues: []
    }]
});

module.exports = mongoose.model("UserEntity", userSchema);