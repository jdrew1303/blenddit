var passport = require('passport'),
	crypto = require('crypto'),
	fs = require('fs'),
	nconf = require('nconf'),
	reddit_key = nconf.get('debug') ? nconf.get('authKeys').REDDIT_CONSUMER_KEY_DEBUG : nconf.get('authKeys').REDDIT_CONSUMER_KEY_LIVE,
    reddit_sec = nconf.get('debug') ? nconf.get('authKeys').REDDIT_CONSUMER_SECRET_DEBUG : nconf.get('authKeys').REDDIT_CONSUMER_SECRET_LIVE;
module.exports = function(app, globalware, elseware, kutil) {
	var gware = globalware, mware = elseware,
	    all = gware.methods.concat(kutil.getMethods(mware));
	
	app.get('/:var(home|index)?', gware.nowww, function(req, res){
		var json = {}; 
		json.reddit = { 
			redditUserExists : req.user ? true : false, 
			redditUser : req.user ? req.user.name : '',
			subredditURI : req.session.subreddit,
			threadidURI : req.session.threadid
		};
		res.renderPjax('blenddit', json);	
		req.session.subreddit = req.session.threadid = null;
	});

	app.get('/r/:subreddit/comments/:threadid*', gware.nowww, function(req, res) {
		req.session.subreddit = req.params.subreddit;
		req.session.threadid = req.params.threadid;
		res.redirect('/');
	})

	app.get('/r/:subreddit', gware.nowww, function(req, res) {
		req.session.subreddit = req.params.subreddit;
		res.redirect('/');
	})
	
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
	      failureRedirect: '/'
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

	app.post('/check-login', gware.ensureAuthenticated, function(req, res, next) {
		res.setHeader('Content-Type', 'application/json');
		res.send({needsLogin:false});
	});

	app.get('/reddit-login', function(req, res, next) {
		res.setHeader('Content-Type', 'application/json');
		res.send({needsLogin:true});
	});
	
	app.get('/reddit-logout', function(req, res, next) {
		req.logout();
		res.send("<a class='white nopacity' href='/auth/reddit'><i class='fa fa-reddit fa-lg'></i>&nbsp;Sign in to Reddit</a>");
	});

	app.post('/save-reddit-reply', gware.ensureAuthenticated, gware.refreshAccessToken, function(req, res){
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
	        : res.send({statusCode: response.statusCode, body: JSON.stringify(body)})
	  }).form({'api_type':'json', 'thing_id':req.body.thing_id, 'text':req.body.text});
	});

	app.post('/search-reddit-names', function(req, res, next) {
		var options = {
		    url: 'https://'+reddit_key+':'+reddit_sec+'@www.reddit.com/api/search_reddit_names.json',
		    headers: {
		        'User-Agent': 'request',
		        'Content-Type':'application/x-www-form-urlencoded'
		    }
	  	};
	  	require('request').post(options, function callback(error, response, body) {
			res.setHeader('Content-Type', 'application/json');
			!error && response.statusCode == 200 
		    	? res.send(body)
		      	: error ? res.send({statusCode: 'error', error: JSON.stringify(error)})
		        	: res.send({statusCode: response.statusCode, body: JSON.stringify(body)})
		}).form({'query':req.body.query, 'include_over_18':'true'});
	});

	app.get('*', function(req,res) {
		res.status(404).redirect('/')
	});
}
