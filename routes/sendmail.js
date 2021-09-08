var User = require("../routes/user.js");
var cipher = require('../routes/cipher.js').myCiphering;
var config = require('../routes/utils.js');
var async = require('async');
var crypto = require('crypto');
var EventConfig = require("../routes/event-config.js");
module.exports = function(app){
	app.get("/", function(req,res){
		res.render("index.html", {message: req.flash("loginMessage")});
	});
/*++++++++++++ SEND MAIL POST CALL +++++++++++++++++++++++++*/
	app.post('/user/sendmail', isLoggedIn, function(req, res) {

		//var userId = request.body.userId;
		var userName;
		var appKey = req.body.appKey;
		var secretKey = req.body.secretKey;
		var userId= res.req.user.id;

		User.findOne({_id: userId}, function(err, user) {
				if(user){
						userName = user.username;

						sendMail(appKey, secretKey, userName, res);
					}else{
					response.send("ERROR : Appkeys not found for user id : " + userid);
					return;
				}
		});

	});


/*++++++++++++ SEND MAIL POST CALL RESET PASSWORD +++++++++++++++++++++++++*/
app.post('/user/reset-mail', function(req, res, next) {
    var userName = req.body.username;
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({username: userName}, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/user/reset-password');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user.username);
                });
            });
        },
        function(token, userName) {
            var subject = 'Password Reset';
            var sendgrid  = require('sendgrid')("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");
            html = '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' +
                '<title>Existing User</title>' +
                '</head>' +
                '<body>' +
                '<table style="width: 690px; border-collapse: collapse; margin:0 auto;"> ' +
                '<thead><tr><td style="background: none repeat scroll 0 0 #89cc97; height: 25px;">' +
                '</td></tr><tr><td style="background: none repeat scroll 0 0 #2C2C2C; overflow: hidden;"> ' +
                '<div class="large-6 left" style="float: left; padding: 22px 28px 27px; position: relative; width: 50%;"> ' +
                '<div class="logoConnect"><img src="http://192.168.1.120:8081/img/logo.png"></div> ' +
                '</div> ' +
                '<div class="body_contents" style="float: right; color: rgb(255, 255, 255); margin-top: 2em; margin-right: 3em;">' +
                '<span style="color:#6a982d">'+getDateTime()+'</span>' +
                '</div>' +
                '</td></tr>' +
                ' </thead> ' +
                '<tbody style=" color: #4D4D4D; font-family: arial;font-size: 16px;">' +
                '<tr><td style="padding-top: 2em; font-size: 25px; font-weight: bold;">' +
                '<span>Hi '+userName+',</span></td></tr><tr><td style="padding-top: 2em;"><span>http://' + req.headers.host + '/user/reset-link/' + token + '</br></br>' +
                '</span></td></tr><tr><td style="text-align: center; padding-top: 2em;">' +
                '<a style="color: #6a982d; text-decoration: none;" href="'+config.loginUrl+'">' +
                '<div class="btn body_contents" id="signIn_button" style="background-color:#6a982d; font-size: 16px; padding: 8px 10px 7px;font-weight: bold;border-radius: 3px; display: inline-block; color: #ffffff;">Sign in to Predict Me</div>' +
                '</a></td> </tr> <tr><td style="background-color:#FFF; padding-top: 2em; padding-bottom: 5em;">' +
                '<span>Sincerely,</span><br><span>Predict Me Team</span></td></tr> </tbody>' +
                ' <tfoot style="clear: both; height: 35px;">' +
                ' <tr style="font-size: 13px; font-weight: bold;">' +
                '<td style="background: none repeat scroll 0 0 #2C2C2C; padding-top: 10px;padding-bottom: 10px; color: #6a982d;text-align:center; ">&copy; '+new Date().getFullYear()+' Tricon infotech. All rights reserved. </td>' +
                '</tr> </tfoot></table></body></html>';
            sendgrid.send({
                to: userName,
                from: 'aditeja@triconinfotech.com',
                fromname: 'Tricon PredictMe',
                subject:  subject,
                html:     html
            }, function(err, json) {

                if (err) { return console.error(err);
                }else {
                    res.send({message: json.message, success: true});
                }
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/user/reset-link');
    });
	//var userId = request.body.userId;


    //resetMail(userName, res);

});
/*++++++++++++++ RESET PASSWORD CHANGE MAIL ++++++++++++++++++++++++*/
app.post('/user/reset-link/:token', function(req, res) {
    async.waterfall([
        function(done) {
            console.log("token"+req.params.token);
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    console.log('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }

                user.password = cipher.encrypt(req.body.password);
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save();
                        EventConfig.findOne({_id: user.eventConfigId}, function (err, eventConfig) {
                            if (eventConfig.resetPasswordConfirmation == "true" && eventConfig.usingEmail == "true") {
                                done(err, user.username);
                            }else {
                                res.send({message: "Password has been Reset", success: true});
                            }
                        });
            });
        },
        function(userName) {
            console.log("Mailing");
            var subject = 'Password Changed';
            var sendgrid  = require('sendgrid')("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");
            html = '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' +
                '<title>Existing User</title>' +
                '</head>' +
                '<body>' +
                '<table style="width: 690px; border-collapse: collapse; margin:0 auto;"> ' +
                '<thead><tr><td style="background: none repeat scroll 0 0 #89cc97; height: 25px;">' +
                '</td></tr><tr><td style="background: none repeat scroll 0 0 #2C2C2C; overflow: hidden;"> ' +
                '<div class="large-6 left" style="float: left; padding: 22px 28px 27px; position: relative; width: 50%;"> ' +
                '<div class="logoConnect"><img src="http://192.168.1.120:8081/img/logo.png"></div> ' +
                '</div> ' +
                '<div class="body_contents" style="float: right; color: rgb(255, 255, 255); margin-top: 2em; margin-right: 3em;">' +
                '<span style="color:#6a982d">'+getDateTime()+'</span>' +
                '</div>' +
                '</td></tr>' +
                ' </thead> ' +
                '<tbody style=" color: #4D4D4D; font-family: arial;font-size: 16px;">' +
                '<tr><td style="padding-top: 2em; font-size: 25px; font-weight: bold;">' +
                '<span>Hi '+userName+',</span></td></tr><tr><td style="padding-top: 2em;"><span>Your password has been changed</br></br>' +
                '</span></td></tr><tr><td style="text-align: center; padding-top: 2em;">' +
                '<a style="color: #6a982d; text-decoration: none;" href="'+config.loginUrl+'">' +
                '<div class="btn body_contents" id="signIn_button" style="background-color:#6a982d; font-size: 16px; padding: 8px 10px 7px;font-weight: bold;border-radius: 3px; display: inline-block; color: #ffffff;">Sign in to Predict Me</div>' +
                '</a></td> </tr> <tr><td style="background-color:#FFF; padding-top: 2em; padding-bottom: 5em;">' +
                '<span>Sincerely,</span><br><span>Predict Me Team</span></td></tr> </tbody>' +
                ' <tfoot style="clear: both; height: 35px;">' +
                ' <tr style="font-size: 13px; font-weight: bold;">' +
                '<td style="background: none repeat scroll 0 0 #2C2C2C; padding-top: 10px;padding-bottom: 10px; color: #6a982d;text-align:center; ">&copy; '+new Date().getFullYear()+' Tricon infotech. All rights reserved. </td>' +
                '</tr> </tfoot></table></body></html>';
            sendgrid.send({
                to: userName,
                from: 'aditeja@triconinfotech.com',
                fromname: 'Tricon PredictMe',
                subject:  subject,
                html:     html
            }, function(err, json) {

                if (err) { return console.error(err);
                }else {
                    res.send({message: "Password has been Reset", success: true});
                }
            });
        }
    ], function(err) {
        console.log("post call error");
        if (err) return next(err);
        res.redirect('/');
    });

});


    app.post('/user/signup-mail', function(req, res) {

    //var userId = request.body.userId;
    var userName = req.body.username;

    signupMail(userName, res);

});
};
/*++++++++ LOGIN AUTHENTICATION FUNCTION +++++++++*/
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		res.redirect("/");
	}
}

/*++++++++++++++ SEND MAIL FUNCTION +++++++++++++++*/
function sendMail(appKey, secretKey, userName, res, html) {
	var subject = 'Welcome to Scientific Prediction';
	/*var text = 'Dear Subscriber,' + '\n\nThis is in response to your request for the appKey & secretKey of your account on ' +
        "`Tricon' PredictMe`.\nIf you haven't made the request, please consider changing your password." +
        '\n\nYour appKey: ' + appKey + '\nYour secretKey: ' + secretKey + '\n\nThanks,\nhttps://predictme.parseapp.com';*/
    var sendgrid  = require('sendgrid')("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");
    html = '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' +
        '<title>Existing User</title></head><body><table style="width: 690px; border-collapse: collapse; margin:0 auto;"> <thead><tr><td style="background: none repeat scroll 0 0 #89cc97; height: 25px;">' +
        '</td></tr><tr><td style="background: none repeat scroll 0 0 #2C2C2C; overflow: hidden;"> <div class="large-6 left" style="float: left; padding: 22px 28px 27px; position: relative; width: 50%;"> ' +
        '<div class="logoConnect"><img src="http://192.168.1.120:8081/img/logo.png"></div> </div> <div class="body_contents" style="float: right; color: rgb(255, 255, 255); margin-top: 2em; margin-right: 3em;">' +
        '<span style="color:#6a982d">'+getDateTime()+'</span></div></td></tr> </thead> <tbody style=" color: #4D4D4D; font-family: arial;font-size: 16px;"><tr><td style="padding-top: 2em; font-size: 25px; ' +
        'font-weight: bold;"><span>Hi '+userName+',</span></td></tr><tr><td style="padding-top: 2em;"><span>' +
        'This is in response to your request for the appKey & secretKey of your account on ' +
        "`Tricon' PredictMe`.</br>If you haven't made the request, please consider changing your password." +
        '</br></br>Your appKey: <b>' + appKey + '</b></br>Your secretKey: <b>' + secretKey + '</b></br></br>Thanks,</br>'+config.homeUrl+'' +
        '</span></td></tr><tr><td style="text-align: center; padding-top: 2em;"><a style="color: #6a982d; text-decoration: none;" href="'+config.loginUrl+'"><div class="btn body_contents" id="signIn_button" ' +
        'style="background-color:#6a982d; font-size: 16px; padding: 8px 10px 7px;font-weight: bold;border-radius: 3px; display: inline-block; color: #ffffff;">Sign in to Predict Me</div></a></td> </tr> <tr><td style="background-color:#FFF; padding-top: 2em; padding-bottom: 5em;"><span>Sincerely,' +
        '</span><br><span>Predict Me Team</span></td></tr> </tbody> <tfoot style="clear: both; height: 35px;"> ' +
        '<tr style="font-size: 13px; font-weight: bold;"><td style="background: none repeat scroll 0 0 #2C2C2C; padding-top: 10px;padding-bottom: 10px; color: #6a982d;text-align:center; ">&copy; '+new Date().getFullYear()+'' +
        ' Tricon infotech. All rights reserved. </td></tr> </tfoot></table></body></html>';

    sendgrid.send({
        to: userName,
        from: 'aditeja@triconinfotech.com',
        fromname: 'Tricon PredictMe',
        subject:  subject,
        html:     html
    }, function(err, json) {

        if (err) { return console.error(err);
        }else {
            res.send({message: json.message, success: true});
        }
    });

    }


/*++++++++++++++ SEND MAIL for reset password FUNCTION +++++++++++++++*/
function resetMail(userName, res, html) {
    var subject = 'Welcome to Scientific Prediction';
    /*var text = 'Dear Subscriber,' + '\n\nThis is in response to your request for reset password of your account on ' +
        "`Tricon' PredictMe`.\nFollow the link to reset your password." +
         '\n\nThanks,\nhttps://predictme.parseapp.com';*/
    var sendgrid  = require('sendgrid')("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");
    html = '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' +
        '<title>Existing User</title>' +
        '</head>' +
        '<body>' +
        '<table style="width: 690px; border-collapse: collapse; margin:0 auto;"> ' +
        '<thead><tr><td style="background: none repeat scroll 0 0 #89cc97; height: 25px;">' +
        '</td></tr><tr><td style="background: none repeat scroll 0 0 #2C2C2C; overflow: hidden;"> ' +
        '<div class="large-6 left" style="float: left; padding: 22px 28px 27px; position: relative; width: 50%;"> ' +
        '<div class="logoConnect"><img src="http://192.168.1.120:8081/img/logo.png"></div> ' +
        '</div> ' +
        '<div class="body_contents" style="float: right; color: rgb(255, 255, 255); margin-top: 2em; margin-right: 3em;">' +
        '<span style="color:#6a982d">'+getDateTime()+'</span>' +
        '</div>' +
        '</td></tr>' +
        ' </thead> ' +
        '<tbody style=" color: #4D4D4D; font-family: arial;font-size: 16px;">' +
        '<tr><td style="padding-top: 2em; font-size: 25px; font-weight: bold;">' +
        '<span>Hi '+userName+',</span></td></tr><tr><td style="padding-top: 2em;"><span>' +
        '</span></td></tr><tr><td style="text-align: center; padding-top: 2em;">' +
        '<a style="color: #6a982d; text-decoration: none;" href="'+config.loginUrl+'">' +
        '<div class="btn body_contents" id="signIn_button" style="background-color:#6a982d; font-size: 16px; padding: 8px 10px 7px;font-weight: bold;border-radius: 3px; display: inline-block; color: #ffffff;">Sign in to Predict Me</div>' +
        '</a></td> </tr> <tr><td style="background-color:#FFF; padding-top: 2em; padding-bottom: 5em;">' +
        '<span>Sincerely,</span><br><span>Predict Me Team</span></td></tr> </tbody>' +
        ' <tfoot style="clear: both; height: 35px;">' +
        ' <tr style="font-size: 13px; font-weight: bold;">' +
        '<td style="background: none repeat scroll 0 0 #2C2C2C; padding-top: 10px;padding-bottom: 10px; color: #6a982d;text-align:center; ">&copy; '+new Date().getFullYear()+' Tricon infotech. All rights reserved. </td>' +
        '</tr> </tfoot></table></body></html>';
    sendgrid.send({
        to: userName,
        from: 'aditeja@triconinfotech.com',
        fromname: 'Tricon PredictMe',
        subject:  subject,
        html:     html
    }, function(err, json) {

        if (err) { return console.error(err);
        }else {
            res.send({message: json.message, success: true});
        }
    });

}


/*++++++++++++++ SEND MAIL after SIGN UP FUNCTION +++++++++++++++*/
function signupMail(userName, res, html) {
    var subject = 'Welcome to Scientific Prediction';
    /*var text = 'Dear Subscriber,' + '\n\nWelcome to Predict Me ' +
        ".\nFollow the link to Contact Us." +
        '\n\nThanks,\nhttps://predictme.parseapp.com';*/
    var sendgrid  = require('sendgrid')("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");
    html = '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' +
        '<title>Existing User</title></head><body><table style="width: 690px; border-collapse: collapse; margin:0 auto;"> <thead><tr><td style="background: none repeat scroll 0 0 #89cc97; height: 25px;">' +
        '</td></tr><tr><td style="background: none repeat scroll 0 0 #2C2C2C; overflow: hidden;"> <div class="large-6 left" style="float: left; padding: 22px 28px 27px; position: relative; width: 50%;"> ' +
        '<div class="logoConnect"><img src="http://192.168.1.120:8081/img/logo.png"></div> </div> <div class="body_contents" style="float: right; color: rgb(255, 255, 255); margin-top: 2em; margin-right: 3em;">' +
        '<span style="color:#6a982d">'+getDateTime()+'</span></div></td></tr> </thead> <tbody style=" color: #4D4D4D; font-family: arial;font-size: 16px;"><tr><td style="padding-top: 2em; font-size: 25px;' +
        ' font-weight: bold;"><span>Hi '+userName+',</span></td></tr><tr><td style="padding-top: 2em;"><span>' +
        'Welcome to Predict Me ' +
        ".</br>Follow the link to Contact Us." +
        '</br></br>Thanks,</br>'+config.contactUrl+'' +
        '</span></td></tr><tr><td style="text-align: center; padding-top: 2em;"><a style="color: #6a982d; text-decoration: none;" href="'+config.loginUrl+'">' +
        '<div class="btn body_contents" id="signIn_button" style="background-color:#6a982d; font-size: 16px; padding: 8px 10px 7px;font-weight: bold;border-radius: 3px; display: inline-block; color: #ffffff;">Sign in to Predict Me</div>' +
        '</a></td> </tr> <tr><td style="background-color:#FFF; padding-top: 2em; padding-bottom: 5em;"><span>Sincerely,</span><br><span>Predict Me Team</span></td></tr> </tbody>' +
        ' <tfoot style="clear: both; height: 35px;"> <tr style="font-size: 13px; font-weight: bold;">' +
        '<td style="background: none repeat scroll 0 0 #2C2C2C; padding-top: 10px;padding-bottom: 10px; color: #6a982d;text-align:center; ">&copy; '+new Date().getFullYear()+' Tricon infotech. All rights reserved. </td>' +
        '</tr> </tfoot></table></body></html>';

    sendgrid.send({
        to: userName,
        from: 'aditeja@triconinfotech.com',
        fromname: 'Tricon PredictMe',
        subject:  subject,
        html:     html
    }, function(err, json) {

        if (err) { return console.error(err);
        }else {
            res.send({message: json.message, success: true});
        }
    });

}

function getDateTime() {

    var date = new Date();

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return  day+ ":" + month + ":" + year;

}
