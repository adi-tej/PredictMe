module.exports = function(){
    var express = require('express');
    var app = express();
    var requestModule = require('request');
    var putData = require("../routes/utils.js");
	var cipher = require('../routes/cipher.js').myCiphering;
	

	/*app.use(function(req, res, next) {
		res.header('Access-Control-Max-Age', 1728000);
	  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});*/
/*++++++++++++++ PUT RAW DATA OR HISTORICAL DATA depending on mode ++++++++++++*/
	app.put('/domain/:domainName/entity/:entityName/mode/:mode/data', function(req, res) {
		var userId = res.get('userId');
		var domainName = req.params.domainName;
		var entityName = req.params.entityName;
		var data = req.body.data;
		var mode = req.params.mode;
        console.log("userid "+userId);
        //console.log("data "+JSON.stringify(data));
        var url = putData.arpiturl + '/user/' + userId + '/domain/' + domainName + '/entity/' + entityName + '/mode/' + mode;

				if (mode && domainName && entityName && userId && data) {
/*+++++++++++ PUT DATA for training and prediction depending on mode +++++++++++++*/
                    requestModule.post(
                        url,
                        {
                            json: data
                        },
                        function (error, response, body) {
							if (!error && response.statusCode == 200) {
                                console.log("response : " + response);
								console.log("body : " + body);
                                res.send({
                                    success: true,
									message: "Data is Successfully pushed! Please check your Mail!!"
                                });
							}else{
                                console.log("else response : " + response);
                                console.log("else body : " + body);
                                console.log("error "+error);
								res.send({
									success: false,
									message: "Pushing Test Data failed..Please try again:"
								});
                            }
						}
					);
				}
	});


	/*app.options('/domain/:domainName/entity/:entityName/data', function(req, res) {
		res.send({success: true, message: 'options success'});
	});*/
    return app;
}();
