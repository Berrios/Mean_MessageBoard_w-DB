var express = require('express.io');
var session = require('express-session');
var bobyParser = require('body-parser');
var app = express().http().io();
var path = require('path');

var mongoose = require("./mongoose.js");

//for handling post data
app.use(express.bodyParser());  

//for session handling
app.use(express.cookieParser())
app.use(express.session({secret: 'monkey'})); 

//express.io will look for your views folder
app.set('view engine', 'ejs'); 

//for handling static files like jquery files, css etc
app.use(express.static(path.join(__dirname, 'public'))); 

app.listen(3000);
	require('./routes/index.js')(app);

console.log("Server running on port 3000");