module.exports = {

	sendEmail : function(subject, text, userName, res, html) {

		var promise = new Parse.Promise();

		var Mandrill = require('mandrill');
		Mandrill.initialize('X1qk0m2YpF5KPyMsY6JS1A');

		Mandrill.sendEmail({
			message : {
				text : text,
				html: html,
				subject : subject,
				from_email : "mayank@cloudcode.com",
				from_name : "Tricon' PredictMe",
				to : [ {
					email : userName,
					name : "User"
				} ]
			},
			async : true
		}, {
			success : function(httpResponse) {
				//response.send({message: "Email sent!!!", success: true});
				promise.resolve("Email sent :)");
			},
			error : function(error) {
				//response.send({message: "Uh oh, something went wrong", success: false});
				promise.reject("Email not sent :( ");
			}
		});
		return promise;

	}

};