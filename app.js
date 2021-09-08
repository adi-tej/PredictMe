var express = require('express');
var app = express();
var http = require('http');
var url = require('url');
var router = express.Router();
//var port = process.env.PORT || 8080;
app.set('port', process.env.PORT || 8080);
//var fs=require('fs');
//var MongoClient = require('mongodb').MongoClient; //--
var path = require('path');
var bodyParser = require('body-parser'); // for reading POSTed form data into `req.body`
var session = require('express-session');
//var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var morgan = require('morgan');
//var logger= require('log4js');
//var mongo = require('mongoskin');
var mongoose = require('mongoose');
//var assert = require('assert');
var config = require("./routes/utils.js");
var flash = require('connect-flash');
var parseExpressCookieSession = require('parse-express-cookie-session');
var baseUrl = '/predictme/v1';
// mongoose.connect(config.mongourl,function (error) {
//     if (error) {
//         console.log(error);
//     }
// });
console.log(__dirname);
//var db = mongo.db("mongodb://localhost:27017/test", {native_parser:true});

//app.set('port', port);
app.use(router);
app.use(express.static(__dirname + '/views'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
app.use(bodyParser.json({limit: '50mb'}));

app.use(session({
  
  secret: 'somesecrettokenhere',
	saveUninitialized: true,
	resave: true 
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//app.set('view engine', 'ejs');


require("./routes/passport.js")(passport);
require("./routes/register.js")(app, passport);
require("./routes/sendmail.js")(app);



/*++++++++++++++++++++++++ APP KEY AND SECRET KEY AUTHENTICATION ++++++++++++++++++++++++++*/
app.all(baseUrl+'/*',function(req,res,next){
    console.log("app key and secret key authentication");
    var User = require('./routes/user.js');
    var cipher = require('./routes/cipher.js').myCiphering;

	res.header('Access-Control-Max-Age', 1728000);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, appKey, secretKey");

	var appKey;// = null;
	var secretKey;// = null;
	appKey = req.body.appKey;
	secretKey = req.body.secretKey;
	//console.log("filter :: req.body : " + JSON.stringify(req.body));
	//console.log("filter :: appKey : " + appKey + " :: secretKey : " + secretKey);
    //console.log(req.query);
	if(appKey==undefined||secretKey==undefined)
	{
		appKey = req.get('appKey');
		secretKey = req.get('secretKey');
        if(appKey==undefined||secretKey==undefined) {
            appKey = req.query.appKey;
            secretKey = req.query.secretKey;
        }

	}
	//console.log("filter2 :: appKey : " + appKey + " :: secretKey : " + secretKey);
	if(appKey&&secretKey){
        var	appKey = cipher.encrypt(appKey);
        var	secretKey = cipher.encrypt(secretKey);

        User.findOne({'appKey': appKey, 'secretKey': secretKey}, function (err, user) {
            //console.log(user);
            if(user){
                var userId = user.id;
                res.set("userId" , userId);
                next();
            }else{
                res.send({
                    success: false,
                    message: "Incorrect App Key and Secret Key"
                });
            }
        });

	}else{
        res.send({
            success: false,
            message: "you are not authorized user"
        });
	}
});


app.use(baseUrl, require('./routes/domain.js'));
app.use(baseUrl, require('./routes/dataPush.js'));

/*app.get('/user/!*', function(req,res){
		res.render('user-home2.html');
	});*/
/*

router.use('/predictme/v1/!*', function(req, res, next) {

    console.log(req.originalUrl);
    console.log(req.baseUrl);
    console.log(req.url);
    //res.json({ message: 'hooray! welcome to our api!' });
    req.originalUrl = req.originalUrl.replace("/predictme/v1", "");
    req.baseUrl = req.baseUrl.replace("/predictme/v1", "");
    req.url = req.url.replace(req.url, req.originalUrl);
    console.log(req.originalUrl);
    console.log(req.baseUrl);
    console.log(req.url);
    next();

});
 app.use(router);
*/
app.disable('etag');
app.listen(8080);

//http.createServer(app).listen(8080);
console.log('base url: ' + baseUrl);
console.log("server running on port: "+ app.get('port'));
