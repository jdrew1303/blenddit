var passport = require('passport'),
    RedditStrategy = require('passport-reddit').Strategy,
    nconf = require('nconf'),
    reddit_key = nconf.get('debug') ? nconf.get('authKeys').REDDIT_CONSUMER_KEY_DEBUG : nconf.get('authKeys').REDDIT_CONSUMER_KEY_LIVE,
    reddit_sec = nconf.get('debug') ? nconf.get('authKeys').REDDIT_CONSUMER_SECRET_DEBUG : nconf.get('authKeys').REDDIT_CONSUMER_SECRET_LIVE,
    redirect_uri = nconf.get('debug') ? "http://127.0.0.1:8080/auth/reddit/callback" : "http://www.blenddit.com/auth/reddit/callback"

module.exports =
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
passport.use(new RedditStrategy({
    clientID: reddit_key,
    clientSecret: reddit_sec,
    callbackURL: redirect_uri,
    scope : ['submit','vote']
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