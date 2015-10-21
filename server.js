/*blenddit.com server*/
// Vendor
var express = require('express'),
    passport = require('passport')
    exphbs  = require('express-handlebars'),
    util = require('util'),
    colors = require('colors'),
    pjax = require('express-pjax'),
    nconf = require('nconf'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
// Middleware
    kutil = require('./middleware/utility.ware'),
    globalware = require('./middleware/global.ware')(kutil),
    auth = require('./middleware/auth.ware'),
// Routes
    routes = require('./routes/routes'),
// Server Configuration
    isDebug = nconf.get('debug'),
    views = isDebug ? 'src/views/' : 'dist/views/';
nconf.add('config',{type: 'file', file:'config.json'});
nconf.add('package',{type: 'file', file:'package.json'});
kutil.configure(nconf);
app = express();
app.enable('strict routing');
app.set('views', views);
hbs = exphbs.create({defaultLayout: 'main', layoutsDir: views+'layouts', partialsDir: views+'partials'});
//kutil.compressAssets(__dirname+'/static-assets');
app.use(compression());
app.locals={ debug : isDebug, version : new Date().getTime()};
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'dat-ass', resave: false, saveUninitialized: false, cookie:{maxAge:31536000000, secure:true}}));
app.use(passport.initialize());
app.use(passport.session());
app.use(globalware.requireHTTPS);
app.use(pjax());
app.use("/src/static-assets/css/", express.static(__dirname + '/src/static-assets/css/',{maxAge:31536000000}));
app.use("/src/static-assets/js/", express.static(__dirname + '/src/static-assets/js/',{maxAge:31536000000}));
app.use("/src/static-assets/imgs/", express.static(__dirname + '/src/static-assets/imgs/',{maxAge:31536000000}));

/* 
	Instantiate routes ware with airity 4 
	@params p0,p1,[p2],p3 -> application, global middleware, [moduleWare0,moduleWare1,..,n], utility ware
*/
routes(app, globalware, [], kutil);

// Create an application server instance on HTTP port 8080 (80)
http.createServer(app).listen(nconf.get('port_http'));

// Create an application server instance on HTTPS port 8443 (443)
isDebug
    ? https.createServer({
        key:fs.readFileSync('certs/src/key.pem'), 
        cert:fs.readFileSync('certs/src/cert.pem')
    }, app).listen(nconf.get('port_https'))
    : https.createServer({
        ca: [fs.readFileSync('certs/dist/comodo/bundle0.crt'), 
             fs.readFileSync('certs/dist/comodo/bundle1.crt'), 
             fs.readFileSync('certs/dist/comodo/bundle2.crt')],
        key: fs.readFileSync('certs/dist/comodo/key.pem'),
        cert: fs.readFileSync('comodo/www.blenddit.com.crt')
    }, 
    app).listen(nconf.get('port_https'));

kutil.serverOut();

// Generating a self signed certificate that works.
// openssl genrsa 1024 > key.pem
// openssl req -x509 -new -key key.pem > cert.pem

// iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to 8080 (used this in live)
// iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080
// iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 3000
