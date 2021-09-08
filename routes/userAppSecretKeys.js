var User = require("../routes/user.js");
module.exports = function() {
    //console.log("you are in userappsecretkeys");
    var express = require('express');
    var app = express();

    app.post('/', function (request, response) {
        console.log("you are in userappsecretkeys");
        var cipher = require('../routes/cipher.js').myCiphering;
        var username;
        var secretKey;
        var appKey;
        username = user.username;
        //var userId=request.body.userId;

        //var appSecret = Parse.Object.extend("UserAppSecretKeys");
        //var query = new Parse.Query(appSecret);
        //query.equalTo("userObjectId",userId);
        User.findOne({'username': username},  {
            //query.find({
             success: function(user) {
            console.log("user");
                 if (user && user.length) {
                     appKey = user[0].get("appKey");
                     secretKey = user[0].get("secretKey");

                     appKey = cipher.decrypt(appKey);
                     secretKey = cipher.decrypt(secretKey);


                 }
             }, error: function () {

            }

        });

        if (!(appKey && secretKey)) {

            var d = new Date().getTime();
            var appkey = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });

            var d = new Date().getTime();
            var secretkey = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });

            var encryptedAppkey = cipher.encrypt(appkey);
            var encryptedSecretkey = cipher.encrypt(secretkey);

            User.update({username: 'username'},
                {'appkey': encryptedAppkey, 'secretkey': encryptedSecretkey},  {
                    success: function(User) {
                        var encAppKey = User.appkey;
                        var encSecretKey = User.secretkey;
                        var appKey = cipher.decrypt(encAppKey);
                        var secretKey = cipher.decrypt(encSecretKey);
                        response.send({message: "encrypted successfully", appKey: appKey, secretKey: secretKey, encAppKey: encAppKey, encSecretKey: encSecretKey , success:true});
                    },error: function(error) {
                        response.send({message: "Generation of keys failed!" ,success:false});
                    }

                });

            /*var TestObject = Parse.Object.extend("UserAppSecretKeys");
             var testObject = new TestObject();
             testObject.set("userObjectId",userId );
             testObject.set("appKey", encryptedAppkey);
             testObject.set("secretKey", encryptedSecretkey);
             testObject.save({
             success: function(object) {
             var encAppKey = object.get('appKey');
             var encSecretKey = object.get('secretKey');
             var appKey = cipher.decrypt(encAppKey);
             var secretKey = cipher.decrypt(encSecretKey);
             response.send({message: "encrypted successfully", appKey: appKey, secretKey: secretKey, encAppKey: encAppKey, encSecretKey: encSecretKey , success:true});
             },error: function(error) {
             response.send({message: "Generation of keys failed!" ,success:false});
             }
             });*/
             }
             else{
             response.send({message: "Keys already generated", appKey: appKey, secretKey: secretKey, encAppKey: encAppKey, encSecretKey: encSecretKey , success:true});
             }



            return app;
        });
}