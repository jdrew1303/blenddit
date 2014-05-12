/*
	blackboxed server
*/

var express = require('express'),
    exphbs  = require('express3-handlebars'),
    util = require('util'),
    colors = require('colors'),
    pjax = require('express-pjax'),
    app = express(),
    hbs = exphbs.create({ /* config */ });

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(util);
app.use(pjax());
app.use("/static-assets/css/", express.static(__dirname + '/static-assets/css/'));
app.use("/static-assets/js/", express.static(__dirname + '/static-assets/js/'));
app.enable('verbose errors');
// Handle requests
app.get('/:var(home|index)?', function(req, res){
  res.renderPjax('index', {
  	page : "index"
  });
});

app.get('/book', function(req, res) {
	res.renderPjax('book', {
		page: "book"
	});
});

app.get('*', function(req,res) {
	res.status(404).send('<h1 style="text-align: center;">404 Not fizound</h1>');
});

app.listen(3000);
util.log("Server listening on 3000".bold.blue);