var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic('views', {'index': ['index.html']})).listen(8080);
/*
var http = require('http');
var fs = require('fs');
var index = fs.readFileSync('./views/user-home2.html');
var login = fs.readFileSync('./views/login.html');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    // change the to 'text/plain' to 'text/html' it will work as your index page
    res.end(index);
}).listen(8080);*/