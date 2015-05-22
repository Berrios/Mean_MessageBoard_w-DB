// store user information in a variable
var session_info = [];

var mongoose = require("mongoose");

// store messsages in a variable
var messages = [];

var Users =  mongoose.model('Users');
// var Messages = mongoose.model('Messages');

// function to check if user is already login / session credentials are active
var is_user = function(session_id){
	number_of_users = session_info.length;

	var current_user = false;

	if(number_of_users > 0){
		for(var ctr = 0; ctr < number_of_users; ctr++){
			if(session_info[ctr].id == session_id){
				current_user = session_info[ctr];
				current_user = true;
				break;
			}else{
				current_user = false;	
			}
		}
	}
	console.log("current user", current_user)
	return current_user;
};

module.exports = function Route(app){

/*
 - Session_info.name is not going to return a value.
 - var name = req.session.name
 - for each / info in sessionInfo --> sesssion_info.id and req.session.id --> conversationBoard. 
 - In "/" req.session.name == 
 
*/

//-------------------------------------------------
//******************* Rounting ********************
//-------------------------------------------------

	app.get("/", function(req, res){
		//verify if the users session id match the session_id stored... if yes than render login if no then render register. 
		if(is_user(req.session.id) == true){
				res.render("login", {
					title: "Welcome to the login page!",
					message: "Welcome to the login page!"
				});
			console.log("This is the login page!");
			console.log("The current session_id is: "+req.session.id);
		}else{
			res.render("register", {
				title: "Welcome to the register page!",
				message: "The current session_id is: "+req.session.id
			});
			console.log("This is the register page!");
		}
	});

	app.get("/register", function(req, res){
		if(is_user(req.session.id)){
			res.render("login", {
				title: "Welcome to the login page! ",
				message: "Welcome to the login page!"
			});
		}else{
			res.render("register", {
				title: "Welcome to the register page!",
				message: "Welcome to the register page!"
			});
			console.log("This is the register page!");
		}
	});

	app.post("/register", function (req, res){
		//set the name property of session.  
		req.session.name = req.body.username;
		
		if(req.body.password == req.body.confPsw && req.body.password != ""){

		 	console.log("The current session_id is: "+ req.session.id);

		 	var user = new Users({name: req.body.username, password: req.body.password});
		 		console.log("user is: "+user);

			 	user.save(function(err, data){
			 		if(err)
			 			console.log("There was an error saving to DB "+err);
			 		else{
					 	session_info.push({
							session_id: req.session.id,
							name: req.session.name,
						});
						res.json(req.body);
						res.redirect('/login');
						res.render("login", { 
							title: "Welcome to the login page!",
							message: "You have successfully registered, Please login!"
						});	
			 		}
			 	});
		  	}else{
				console.log("Your passwords did not match!");
				res.render("register",{
					title: "Welcome to the register page!",
					message:"Your passwords do not match!"
			});
		}
	});

	app.get("/login", function(req, res){
		//Render login page

		res.render("login", {
			title: "Welcome to the login page! ",
			message: "Welcome to the login page, Please login!"
		});
	});

	app.post("/login", function(req, res){
		// Check if user.name exists anywhere in session_info array if yes -> change id to new req.session.id --> if not then session_info.push({ name: user.name, id: req.session.id}) <-- this is to check if a session has expired but user hasn't logged out.


		// place all the executable code in here. 
		// session_info.push({ name: user.name, id: req.session.id}) 
		// req.session.name = user.name (res.session.name)
		Users.findOne({name: req.body.username}, function(err, users){

			// users.name = req.body.username; 

				console.log("This is users.name: "+ users.name);
				console.log("This is the req.body.username: "+ req.body.username);
				console.log("This is users.password: "+ users.password);
				console.log("This is the req.body.password: "+ req.body.password);

				if(err){
					console.log("There was an error finding your users: "+ err);
				}else if(users.name == session_info.name){
						req.session.name = users.name;
						session_info.push({
								session_id: req.session.id,
								name: users.name,
							});
						res.json({name: session_info.name});
						//send to conversationBoard
						res.redirect("/messages");
						res.render("messages", {
							title: "Welcome to the Conversation Board page! ",
							message: session_info.name+" Welcome to the Conversation Board you can enter a message below!"
						});
				}else if(users.name == req.body.username && users.password == req.body.password){
					req.session.name = users.name;
					session_info.push({
								session_id: req.session.id,
								name: users.name,
							});
						res.json({name: users.name});
						//send to conversationBoard
						res.redirect("/messages");
						res.render("messages", {
							title: "Welcome to the Conversation Board page! ",
							message: session_info.name+" Welcome to the Conversation Board you can enter a message below!"
					});
				}else if(users.name != req.body.username || users.password != req.body.password){
						//send name or password doesn't match try again 
						res.redirect("/login");
						res.render("login", {
							title: "Welcome to the login page! ",
							message: " Your username and/or Password did not match! Please try again! "
						});
				}
		});
		
		console.log("This is current sessionID : "+ req.session.id);
		console.log("This is name in the session_info array: "+ session_info.name);
		console.log("This is ID in the session_info array: "+ session_info.id);
		// } //end of for in loop
	});

	app.post("/logout", function(req, res){
		res.redirect('/');
	});

	app.get("/messages", function(req, res){
		res.render("messages", {
			title: "Welcome to the messages page!",
			message: "Hello "+req.session.name+", Welcome to the Conversation Board!"
		});
		console.log("This is the messages page! session_info is: "+session_info);
	});

//-------------------------------------------------
//******************* io.Routing ******************
//-------------------------------------------------

	//load the messages on page load
	app.io.route("page_load", function(req){
		req.io.emit("load_messages", {messages: messages});
		//ask the name of the user if it's a new user
		if(is_user(session_info.session_id) === false)
			req.io.emit("get_user_name", {name : session_info.name});
	})
	//this handles the saving of info of new user
	app.io.route("new_user", function(req){
		session_info.push({id: session_info.session_id, name: req.data.name});
		console.log("This is session_info"+ session_info.session_id+" , "+req.session.name);
		console.log("This is req.data.name: "+ req.data.name);
	})
	//saving of messages to messages variable in the server
	app.io.route("new_message", function(req){
		console.log("This is req.data.name: "+ req.data.name);
		console.log("This is req.data.message: "+ req.data.message);
		var user = is_user(session_info.session_id);
		var name = req.session.name;
		if(user){
			messages.push({ name: name, message: req.data.message });
			app.io.broadcast("post_new_message", { 
				new_message: req.data.message, 
				user: name 
			});
		}
	})

};

/*
Note in this assignment we are saving messages into variables in the server. 
But once we are into mongodb, the messages will be saved on a NoSQL database. 
*/