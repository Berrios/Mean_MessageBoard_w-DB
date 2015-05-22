// need to require mongoose to be able to run mongoose.model()
var mongoose = require('mongoose');

//connect to the database
mongoose.connect('mongodb://localhost/Mean_MessageBoard');

var UserSchema = new mongoose.Schema({
 	name: String,
 	password: String,
 	date: { type: Date, default: Date.now }
})

mongoose.model('Users', UserSchema);

// we can add validations using the .path() method.
UserSchema.path('name').required(true, 'User name cannot be blank');
UserSchema.path('password').required(true, 'User password cannot be blank');
