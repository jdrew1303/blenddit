var passport = require('passport'),
	crypto = require('crypto'),
	fs = require('fs');
module.exports = function(app, globalware, elseware, kutil) {
	var gware = globalware, mware = elseware,
	    all = gware.methods.concat(kutil.getMethods(mware));
	
	app.get('/:var(home|index)?', function(req, res){
		res.renderPjax('index', {
			page : "index"
		});
	});
	
	app.get('/merger', function(req, res) {
		var json = {};
		fs.readFile(require('path').dirname(require.main.filename)+'/teams.json', 'utf8', function (err, data) {
		  if (err) { return console.log(err); }
		  json.teams = JSON.parse(data);
		  res.renderPjax('merger', json);	
		});
	});
	
	app.get('/lists', function(req, res) {
		var json = {};
		fs.readFile(require('path').dirname(require.main.filename)+'/listsjs.json', 'utf8', function (err, data) {
		  if (err) { return console.log(err); }
		  json.listsJSON = JSON.parse(data);
		  res.renderPjax('lists', json);	
		});
	});
	
	app.get('/auth/reddit/callback', function(req, res, next){
	  if (req.query.state == req.session.state){
	    passport.authenticate('reddit', {
	      successRedirect: '/',
	      failureRedirect: '/login'
	    })(req, res, next);
	  }
	  else {
	    next( new Error(403) );
	  }
	});
	
	app.get('/auth/reddit', function(req, res, next){
	  req.session.state = crypto.randomBytes(32).toString('hex');
	  passport.authenticate('reddit', {
	    state: req.session.state,
	    duration: 'permanent'
	  })(req, res, next);
	});

	app.get('/reddit-login', function(req, res, next) {
		res.setHeader('Content-Type', 'application/json');
		res.send({needsLogin:true});
	});
	
	app.post('/save-reddit-reply', gware.ensureAuthenticated, function(req, res){
	  var options = {
	    url: 'https://oauth.reddit.com/api/comment',
	    headers: {
	        'User-Agent': 'request',
	        'Authorization':'bearer '+req.session.passport.user.redditAccessToken,
	        'Content-Type':'application/x-www-form-urlencoded'
	    }
	  };
	  require('request').post(options, function callback(error, response, body) {
	    res.setHeader('Content-Type', 'application/json');
	    !error && response.statusCode == 200 
	      ? res.send(body)
	      : error ? res.send({statusCode: 'error', error: JSON.stringify(error)})
	        : res.end({statusCode: response.statusCode, body: body})
	  })
	  .form({'api_type':'json', 'thing_id':'t1_cn9e839', 'text': 'another programmatic response'});
	});

	app.get('*', function(req,res) {
		res.status(404).send('<h1 style="text-align: center;">404 Not fizound</h1>');
	});
}
