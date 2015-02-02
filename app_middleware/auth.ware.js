var passport = require('passport'),
	RedditStrategy = require('passport-reddit').Strategy,
	nconf = require('nconf')
nconf.add('config',{type: 'file', file:'config.json'})

module.exports =
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
passport.use(new RedditStrategy({
    clientID: nconf.get('authKeys').REDDIT_CONSUMER_KEY,
    clientSecret: nconf.get('authKeys').REDDIT_CONSUMER_SECRET,
    callbackURL: "http://127.0.0.1:8080/auth/reddit/callback",
    scope : ['submit']
  },
  function(accessToken, refreshToken, profile, done) {
    profile.redditAccessToken = accessToken;
    profile.redditRefreshToken = refreshToken;
    profile.redditAccessTokenExpireTime = (function() { 
      var now = new Date(), oneHourFromNow = new Date(now);
      oneHourFromNow.setMinutes(now.getMinutes()+55);
      return oneHourFromNow;
    })();
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));