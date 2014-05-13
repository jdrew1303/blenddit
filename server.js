/*Blackboxed node express server*/
// Vendor
var express = require('express'),
    exphbs  = require('express3-handlebars'),
    util = require('util'),
    colors = require('colors'),
    pjax = require('express-pjax'),
    config = require('nconf'),
// Middleware
	globalware = new require('./app_middleware/global.ware'),
	navigationware = require('./app_middleware/navigation.ware'),
	rutil = new require('./app_middleware/utility.ware.js')(),
// Routes
	routes = {
		navigation : require('./app_routes/routes.navigation')
	};
// Server Configuration
app = express(),
hbs = exphbs.create({ /* config */ }),
prod = false;
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(util);
app.use(pjax());
app.use("/static-assets/css/", express.static(__dirname + '/static-assets/css/'));
app.use("/static-assets/js/", express.static(__dirname + '/static-assets/js/'));

/* 
	Instantiate routes ware with airity 5 
	@params p0,p1,p2,[p3],p4 -> server, global middleware, [moduleWare0,moduleWare1,..,n], utility ware, server configuration
*/
routes.navigation(app, globalware, [navigationware], rutil, config);

// Error
app.get('*', function(req,res) {
	res.status(404).send('<h1 style="text-align: center;">404 Not fizound</h1>');
});

app.listen(3000);
util.log("Server listening on 3000".bold.blue);