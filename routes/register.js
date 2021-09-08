var User = require("../routes/user.js");
var cipher = require('../routes/cipher.js').myCiphering;
var EventConfig = require("../routes/event-config.js");
module.exports = function(app, passport){
    app.get("/", function(req,res){
        res.render("index.html", {message: req.flash("loginMessage")});
    });
    app.get('/home', function (req, res) {

        res.render("home.html", {message: req.flash("loginMessage")});
    });
    app.get('/predict', function (req, res) {

        res.render("prdct-client.html", {message: req.flash("loginMessage")});
    });
    app.get("/user/signup", function(req,res){
        res.render("signup.html", {message: req.flash("signupMessage")});
    });
    app.get("/user/login", function(req,res){
        res.render("login.html", {message: req.flash("signupMessage")});
    });
    app.get("/user/contact-us", isLoggedIn, function(req,res){
        res.render("contactus.html", {message: req.flash("signupMessage")});
    });
    app.get("/user/reset-link/:token", function(req,res){
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('/user/reset-password');
            }
            res.render('reset-link.html');

        });
    });



    app.get("/user/reset-password", function(req,res){
        res.render("reset-password.html", {message: req.flash("signupMessage")});
    });



    app.get("/user/new-password", function(req,res){

    });
    app.get("/user/user-apis", isLoggedIn, function(req,res){
        res.render("user-apis.html", {message: req.flash("loginMessage")});
    });

    app.get("/user/user-keys", isLoggedIn, function(req,res){
        res.render("user-keys.html", {message: req.flash("loginMessage")});
    });
    app.get("/user/user-home", isLoggedIn, function(req,res){
        res.render("user-home.html", {message: req.flash("loginMessage")});
    });
    app.get("/user-home", isLoggedIn, function(req,res){
        res.render("user-home2.html", {message: req.flash("loginMessage")});
    });
    app.get("/user/pricing-model", isLoggedIn, function(req,res){
        res.render("pricing-model.html", {message: req.flash("loginMessage")});
    });
    app.get("/user/email-config", isLoggedIn, function(req,res){
        res.render("email-config.html", {message: req.flash("loginMessage")});
    });
    app.get("/user/about-us", isLoggedIn, function(req,res){
        res.render("about-us.html", {message: req.flash("loginMessage")});
    });

/*++++++++++++++++++++++++ USER SIGN UP ++++++++++++++++++++++++++*/

    app.post("/user/signup",passport.authenticate("local-signup", {
        //successRedirect: "/user/user-apis",
        failureRedirect: "/",
        failureFlash: false

    }), function(req,res){
            if(res.req.flag == 'true'){
                res.send({
                    success: true,
                    message: "User already exists"
                });
            } else {
                var userId = res.req.user.id;
                console.log(userId);
                res.send({
                    success: true,
                    message: "Sign up success",
                    user: userId
                });
            }

    });
    /*function(req, res) {
     passport.authenticate('local-signup', function(err, user) {
     if (err) {
     res.send({
     success: false,
     message: "Signing in failed "
     });
     }
     // Redirect if it fails
     if (!user) {
     res.send({
     success: true,
     message: "User already exists"
     });
     }else{
     var userId = res.req.user.id;
     console.log(userId);
     res.send({
     success: true,
     message: "Signed up",
     user: userId
     });
     }

     });
     }*/
/*++++++++++++++++++++++++ USER LOGIN ++++++++++++++++++++++++++*/
    app.post("/user/login", passport.authenticate("local-login", {

        //successRedirect: "/user/user-apis",
        failureRedirect: "/",
        failureFlash: false

    }), function(req,res){
        var userId = res.req.user.id;
        //console.log(userId);
        res.send({
            success: true,
            message: "loggedIn",
            user: userId
        });

    });

/*++++++++++++++++++++++++ USER LOGOUT ++++++++++++++++++++++++++*/
    app.get("/user/logout", function(req, res) {
        req.logout();
        res.redirect('/');
    });

/*+++++++++++++++++ CREATE OR GET APP KEY AND SECRET KEY ++++++++++++++++++++*/
app.post('/user/userAppSecretKeys', isLoggedIn, function (req, res) {
        console.log("you are in userappsecretkeys");
        var userId;
        var secretKey;
        var appKey;
        var encAppKey;
        var encSecretKey;
        userId = res.req.user.id;
        console.log("userId "+userId);
        User.findOne({_id: userId},function (err, user){
            if (user) {
                encAppKey = user.appKey;
                encSecretKey = user.secretKey;
                appKey = encAppKey;
                secretKey = encSecretKey;
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

                    User.findOneAndUpdate({_id: userId}, {
                        'appKey': encryptedAppkey,
                        'secretKey': encryptedSecretkey
                    }, function (err, updated) {
                        User.findOne({_id: userId}, function (err, user) {
                            if (user) {
                                var encAppKey = user.appKey;
                                var encSecretKey = user.secretKey;
                                appKey = cipher.decrypt(encAppKey);
                                secretKey = cipher.decrypt(encSecretKey);
                                res.send({
                                    message: "encrypted successfully",
                                    appKey: appKey,
                                    secretKey: secretKey,
                                    encAppKey: encAppKey,
                                    encSecretKey: encSecretKey,
                                    success: true
                                });
                            }
                            else {
                                res.send({message: "Generation of keys failed!", success: false});
                            }
                        });
                    });
                }
                else {
                    appKey = cipher.decrypt(appKey);
                    secretKey = cipher.decrypt(secretKey);
                    res.send({
                        message: "Keys already generated",
                        appKey: appKey,
                        secretKey: secretKey,
                        encAppKey: encAppKey,
                        encSecretKey: encSecretKey,
                        success: true
                    });
                }
            }else{
                console.log(err);
            }
        });

    });

/*++++++++++++++++++++++++ APP KEY AND SECRET KEY DECRYPTION ++++++++++++++++++++++++++*/
    app.post('/user/userdecryptkeys', isLoggedIn, function (req, res) {
        var secretKey;
        var appKey;

        var userId= res.req.user.id;
        User.findOne({_id: userId}, function (err, user){
            if (user) {
                appKey = user.appKey;
                secretKey = user.secretKey;

                appKey = cipher.decrypt(appKey);
                secretKey = cipher.decrypt(secretKey);

                res.send({message: "User DecryptedKeys", appKey: appKey, secretKey: secretKey, success: true});

            }else{
                res.send({message: "Decryption of keys failed!", success: false});
                console.log(err);
            }
        });

    });

    /*++++++++++++++++++++++++++++++++++ GET EMAIL CONFIRMATION CONFIG +++++++++++++++++++++++++++++++++*/
    app.get('/user/emailConfiguration', isLoggedIn, function (req, res){
        var userId = res.req.user.id;
        var events = [];
        var media = [];
        User.findOne({_id: userId}, function (err, user){
            if(user){
                EventConfig.findOne({_id: user.eventConfigId}, function (err, eventConfig) {
                    if(eventConfig) {
                        events.push(eventConfig.hypothesisCreation, eventConfig.duringPrediction, eventConfig.resetPasswordConfirmation);
                        media.push(eventConfig.usingEmail, eventConfig.usingText, eventConfig.shareOnFacebook, eventConfig.reTweetOnTwitter);
                        res.send({
                            success: true,
                            events: events,
                            media: media
                        });
                    }else{
                        var eventConfig = new EventConfig({
                            "hypothesisCreation": "true",
                            "duringPrediction" : "true",
                            "resetPasswordConfirmation":"true",
                            "usingEmail":"true",
                            "usingText":"false",
                            "shareOnFacebook":"false",
                            "reTweetOnTwitter":"false"
                        });
                        eventConfig.save();
                        user.eventConfigId = eventConfig.id;
                        user.save();
                        events.push(eventConfig.hypothesisCreation, eventConfig.duringPrediction, eventConfig.resetPasswordConfirmation);
                        media.push(eventConfig.usingEmail, eventConfig.usingText, eventConfig.shareOnFacebook, eventConfig.reTweetOnTwitter);
                        res.send({
                            success: true,
                            events: events,
                            media: media
                        });
                        console.log(err);
                    }
                });
            }else{
                res.send({message: "Get Configuration failed!", success: false});
                console.log(err);
            }

        });
    });

    /*++++++++++++++++++++++++++++++++++ POST EMAIL CONFIRMATION CONFIG +++++++++++++++++++++++++++++++++*/
    app.post('/user/emailConfiguration', isLoggedIn, function (req, res){
        var hypothesisCreation = req.body.hypothesisCreation;
        var duringPrediction = req.body.duringPrediction;
        var resetPasswordConfirmation = req.body.resetPasswordConfirmation;
        var usingEmail = req.body.usingEmail;
        var usingText = req.body.usingText;
        var shareOnFacebook = req.body.shareOnFacebook;
        var reTweetOnTwitter = req.body.reTweetOnTwitter;
        var userId= res.req.user.id;
        console.log("userid:  "+ userId);
        User.findOne({_id: userId}, function (err, user){
            if (user) {
                if(user.eventConfigId){
                    EventConfig.update({_id: user.eventConfigId}, {
                        "hypothesisCreation": hypothesisCreation,
                        "duringPrediction" : duringPrediction,
                        "resetPasswordConfirmation":resetPasswordConfirmation,
                        "usingEmail":usingEmail,
                        "usingText":usingText,
                        "shareOnFacebook":shareOnFacebook,
                        "reTweetOnTwitter":reTweetOnTwitter
                    }, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            //console.log("Successfully added");
                        }
                    });

                    EventConfig.findOne({_id: user.eventConfigId}, function (err, eventConfig) {
                        if (err) {
                            console.log('error');
                        }
                        else {
                            eventConfig.save();

                        }

                    });
                }else{
                    var eventConfig = new EventConfig({
                        "hypothesisCreation": hypothesisCreation,
                        "duringPrediction" : duringPrediction,
                        "resetPasswordConfirmation":resetPasswordConfirmation,
                        "usingEmail":usingEmail,
                        "usingText":usingText,
                        "shareOnFacebook":shareOnFacebook,
                        "reTweetOnTwitter":reTweetOnTwitter
                    });
                    eventConfig.save();
                    user.eventConfigId = eventConfig.id;
                    user.save();
                }

                res.send({
                    message: "Configuration has been updated!",
                    success: true

                });
            }else{
                res.send({message: "Configuration update failed!", success: false});
                console.log(err);
            }

        });

    });
    /*++++++++++++++++++++ OLD PASSWORD VERIFICATION ++++++++++++++++++++*/
app.post('/verifyOldPassword', isLoggedIn, function (req, res){
    var userId = res.req.user.id;
    var oldPassword = req.body.oldPassword;
    oldPassword = cipher.encrypt(oldPassword);
    User.findOne({_id: userId}, function (err, user){
        if (user) {
            if(oldPassword == user.password){
                res.send({
                    success: true
                });
            }else{
                res.send({
                    success: false,
                    message: "Incorrect Old Password"
                });
            }

        }else{
            res.send({
                success: false,
                message: "Something Wrong"
            });
        }
    });
});

/*++++++++++++++++++++ CHANGE PASSWORD ++++++++++++++++++++*/
    app.post('/changePassword', isLoggedIn, function (req, res){
        var userId = res.req.user.id;
        User.findOne({_id: userId}, function (err, user){
            if (user) {

                user.password = cipher.encrypt(req.body.newPassword);
                user.save(function(err){
                    res.send({
                        success: true,
                        message: "Password successfully changed"
                    });
                });

            }else{
                res.send({
                    success: false,
                    message: "Something Wrong"
                });
            }
        });
    });

};

/*+++++++++++++++++ LOGIN AUTHENTICATION FUNCTION +++++++++++++*/
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        res.redirect("/");
    }
}
