var passport = require('passport'),
	crypto = require('crypto'),
	fs = require('fs'),
	nconf = require('nconf'),
	reddit_key = nconf.get('debug') ? nconf.get('authKeys').REDDIT_CONSUMER_KEY_DEBUG : nconf.get('authKeys').REDDIT_CONSUMER_KEY_LIVE,
    reddit_sec = nconf.get('debug') ? nconf.get('authKeys').REDDIT_CONSUMER_SECRET_DEBUG : nconf.get('authKeys').REDDIT_CONSUMER_SECRET_LIVE;
module.exports = function(app, globalware, elseware, kutil) {
	var gware = globalware, mware = elseware,
		all = gware.methods.concat(kutil.getMethods(mware));
	
	app.get('/', gware.nowww, function(req, res){
		var redditSession = new Buffer(encodeURIComponent(JSON.stringify(kutil.buildSessionObject(req, 'reddit')))).toString('base64'),
			twitterSession = new Buffer(encodeURIComponent(JSON.stringify(kutil.buildSessionObject(req, 'twitter')))).toString('base64');
		res.renderPjax('blenddit', {
			pressType : kutil.getPressType(req.headers['user-agent']),
			redditSession : redditSession,
			twitterSession : twitterSession,
			subredditURI : req.session.subreddit ? req.session.subreddit : '',
			threadidURI : req.session.threadid ? req.session.threadid : '',
			threadidsURI : req.session.threadids ? req.session.threadids : ''
		});
		kutil.deleteSessionProperties(req);
	});
	
    app.get('/comments/:threadids*', gware.nowww, function(req, res) {
        req.session.threadids = req.params.threadids;
        res.redirect('/');
    });
    
	app.get('/r/:subreddit/comments/:threadid*', gware.nowww, function(req, res) {
		req.session.subreddit = req.params.subreddit;
		req.session.threadid = req.params.threadid;
		res.redirect('/');
	});

	app.get('/r/:subreddit*', gware.nowww, function(req, res) {
		req.session.subreddit = req.params.subreddit;
		res.redirect('/');
	});
	
	app.get('/auth/reddit', function(req, res, next){
		req.session.state = crypto.randomBytes(32).toString('hex');
			passport.authenticate('reddit', {
			state: req.session.state,
			duration: 'permanent'
		})(req, res, next);
	});

	app.get('/auth/reddit/callback', function(req, res, next){
		if (req.query.state == req.session.state){
			passport.authenticate('reddit', {
				failureRedirect: '/'
			})(req, res, next);
		} else {
			next( new Error(403) );
		}
	}, function(req,res,next) {
		req.session.reddit = req.user;
		res.redirect('/');
	});
	
	app.get('/auth/twitter', passport.authenticate('twitter'), function(req, res){});

	app.get('/auth/twitter/callback',
		passport.authenticate('twitter', {
			failureRedirect: '/'
		}),
		function(req, res) {
			req.session.twitter = req.user;
			res.redirect('/');
		}
	);

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
		delete req.session.reddit;
		res.send(["<div class='media' "+kutil.getPressType(req.headers['user-agent'])+"='bindRedditLogIn.call(this);'>",
					"<a href='javascript:void(0);' class='pull-left'>",
						"<span class='text-red'><i class='fa fa-reddit-square fa-4x'></i></span>",
					"</a>",
					"<div class='media-body'>",
						"<h4 class='media-heading'><span class='text-red'>Sign in to Reddit</span></h4>",
						"<p>Follow this link to connect your Reddit account to Blenddit.</p>",
					"</div>",
				"</div>"].join(''));
	});

	app.get('/twitter-logout', function(req, res, next) {
		req.logout();
		delete req.session.twitter;
		res.send(["<div class='media' "+kutil.getPressType(req.headers['user-agent'])+"='bindTwitterLogIn.call(this)'>",
					"<a href='javascript:void(0);' class='pull-left'>",
						"<span class='text-primary'><i class='fa fa-twitter-square fa-4x'></i></span>",
					"</a>",
					"<div class='media-body'>",
						"<h4 class='media-heading'><span class='text-primary'>Sign in to Twitter</span></h4>",
						"<p>Follow this link to connect your Twitter account to Blenddit.</p>",
					"</div>",
                "</div>"].join(''));
	});

	app.post('/save-reddit-reply', gware.ensureAuthenticated, gware.refreshAccessToken, function(req, res){
		var options = kutil.buildAuthReqObj('https://oauth.reddit.com/api/comment', req);
		require('request').post(options, function callback(error, response, body) {
			res.setHeader('Content-Type', 'application/json');
			!error && response.statusCode == 200 ? res.send(body)
				: error ? res.send({statusCode: 'error', error: JSON.stringify(error)})
			: res.send({statusCode: response.statusCode, body: JSON.stringify(body)});
		}).form({'api_type':'json', 'thing_id':req.body.thing_id, 'text':req.body.text});
	});

	app.post('/vote', gware.ensureAuthenticated, gware.refreshAccessToken, function(req, res){
		var options = kutil.buildAuthReqObj('https://oauth.reddit.com/api/vote', req);

		require('request').post(options, function callback(error, response, body) {
			res.setHeader('Content-Type', 'application/json');
			!error && response.statusCode == 200 ? res.send(body)
				: error ? res.send({statusCode: 'error', error: JSON.stringify(error)})
			: res.send({statusCode: response.statusCode, body: JSON.stringify(body)});
		}).form({'id':req.body.id, 'dir':req.body.dir});
	});

	app.get('/search-reddit-names', function(req, res, next) {
		var options = {
			url: 'https://'+reddit_key+':'+reddit_sec+'@www.reddit.com/api/search_reddit_names.json',
			headers: {
				'User-Agent': 'request',
				'Content-Type':'application/x-www-form-urlencoded'
			}
		};
		require('request').post(options, function callback(error, response, body) {
			res.setHeader('Content-Type', 'application/json');
			!error && response.statusCode == 200 ? res.send(body)
				: error ? res.send({statusCode: 'error', error: JSON.stringify(error)})
			: res.send({statusCode: response.statusCode, body: JSON.stringify(body)});
		}).form({'query':req.query.query, 'include_over_18':'true'});
	});

	app.get('/*', function(req,res) {
		res.redirect('/');
	});
};