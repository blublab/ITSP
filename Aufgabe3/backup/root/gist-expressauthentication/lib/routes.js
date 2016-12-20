var util = require('util');
var redis = require('redis'),
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

		rclient.hget(req.session.user, "valid", function (err, obj) {
			req.session.valid = obj;
		});
		rclient.hget(req.session.user, "mail", function (err, obj) {
			req.session.mail = obj;
			res.render('secure', { flash: req.flash(), user: req.session.user, mail: req.session.mail, valid : req.session.valid } )
		});
	});

	app.get('/login', function (req, res, next) {
		res.render('login', { flash: req.flash() } );
	});

	app.post('/login', function (req, res, next) {
		
		var username=req.body.username;
		var password=req.body.password;
		var generated_hash=crypto.createHash('sha256').update(username+password).digest('base64');
		console.log("Login versuch von: "+username);
		console.log(generated_hash);

		rclient.hget(username, "password", function (err, obj) {
   			var db_pw_hash=obj;
			if (generated_hash === db_pw_hash) {
				rclient.hget(username, "valid", function (err, obj) {
					if (obj === "True") {
						req.session.authenticated = true;
						req.session.user = username;
						res.redirect('/secure');
					} else {
						req.flash('error', 'Email nicht verifiziert');
						res.redirect('/login')
					}
				});
			} else {
				req.flash('error', 'Username und Passwort sind nicht korrekt');
				res.redirect('/login');
			}
		});
	});

	app.post('/update_mail', function (req, res, next) {
		console.log(req.body.mail);
		user=req.session.user;
		timestamp = Math.floor(Date.now() / 1000);
		timestamp_hash=crypto.createHash('sha256').update(String(timestamp)).digest('hex');
		url='/verify/user='+user+'&token='+timestamp_hash;
		rclient.hset(user, "timestamp", timestamp, function (err, obj) {});
		//rclient.hset(user, "link", url, function (err, obj) {});
		var fs = require('fs');
		var path = require('path');
		var filename = user+"_mail.html";
		var file = path.join(__dirname,"../mails/"+filename);
		if (req.secure) {
  			var fullUrl = 'https://diana-yavuz.informatik.haw-hamburg.de'  + url;
		} else {
			var fullUrl = 'http://diana-yavuz.informatik.haw-hamburg.de'   + url;
		}
		var text= "Bitte klicke <a href="+fullUrl+">hier</a>, um deine Email zu verifizieren."
		fs.writeFile(file, text, function(err) {
    			if(err) {
     		   		return console.log(err);
   		 	}
		});
  		console.log("Email für "+user+" angelegt");
		rclient.hset(user, "valid", "False", function (err, obj) {});
		req.session.valid="False"
		rclient.hset(user, "mail", req.body.mail, function (err, obj) {
   			res.redirect('/secure');
			req.flash('message', 'Email aktualisiert');
		});
		
	});

	app.post('/update_password', function (req, res, next) {
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

	app.get('/admin', function (req, res, next) {
		res.render('admin', { flash: req.flash() } ) ;
	});

	app.post('/create_user', function (req, res, next) {
		
		var username=req.body.username
		var password=req.body.password
		var mail=req.body.mail
		var generated_hash=crypto.createHash('sha256').update(username+password).digest('base64')
		
		rclient.keys(username, function (err, obj) {
			var user=obj;
			if (user === undefined || user.length == 0) {
				rclient.hset(username, "password", generated_hash, function (err, obj) {});
				rclient.hset(username, "mail", mail, function (err, obj) {});
				res.redirect('/admin');
   				req.flash('message', 'Nutzer ' + username + ' angelegt');
				console.log("Neuer Nutzer angelegt: "+username);
				console.log(generated_hash);		
			} else {
				res.redirect('/admin');
				req.flash('error', 'Nutzer ' + username + ' existiert bereits!');
			}
		});
	});

	app.get('/verify/user=:uid&token=:token', function (req, res, next){
		user=req.params.uid;
		token=req.params.token;
		rclient.hget(user,"valid", function (err, obj) {
			req.session.valid=obj
		});
  		rclient.hget(user, "timestamp", function (err, obj) {
   			var timestamp=obj;
			timestamp_hash=crypto.createHash('sha256').update(String(timestamp)).digest('hex');
			time_diff= (Math.floor(Date.now() / 1000)) - timestamp
			if (token === timestamp_hash && req.session.valid === "False") {
				rclient.hset(user, "valid", "True", function (err, obj) {});
				res.render('success');
			} else {
				res.render('fail');
			}
		});
  	});

	app.post('/verify_mail/user=:uid', function (req, res, next){
		user=req.params.uid;
		timestamp = Math.floor(Date.now() / 1000);
		timestamp_hash=crypto.createHash('sha256').update(String(timestamp)).digest('hex');
		url='/verify/user='+user+'&token='+timestamp_hash;
		rclient.hset(user, "timestamp", timestamp, function (err, obj) {});
		rclient.hset(user, "link", url, function (err, obj) {});
		res.redirect('/verify_mail/user='+req.params.uid);
  	});

	app.get('/verify_mail/user=:uid', function (req, res, next) {
		var user=req.params.uid
		rclient.hget(user, "link", function (err, obj) {
   			var link=obj;
			console.log(link);
			res.render('mail', { user: user, link: link} ) ;
		});
	});

	app.get('/reset_password', function (req, res, next) {
		res.render('reset', { flash: req.flash() } ) ;
	});

	app.post('/reset_password', function (req, res, next) {
		user = req.body.username
		rclient.hget(user,"mail",function(err,obj) {
			if (obj === req.body.mail) {
				rclient.hget(user,"valid",function(err,obj) {
					if (obj === "True") {
						timestamp = Math.floor(Date.now() / 1000);
						timestamp_hash=crypto.createHash('sha256').update(String(timestamp)).digest('hex');
						url='/new_password/user='+user+'&token='+timestamp_hash;
						rclient.hset(user, "timestamp", timestamp, function (err, obj) {});
						rclient.hset(user, "new_password", "True", function (err, obj) {});
						var fs = require('fs');
						var path = require('path');
						var filename = user+"_password.html";
						var file = path.join(__dirname,"../mails/"+filename);
						if (req.secure) {
				  			var fullUrl = 'https://diana-yavuz.informatik.haw-hamburg.de' + url;
						} else {
							var fullUrl = 'https://diana-yavuz.informatik.haw-hamburg.de' + url;
						}
						var text= "Bitte klicke <a href="+fullUrl+">hier</a>, um ein neues Passwort zu setzen."
						fs.writeFile(file, text, function(err) {
				    			if(err) {
				     		   		return console.log(err);
				   		 	}
						});
						res.redirect("/reset_password") ;
						req.flash('message', "Email versandt")
					} else {
						res.redirect("/reset_password") ;
						req.flash('error', "Email nicht verifiziert");
					}
				});
			} else {
				res.redirect("/reset_password") ;
				req.flash('error', "Email stimmt nicht mit Username überein");
			}
		});
	});

	app.get('/new_password/user=:uid&token=:token', function (req, res, next){
		user=req.params.uid;
		token=req.params.token;
		rclient.hget(user,"valid", function (err, obj) {
			req.session.valid=obj
		});
  		rclient.hget(user, "timestamp", function (err, obj) {
			var timestamp=obj;
			rclient.hget(user, "new_password", function (err,obj) {
				new_password = obj;
				timestamp_hash=crypto.createHash('sha256').update(String(timestamp)).digest('hex');
				time_diff= (Math.floor(Date.now() / 1000)) - timestamp
				if (token === timestamp_hash && time_diff < 1800 && new_password === "True") {
					rclient.hset(user, "new_password", "False", function (err, obj) {});
					req.session.user=user
					res.render('accept_password', { flash: req.flash() } ) 
				} else {
					res.render('fail');
				}
			});
		});
  	});

	app.post('/new_password', function (req, res, next) {
		var generated_hash=crypto.createHash('sha256').update(req.session.user+req.body.password).digest('base64');
		rclient.hset(req.session.user, "password", generated_hash, function (err, obj) {
   			res.redirect('/login');
			req.flash('message', 'Passwort aktualisiert');
		});
	});
};
