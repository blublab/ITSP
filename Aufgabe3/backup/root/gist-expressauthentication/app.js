var express = require('express');

var port = 8999;

var app = express.createServer();

function checkAuth (req, res, next) {
	console.log('checkAuth ' + req.url);

	// don't serve /secure to those not logged in
	// you should add to this list, for each and every secure url
	if (req.url === '/secure' && (!req.session || !req.session.authenticated)) {
		res.render('unauthorised', { status: 403 });
		return;
	}

	next();
}

var path = require('path');
var static_path = path.join(__dirname, '/mails')
app.use(express.static(static_path));


app.configure(function () {

	app.use(express.cookieParser());
	app.use(express.session({ secret: 'example' }));
	app.use(express.bodyParser());
	app.use(checkAuth);
	app.use(app.router);
	app.set('view engine', 'jade');
	app.set('view options', { layout: false });

});

require('./lib/routes.js')(app);

app.listen(port);
console.log('Node listening on port %s', port);
