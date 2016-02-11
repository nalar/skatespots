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
		type: Sequelize.ARRAY(Sequelize.FLOAT),
		defaultValue: null
	}
});

// Spots
var Spot = sequelize.define('spot', {
	name: Sequelize.TEXT,
	type: Sequelize.TEXT,
	location: {
		type: Sequelize.ARRAY(Sequelize.FLOAT),
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
app.get('/', function(request, response) {
	console.log(request.protocol + '://' + request.get('host') + request.originalUrl);
	// Get current user info from userid stored in session
	var feature = request.params.feature;
	var featureID = request.params.id;

	response.render('main', {
		username: request.session.username,
		userid: request.session.id
	})
});

app.get('/adduser', function(request, response) {
	// Get current user info from userid stored in session

	response.render('adduser')
});

app.get('/addspot', function(request, response) {
	// Get current user info from userid stored in session

	response.render('addspot')
});

app.get('/skatespots.json', function(request, response) {
	sequelize.query(
		"SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' AS TYPE, array_to_json(array_agg(f)) AS features FROM (SELECT 'Feature' AS TYPE , row_to_json((SELECT l FROM (SELECT id, name, type, description, photo, videolink, author) AS l)) AS properties, row_to_json((SELECT l FROM (SELECT 'Point' AS TYPE, array_to_json(location::float[]) as coordinates) AS l)) AS geometry FROM spots AS lg) AS f) AS fc;", {
			type: sequelize.QueryTypes.SELECT
		}
	).then(function(results) {
		response.send(results[0].row_to_json)
	})
});

//////////////////////////////////////////////////////////////////////
// Get spot info (anyone)			GET
app.get('/getspotinfo/:spotid', function(request, response) {
	// Find spot by id in database
	Spot.findById(request.params.spotid).then(function(spotdata) {
		// Return the spot data to be used by jquery
		response.send(JSON.stringify(spotdata))
	})
});

//////////////////////////////////////////////////////////////////////
// Get user info (anyone)			GET
app.get('/getuserinfo/:infoid', function(request, response) {
	// Find user by id in database
	User.findById(request.params.infoid).then(function(userdata) {
		// Return the user data to be used by jquery
		response.send(userdata)
	})
});

//////////////////////////////////////////////////////////////////////
// Spot Edit 				GET
app.get('/editspot/:id', function(request, response) {
	Spot.findById(request.params.id).then(function(spottoedit) {
		response.render('editspot', {
			spottoedit: spottoedit,
			user: request.session.username
		})
	})
});

//////////////////////////////////////////////////////////////////////
// User Edit 						GET
app.get('/edituser/:id', function(request, response) {
	User.findById(request.params.id).then(function(usertoedit) {
		response.render('edituser', {
			usertoedit: usertoedit,
			user: request.session.username
		})
	})
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
		response.redirect('/');
	})
});

//////////////////////////////////////////////////////////////////////
// Log in 		(not logged in)		POST
app.post('/login', function(request, response) {
	User.findAll({
		where: {
			username: request.body.username
		}
	}).then(function(userData) {
		if (userData[0].password === request.body.userpass) {
			request.session.userid = userData[0].id;
			request.session.username = userData[0].username;
			console.log('Succesfully logged in as: ' + userData[0].username);
			response.redirect('/')
		} else {
			console.log('Invalid password')
			response.redirect('/')
		}
	})
});

//////////////////////////////////////////////////////////////////////
// Log out 		(logged in)			POST
app.post('/logout', function(request, response) {
	request.session.destroy();
	response.redirect('/');
});

//////////////////////////////////////////////////////////////////////
// Modify a user (original user)	POST
app.post('/edituser', function(request, response) {
	latlon = request.body.latlon.split(",")
	console.log(request.body);

	User.findById(request.body.userID).then(function(usertoedit) {
		usertoedit.updateAttributes({
			location: latlon,
			username: request.body.userName,
			password: request.body.userPassword,
			email: request.body.userEmail,
			firstname: request.body.userFirstName,
			lastname: request.body.userLastName
		}).then(
			response.redirect('/')
		)
	})
});

//////////////////////////////////////////////////////////////////////
// Delete a user (admin)			POST
app.post('/deleteuser', function(request, response) {
	deleteID = request.params.deleteID;
	User.destroy({
		where: {
			id: deleteID
		}
	}).then(
		response.redirect('/')
	)
});

//////////////////////////////////////////////////////////////////////
// Add a spot 	(registered users)	POST
app.post('/addspot', function(request, response) {
	// Get values from the post	
	location = request.body.latlon.split(",");
	author = request.body.author;

	name = request.body.spotName;
	type = request.body.spotType;
	description = request.body.spotDescription;

	photo = request.body.spotPhoto;
	// Handle photo uploads in a later stage
	// Right now we will do with just a link
	videolink = [request.body.videoLink, request.body.videoTime]

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
		response.redirect('/')
	})
});

//////////////////////////////////////////////////////////////////////
// Modify a spot (original poster)	POST
app.post('/editspot', function(request, response) {
	location = request.body.latlon.split(",")
	videolink = [request.body.videoLink, request.body.videoTime]

	Spot.findById(request.body.spotID).then(function(spottoedit) {
		spottoedit.updateAttributes({
			name: request.body.spotName,
			type: request.body.spotType,
			description: request.body.spotDescription,
			author: request.body.spotAuthor,
			photo: request.body.spotPhoto,
			videolink: videolink,
			location: location
		}).then(
			response.redirect('/')
		)
	})
});

//////////////////////////////////////////////////////////////////////
// Delete a spot (admin)			POST
app.post('/deletespot/:deleteID', function(request, response) {
	// Get spot to delete from post
	deleteID = request.params.deleteID;
	Spot.destroy({
		where: {
			id: deleteID
		}
	}).then(
		response.redirect('/')
	)
});

///////////////////////////////////////////////////////////////
// Start the server after syncing the database
sequelize.sync().then(function() {
	var server = app.listen(3000, function() {
		console.log('Skatespots running on localhost:' + server.address().port);
	});
});