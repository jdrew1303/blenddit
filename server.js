/*kurtlocker.og  node server*/
// Vendor
var express = require('express'),
    passport = require('passport')
    exphbs  = require('express3-handlebars'),
    util = require('util'),
    colors = require('colors'),
    pjax = require('express-pjax'),
    nconf = require('nconf'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
// Middleware
    kutil = require('./app_middleware/utility.ware'),
    globalware = require('./app_middleware/global.ware')(kutil),
    auth = require('./app_middleware/auth.ware'),
// Routes
    routes = require('./app_routes/routes');
// Server Configuration
nconf.add('config',{type: 'file', file:'config.json'});
nconf.add('package',{type: 'file', file:'package.json'});
kutil.configure(nconf);
app = express();
app.enable('strict routing');
hbs = exphbs.create({ /* config */ });
kutil.compressAssets(__dirname+'/static-assets');
app.use(compression());
app.locals={ debug : nconf.get('debug'), version : new Date().getTime()};
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(methodOverride());
app.use(session({ secret: 'dat-ass', resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(globalware.requireHTTPS)
app.use(pjax());
app.use("/static-assets/css/", express.static(__dirname + '/static-assets/css/',{maxAge:31536000000}));
app.use("/static-assets/js/", express.static(__dirname + '/static-assets/js/',{maxAge:31536000000}));
app.use("/static-assets/imgs/", express.static(__dirname + '/static-assets/imgs/',{maxAge:31536000000}));

/* 
	Instantiate routes ware with airity 4 
	@params p0,p1,[p2],p3 -> application, global middleware, [moduleWare0,moduleWare1,..,n], utility ware
*/
routes(app, globalware, [], kutil);

http.createServer(app).listen(nconf.get('port_http'));
https.createServer({key:fs.readFileSync('key.pem'), cert:fs.readFileSync('cert.pem')}, app).listen(nconf.get('port_https'));
kutil.serverOut();

// iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to 8080 (used this in live)
// iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080
// iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 3000
