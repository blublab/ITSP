var util = require('util');
var redis = require("redis"),
    rclient = redis.createClient();
var crypto = require('crypto');

module.exports = function (app) {

	app.get('/', function (req, res, next) {
		res.redirect('/login');
	}); 

	app.get('/welcome', function (req, res, next) {
		res.render('welcome');
	});

	app.get('/secure', function (req, res, next) {
		rclient.hget(req.session.user, "mail", function (err, obj) {
			req.session.mail = obj;
			res.render('secure', { flash: req.flash(), user: req.session.user, mail: req.session.mail } )
		});
	});

	app.get('/login', function (req, res, next) {
		res.render('login', { flash: req.flash() } );
	});

	app.post('/login', function (req, res, next) {
		
		var username=req.body.username
		var password=req.body.password
		var generated_hash=crypto.createHash('sha256').update(username+password).digest('base64')
		console.log("Login versuch von: "+username)
		console.log(generated_hash);

		rclient.hget(username, "password", function (err, obj) {
   			var db_pw_hash=obj;
			if (generated_hash === db_pw_hash) {
				req.session.authenticated = true;
				req.session.user = username;
				res.redirect('/secure');
			} else {
				req.flash('error', 'Username und Passwort sind nicht korrekt');
				res.redirect('/login');
			}
		});
	});

	app.post('/update_mail', function (req, res, next) {
		console.log(req.body.mail);
		rclient.hset(req.session.user, "mail", req.body.mail, function (err, obj) {
   			res.redirect('/secure');
			req.flash('message', 'Email aktualisiert');
		});
	});

	app.post('/update_password', function (req, res, next) {
		console.log("TEST");
		var generated_hash=crypto.createHash('sha256').update(req.session.user+req.body.password).digest('base64');
		rclient.hset(req.session.user, "password", generated_hash, function (err, obj) {
   			res.redirect('/secure');
			req.flash('message', 'Passwort aktualisiert');
		});
	});

	app.get('/logout', function (req, res, next) {
		delete req.session.authenticated;
		res.redirect('/');
	});

};
