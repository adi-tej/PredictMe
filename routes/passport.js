var LocalStrategy = require("passport-local").Strategy;

var User = require("../routes/user.js");
var cipher = require('../routes/cipher.js').myCiphering;
module.exports = function(passport){
	//serialise
	passport.serializeUser(function(user, done){
		console.log();
		done(null, user.id);
	});
	
	//deserialise
	passport.deserializeUser(function(id, done){
		User.findById(id, function(err,user){
			done(err, user);
		});
	});

/*++++++++++++++++++++++++ SIGN UP FUNCTION ++++++++++++++++++++++++++*/
	passport.use("local-signup", new LocalStrategy({
		usernameField: "username",
		passwordField: "password",
		passReqToCallback: true
	},
	function(req, username, password, done){
		process.nextTick(function(){
			User.findOne({'username': username}, function(err, user){
				if(err){
					return done(err);

				}
				
				if(user){
					req.flag = 'true';
					return done(null, user);
				}
				else{
					var newUser = new User();
					newUser.username = username;
					password = cipher.encrypt(password);
					newUser.password = password;
					//newUser.userId = xxxxxx; //if you want to use some id other than objectId

					newUser.save(function(err){
						if(err)
							throw err;
						return done(null, newUser);
					});
				}
			});
		});
	}
	));


/*++++++++++++++++++++++++ LOGIN FUNCTION ++++++++++++++++++++++++++*/
	passport.use("local-login", new LocalStrategy({
		usernameField: "username",
		passwordField: "password",
		passReqToCallback: true
	},
	function(req, username, password, done){
		password = cipher.encrypt(password);
		process.nextTick(function(){
			User.findOne({'username': username}, function(err, user){
				if(err){
					return done(err);
				}
				
				if(!user){
					return done(null, false, req.flash("loginMessage", "Invalid username!"));
				}
				if(user.password !== password){

					return done(null, false, req.flash("loginMessage", "Invalid password!"));
				}
				return done(null, user);
			});
		});
	}
	));
	
};