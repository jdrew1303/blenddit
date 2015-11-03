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

	/* New framework development 11-2-2015 */
	app.get('/oneui', gware.nowww, function(req, res){
		var redditSession = new Buffer(encodeURIComponent(JSON.stringify(kutil.buildSessionObject(req, 'reddit')))).toString('base64'),
			twitterSession = new Buffer(encodeURIComponent(JSON.stringify(kutil.buildSessionObject(req, 'twitter')))).toString('base64');
		res.renderPjax('blenddit_new', {
			layout: 'main_new',
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
	
	app.get('/refresh-access-token', function(req, res, next) {
		res.setHeader('Content-Type', 'application/json');
		if (req.session.redditRefreshToken) {
			var options = {
				url: 'https://'+reddit_key+':'+reddit_sec+'@www.reddit.com/api/v1/access_token',
				headers: {
					'User-Agent': 'nodejs:www.blenddit.com:v0.0.1 (by /u/kurtlocker)',
					'Content-Type':'application/x-www-form-urlencoded'
				}
			};
			require('request').post(options, function callback(error, response, body) {
				!error && response.statusCode == 200 
					? res.send(JSON.parse(body))
					: error 
						? res.send({statusCode: 'error', error: JSON.parse(error)})
						: res.send({statusCode: response.statusCode, body: JSON.parse(body)});
			}).form({'grant_type':'refresh_token', 'refresh_token':req.session.redditRefreshToken});
		} else {
			res.send({status: 'No refresh token in session', hasRefresh: false})
		}
	});

	app.get('/*', function(req,res) {
		res.redirect('/');
	});
};