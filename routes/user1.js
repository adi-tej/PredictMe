/*var express = require('express');
var session = require('express-session');
var parseurl = require('parseurl');
var app = express();

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.use(function (req, res, next) {
  var views = req.session.views

  if (!views) {
    views = req.session.views = {}
  }

  // get the url pathname
  var pathname = parseurl(req).pathname

  // count the views
  views[pathname] = (views[pathname] || 0) + 1

  next()
})

app.get('/foo', function (req, res, next) {
  res.send('you viewed this page ' + req.session.views['/foo'] + ' times')
})

app.get('/bar', function (req, res, next) {
  res.send('you viewed this page ' + req.session.views['/bar'] + ' times')
})*/

function logout(req, res) {
  req.session = null;
  return res.json({});
}
module.exports = {

	getUserById : function(userId) {
		var appuser = Parse.Object.extend("User");
		var query = new Parse.Query(appuser);
		query.equalTo("objectId", userId);
		return query.find();
	}

};