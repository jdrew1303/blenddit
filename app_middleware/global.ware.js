var nconf = require('nconf');
nconf.add('config',{type: 'file', file:'config.json'})
var reddit_key = nconf.get('debug') ? nconf.get('authKeys').REDDIT_CONSUMER_KEY_DEBUG : nconf.get('authKeys').REDDIT_CONSUMER_KEY_LIVE,
	reddit_sec = nconf.get('debug') ? nconf.get('authKeys').REDDIT_CONSUMER_SECRET_DEBUG : nconf.get('authKeys').REDDIT_CONSUMER_SECRET_LIVE;
module.exports = function(module) {
	/*private variables*/
	kutil = module;
	/*public middleware*/
	return {
		get methods() {
			return [this.ensureAuthenticated, this.refreshAccessToken, this.nowww, this.requireHTTPS];
		}, 
		ensureAuthenticated : function(req,res,next) {
			if (req.isAuthenticated()) { return next(); }
  			else if (req.url=='/save-reddit-reply' || req.url=='/check-login' || req.url=='/vote') { 
  				res.redirect('/reddit-login')
  			} else {
  				res.redirect('/'); //res.redirect('/login');
  			}
		},
		refreshAccessToken : function(req,res,next) {
			if (new Date() > new Date(req.session.reddit.redditAccessTokenExpireTime)) { // an hour has passed since the the accessToken was retrieved
				var options = {
				    url: 'https://'+reddit_key+':'+reddit_sec+'@www.reddit.com/api/v1/access_token',
				    headers: {
				        'User-Agent': 'request',
				        'Content-Type':'application/x-www-form-urlencoded'
				    }
			  	};
			  	require('request').post(options, function callback(error, response, body) {
		    		if (!error && response.statusCode == 200) {
		    			req.session.reddit.redditAccessToken = JSON.parse(body).access_token;
		    			req.session.reddit.redditAccessTokenExpireTime = (function() { 
      						var now = new Date(), oneHourFromNow = new Date(now);
      						oneHourFromNow.setMinutes(now.getMinutes()+55);
      						return oneHourFromNow;
    					})();
    					req.session.save(function(err){ 
    						if (err) return next(err);
    						next();
    					})
		    		} else {
		    			res.redirect('/reddit-login')	
		    		}
			  	}).form({'grant_type':'refresh_token', 'refresh_token':req.session.reddit.redditRefreshToken});
			} else {
				next();
			}
		},
		nowww : function(request, response, next) {
			var protocol = 'http' + (request.connection.encrypted ? 's' : '') + '://',
				host = request.headers.host,
				href;
			// no www. present, nothing to do here
			if (!/^www\./i.test(host)) {
				next();
				return;
			}
			// remove www.
			host = host.replace(/^www\./i, '');
			href = protocol + host + request.url;
			response.statusCode = 301;
			response.setHeader('Location', href);
			response.write('Redirecting to ' + host + request.url + '');
			response.end();
		},
		/*
		 * Force HTTPS redirect for all users so we can leverage local storage via the
		 * HTTPS origin.
		*/
		requireHTTPS : function(req, res, next) {
			if (!req.secure) {
				var host = nconf.get('debug') ? '127.0.0.1:8443' : req.get('Host');
				return res.redirect(['https://', host, req.url].join(''));
			}
			next();
		}
	};
}
