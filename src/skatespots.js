//////////////////////////////////////////////////////////////////////
// Define all server settings
//////////////////////////////////////////////////////////////////////
var express = require('express');
var session = require('express-session');
var sequelize = require('sequelize');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var jade = require('jade');
var pg = require('pg');
var gm = require('gm');


app = express();

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(session({
	secret: 'sk4t3sp0ts',
	resave: true,
	saveUninitialized: false
}));

app.use(express.static(__dirname + '/views'));

app.set('views', './src/views');
app.set('view engine', 'jade');

//////////////////////////////////////////////////////////////////////
// Define database models for sequelize
//////////////////////////////////////////////////////////////////////
var Sequelize = require('sequelize');
var sequelize = new Sequelize('skatespots', process.env.PSQL_USERNAME, process.env.PSQL_PASSWORD, {
	host: 'localhost',
	dialect: 'postgres',
	define: {
		timestamps: false
	}
});

// Users
var User = sequelize.define('user', {
	username: Sequelize.TEXT,
	password: Sequelize.TEXT,
	email: Sequelize.TEXT,
	firstname: Sequelize.TEXT,
	lastname: Sequelize.TEXT,
	location: {
		type: Sequelize.ARRAY(Sequelize.TEXT),
		defaultValue: null
	}
});

// Spots
var Spot = sequelize.define('post', {
	name: Sequelize.TEXT,
	type: Sequelize.TEXT,
	location: {
		type: Sequelize.ARRAY(Sequelize.TEXT),
		defaultValue: null
	},
	photo: Sequelize.TEXT,
	author: Sequelize.INTEGER,
	description: Sequelize.TEXT,
	videolink: {
		type: Sequelize.ARRAY(Sequelize.TEXT),
		defaultValue: null
	}
});


//////////////////////////////////////////////////////////////////////
// Routes
//////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////
// Get Routes
//////////////////////////////////////////////////////////////////////
// Landing page (anyone)			GET
app.get('/:path/:id', function(request, response) {
	// Get current user info from userid stored in session
	// Path can be spot or user
	// id is the spotid or userid
	var pathName = request.params.path;
	var reqID = request.params.id;
	// Render skatespots.jade with:
	// - User info
	// - Spotlist
});

app.get('/singlemarker', function(request, response) {
	// Get current user info from userid stored in session

	// Render skatespots.jade with:
	// - User info
	// - Spotlist
	response.render('singlemarker')
});

app.get('/multimarker', function(request, response) {
	// Get current user info from userid stored in session

	// Render skatespots.jade with:
	// - User info
	// - Spotlist
	response.render('multimarker')
});

app.get('/jsonquery', function(request, response) {
	// Get current user info from userid stored in session
	User.findById(1).then(function(userinfo) {
		console.log(userinfo.dataValues)
		response.render('jsonquery', {
			userinfo: userinfo.dataValues
		})
	})

});

//////////////////////////////////////////////////////////////////////
// Get spot info (anyone)			GET
app.get('/getspotinfo/:spotid', function(request, response) {
	// Find spot by id in database

	// Return the spot data to be used by jquery
});

//////////////////////////////////////////////////////////////////////
// Get user info (anyone)			GET
app.get('/getuserinfo/:infoid', function(request, response) {
	// Find user by id in database

	// Return the user data to be used by jquery
});

//////////////////////////////////////////////////////////////////////
// Spot Management (admin)			GET
app.get('/managespots', function(request, response) {
	// Get the full spot list

	// Render the managespots page with the spot list array/object
});

//////////////////////////////////////////////////////////////////////
// User Management (admin)			GET
app.get('/manageusers', function(request, response) {
	// Get the full user list

	// Render the manageusers page with the user list array/object
});

//////////////////////////////////////////////////////////////////////
// Post Routes
//////////////////////////////////////////////////////////////////////
// Register 	(not logged in)		POST
app.post('/register', function(request, response) {
	// Get values from the post
	latlon = request.body.latlon.split(",")
	username = request.body.userName;
	password = request.body.userPassword;
	email = request.body.userEmail;
	firstname = request.body.userFirstName;
	lastname = request.body.userLastName;

	// Create new user in the database
	User.create({
		location: latlon,
		username: username,
		password: password,
		email: email,
		firstname: firstname,
		lastname: lastname
	}).then(function(newuser) {
		request.session.userid = newuser.dataValues.id;
		request.session.username = newuser.dataValues.name;
		response.redirect('/singlemarker');
	})

});

//////////////////////////////////////////////////////////////////////
// Log in 		(not logged in)		POST
app.post('/login', function(request, response) {
	// Get values from the post

	// Set session to logged in user

	// Redirect user to mainpage
});

//////////////////////////////////////////////////////////////////////
// Modify a user (original user)	POST
app.post('/modifyuser', function(request, response) {
	// Get values from the post

	// Update the user in the database
});

//////////////////////////////////////////////////////////////////////
// Delete a user (admin)			POST
app.post('/deleteuser', function(request, response) {
	// Delete the user

	// Redirect to main
});

//////////////////////////////////////////////////////////////////////
// Add a spot 	(registered users)	POST
app.post('/addspot', function(request, response) {
	// Get values from the post	
	location = request.body.latlon.split(",");
	author = request.body.author;

	name = request.body.spotName;
	type = request.body.spotType;
	description = request.body.userLastName;

	photo = request.body.spotPhoto;
	// Handle photo uploads in a later stage
	// Right now we will do with just a link
	videolink = [request.body.videolink, request.body.videoTime]

	// Create new spot in the database
	Spot.create({
		name: name,
		type: type,
		description: description,
		author: author,
		photo: photo,
		videolink: videolink,
		location: location
	}).then(function(newspot) {
		response.redirect('/spot/' + newspot.dataValues.id)
	})

	// Redirect the user to the new spot
});

//////////////////////////////////////////////////////////////////////
// Modify a spot (original poster)	POST
app.post('/modifyspot', function(request, response) {
	// Get the values from the form

	// Update the spot in the database
});

//////////////////////////////////////////////////////////////////////
// Delete a spot (admin)			POST
app.post('/deletespot', function(request, response) {
	// Get spot to delete from post

	// Delete post

});

///////////////////////////////////////////////////////////////
// Start the server after syncing the database
sequelize.sync().then(function() {
	var server = app.listen(3000, function() {
		console.log('Skatespots running on localhost:' + server.address().port);
	});
});