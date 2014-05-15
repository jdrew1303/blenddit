/*Blackboxed node express server*/
// Vendor
var express = require('express'),
    exphbs  = require('express3-handlebars'),
    util = require('util'),
    colors = require('colors'),
    pjax = require('express-pjax'),
    nconf = require('nconf'),
// Middleware
	kutil = require('./app_middleware/utility.ware')(),
	globalware = require('./app_middleware/global.ware')(kutil),
	navigationware = require('./app_middleware/navigation.ware'),
// Routes
	routes = {
		navigation : require('./app_routes/routes.navigation')
	};
// Server Configuration
nconf.file({file: './config.json'});
app = express()
hbs = exphbs.create({ /* config */ })
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(pjax());
app.use("/static-assets/css/", express.static(__dirname + '/static-assets/css/'));
app.use("/static-assets/js/", express.static(__dirname + '/static-assets/js/'));

/* 
	Instantiate routes ware with airity 5 
	@params p0,p1,p2,[p3],p4 -> server, global middleware, [moduleWare0,moduleWare1,..,n], utility ware, server configuration
*/
routes.navigation(app, globalware, [navigationware], kutil, nconf);

// Error
app.get('*', function(req,res) {
	res.status(404).send('<h1 style="text-align: center;">404 Not fizound</h1>');
});

app.listen(nconf.get('port'));
kutil.serverOut(nconf);
