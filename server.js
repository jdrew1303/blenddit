/*
	blackboxed server
*/

var express = require('express'),
    exphbs  = require('express3-handlebars'),
    util = require('util'),
    app = express(),
    hbs = exphbs.create({ /* config */ });

app.use(util);
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use("/static-assets/css/", express.static(__dirname + '/static-assets/css/'));

// Handle requests
app.get('/', function(req, res){
  res.render('index', {
  	page : "index"
  });
});

app.listen(3000);
util.log("Server listening on 3000");