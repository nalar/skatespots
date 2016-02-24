//////////////////////////////////////////////////////////////////////
// Define all server settings
//////////////////////////////////////////////////////////////////////
var express = require('express');
var session = require('express-session');
var fs = require('fs')
var pg = require('pg')
var sequelize = require('sequelize');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var jade = require('jade');
var bcrypt = require('bcrypt');
var multer = require('multer');
var gm = require('gm')

var storage = multer.diskStorage({
	destination: './src/views/spotphotos',
	filename: function(request, file, cb) {
		extension = file.originalname.split('.')[1]
		var newfilename = request.body.spotName + '-' + Date.now();
		cb(null, newfilename + '.' + extension)
	}
})

var formsubmit = multer({
	storage: storage,
	limits: {
		files: 1,
		fileSize: 10000000
	}
});

app = express();

app.use(session({
	secret: 'sk4t3sp0ts',
	resave: true,
	saveUninitialized: false
}));

app.use(express.static(__dirname + '/views'));

app.use(logErrors);

app.set('views', './src/views');
app.set('view engine', 'jade');

function logErrors(error, request, response, next) {
	response.send('error')
	next(err);
}

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
	username: {
		type: Sequelize.TEXT,
		allowNull: false,
		unique: true
	},
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
	response.render('index', {
		username: request.session.username,
		userid: request.session.userid
	})
});

app.get('/userdetails', function(request, response) {
	response.render('userdetails', {
		username: request.session.username,
		userid: request.session.userid
	})
});

app.get('/adduser', function(request, response) {
	response.render('adduser')
});

app.get('/addspot', function(request, response) {
	response.render('addspot', {
		username: request.session.username,
		userid: request.session.userid
	})
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
	Spot.findById(request.params.spotid).then(function(spotdata) {
		response.render('getspotinfo', {
			spotid: spotdata.dataValues.id,
			name: spotdata.dataValues.name,
			type: spotdata.dataValues.type,
			description: spotdata.dataValues.description,
			photo: spotdata.dataValues.photo,
			videolink: spotdata.dataValues.videolink[0],
			videotime: spotdata.dataValues.videolink[1],
			author: spotdata.dataValues.author,
			username: request.session.username,
			userid: request.session.userid
		})
	})
});

//////////////////////////////////////////////////////////////////////
// Get user info (anyone)			GET
app.get('/getuserinfo/:infoid', function(request, response) {
	User.findById(request.params.infoid).then(function(userdata) {
		response.send(userdata)
	})
});

//////////////////////////////////////////////////////////////////////
// Spot Edit 				GET
app.get('/editspot/:id', function(request, response) {

	Spot.findById(request.params.id).then(function(spottoedit) {
		if (spottoedit.author == request.session.userid) {
			response.render('editspot', {
				spottoedit: spottoedit,
				user: request.session.username
			})
		} else {
			response.send('Don\'t try and hack!')
		}
	})
});

//////////////////////////////////////////////////////////////////////
// User Edit 						GET
app.get('/edituser/:id', function(request, response) {
	if (request.params.id == request.session.userid) {
		User.findById(request.params.id).then(function(usertoedit) {
			response.render('edituser', {
				usertoedit: usertoedit,
				user: request.session.username
			})
		})
	} else {
		response.send('Don\'t try and hack!')
	}
});

//////////////////////////////////////////////////////////////////////
// Post Routes
//////////////////////////////////////////////////////////////////////
// Register 	(not logged in)		POST
app.post('/register', bodyParser.urlencoded({
	extended: true
}), function(request, response) {
	bcrypt.hash(request.body.userPassword, 8, function(err, hash) {
		username = request.body.userName;
		email = request.body.userEmail;
		firstname = request.body.userFirstName;
		lastname = request.body.userLastName;
		password = hash;
		// Create new user in the database
		User.create({
			username: username,
			password: password,
			email: email,
			firstname: firstname,
			lastname: lastname
		}).then(function(newuser) {
			request.session.userid = newuser.dataValues.id;
			request.session.username = newuser.dataValues.username;
			response.send('success');
		})
	});
});

//////////////////////////////////////////////////////////////////////
// Log in 		(not logged in)		POST
app.post('/login', bodyParser.urlencoded({
	extended: true
}), function(request, response) {
	User.findOne({
		where: {
			username: request.body.username
		}
	}).then(function(user) {
		if (user != null) {
			bcrypt.compare(user.password, request.body.userpass, function(err, res) {
				request.session.userid = user.id;
				request.session.username = user.username;
				response.send('success')
			});
		} else {
			response.send('Unknown username!')
		}
	});
});

//////////////////////////////////////////////////////////////////////
// Log out 		(logged in)			POST
app.post('/logout', function(request, response) {
	request.session.destroy();
	response.redirect('/');
});

//////////////////////////////////////////////////////////////////////
// Modify a user (original user)	POST
app.post('/edituser', bodyParser.urlencoded({
	extended: true
}), function(request, response) {
	if (request.params.id == request.session.userid) {
		User.findById(request.body.userID).then(function(usertoedit) {
			usertoedit.updateAttributes({
				username: request.body.userName,
				password: request.body.userPassword,
				email: request.body.userEmail,
				firstname: request.body.userFirstName,
				lastname: request.body.userLastName
			}).then(
				response.send('Succesfully updated user!')
			)
		})
	} else {
		response.send('Don\'t try to hack!')
	}
});

//////////////////////////////////////////////////////////////////////
// Delete a user (admin)			POST
app.post('/deleteuser/:deleteID', bodyParser.urlencoded({
	extended: true
}), function(request, response) {
	deleteID = request.params.deleteID;
	if (request.params.id == request.session.userid) {
		User.destroy({
			where: {
				id: deleteID
			}
		}).then(
			response.send('Removed user!')
		)
	} else {
		response.send('Don\'t try to hack!')
	}
});

//////////////////////////////////////////////////////////////////////
// Add a spot 	(registered users)	POST
app.post('/addspot', formsubmit.single('spotPhotoFile'), function(request, response) {
	// Get values from the post	
	console.log(request.file)
	location = request.body.latlon.split(",");
	author = request.session.userid;
	name = request.body.spotName;
	type = request.body.spotType;
	description = request.body.spotDescription;
	photo = '/spotphotos/' + request.file.filename
	videolink = [request.body.videoLink, request.body.videoTime]


	// Create new spot in the database
	if (request.session.userid != undefined) {
		Spot.create({
			name: name,
			type: type,
			description: description,
			author: author,
			photo: photo,
			videolink: videolink,
			location: location
		}).then(function(newspot) {
			gm('./src/views/' + photo).resize(2048, 1536).compress('JPEG').quality(25).write('./src/views/' + photo, function(err) {
				if (err) {
					console.log(err)
				} else {
					spotid = newspot.dataValues.id.toString()
					console.log('done!')
					response.send(spotid)
				}
			})
		})
	} else {
		response.send('Please log in!')
	}
});

//////////////////////////////////////////////////////////////////////
// Modify a spot (original poster)	POST
app.post('/editspot', formsubmit.array(), function(request, response) {
	location = request.body.latlon.split(",")
	videolink = [request.body.videoLink, request.body.videoTime]

	Spot.findById(request.body.spotID).then(function(spottoedit) {
		if (spottoedit.author == request.session.userid) {
			spottoedit.updateAttributes({
				name: request.body.spotName,
				type: request.body.spotType,
				description: request.body.spotDescription,
				author: request.body.spotAuthor,
				photo: request.body.spotPhoto,
				videolink: videolink,
				location: location
			}).then(function(editedspot) {
				response.send(editedspot.dataValues.id.toString())
			})
		} else {
			response.send('Don\'t try and hack!')
		}
	})
});

//////////////////////////////////////////////////////////////////////
// Delete a spot (admin)			POST
app.post('/deletespot/:deleteID', bodyParser.urlencoded({
	extended: true
}), function(request, response) {
	// Get spot to delete from post
	Spot.findById(request.params.deleteID).then(function(spottoedit) {
		if (spottoedit.dataValues.author == request.session.userid) {
			console.log('./src/views' + spottoedit.dataValues.photo)
			fs.unlink('./src/views' + spottoedit.dataValues.photo)
			Spot.destroy({
				where: {
					id: request.params.deleteID
				}
			})
		} else {
			response.send('error')
		}
	}).done(
		response.send('succes')
	)
});

///////////////////////////////////////////////////////////////
// Start the server after syncing the database
sequelize.sync().then(function() {
	var server = app.listen(3010, function() {
		console.log('Skatespots running on localhost:' + server.address().port);
	});
});