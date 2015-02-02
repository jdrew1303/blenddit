var nconf = require('nconf');
nconf.add('config',{type: 'file', file:'config.json'})
module.exports = function(module) {
	/*private variables*/
	kutil = module;
	/*public middleware*/
	return {
		get methods() {
			return [this.ensureAuthenticated, this.refreshAccessToken];
		}, 
		ensureAuthenticated : function(req,res,next) {
			if (req.isAuthenticated()) { return next(); }
  			else if (req.url=='/save-reddit-reply') { 
  				res.redirect('/reddit-login')
  			} else {
  				res.redirect('/'); //res.redirect('/login');
  			}
		},
		refreshAccessToken : function(req,res,next) {
			if (new Date() > new Date(req.session.passport.user.redditAccessTokenExpireTime)) { // an hour has passed since the the accessToken was retrieved
			  	var options = {
				    url: 'https://'+nconf.get('authKeys').REDDIT_CONSUMER_KEY+':'+nconf.get('authKeys').REDDIT_CONSUMER_SECRET+'@www.reddit.com/api/v1/access_token',
				    headers: {
				        'User-Agent': 'request',
				        'Content-Type':'application/x-www-form-urlencoded'
				    }
			  	};
			  	require('request').post(options, function callback(error, response, body) {
		    		if (!error && response.statusCode == 200) {
		    			req.session.passport.user.redditAccessToken = JSON.parse(body).access_token;
		    			req.session.passport.user.redditAccessTokenExpireTime = (function() { 
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
			  	}).form({'grant_type':'refresh_token', 'refresh_token':req.user.redditRefreshToken});
			} else {
				next();
			}
		}
	};
}
