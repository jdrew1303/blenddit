var passport = require('passport'),
    RedditStrategy = require('passport-reddit').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    nconf = require('nconf'),
    reddit_key = nconf.get('debug') ? nconf.get('authKeys').REDDIT_CONSUMER_KEY_DEBUG : nconf.get('authKeys').REDDIT_CONSUMER_KEY_LIVE,
    reddit_sec = nconf.get('debug') ? nconf.get('authKeys').REDDIT_CONSUMER_SECRET_DEBUG : nconf.get('authKeys').REDDIT_CONSUMER_SECRET_LIVE,
    twitter_key = nconf.get('debug') ? nconf.get('authKeys').TWITTER_CONSUMER_KEY_DEBUG : nconf.get('authKeys').TWITTER_CONSUMER_KEY_LIVE,
    twitter_sec = nconf.get('debug') ? nconf.get('authKeys').TWITTER_CONSUMER_SECRET_DEBUG : nconf.get('authKeys').TWITTER_CONSUMER_SECRET_LIVE,
    reddit_redirect_uri = nconf.get('debug') ? "https://127.0.0.1:8443/auth/reddit/callback" : "https://blenddit.com/auth/reddit/callback",
    twitter_redirect_uri = nconf.get('debug') ? "https://127.0.0.1:8443/auth/twitter/callback" : "https://blenddit.com/auth/twitter/callback"

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
    callbackURL: reddit_redirect_uri,
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
passport.use(new TwitterStrategy({
    consumerKey: twitter_key,
    consumerSecret: twitter_sec,
    callbackURL: twitter_redirect_uri
  },
  function(token, tokenSecret, profile, done) {
    profile.twitterToken = token;
    profile.twitterTokenSecret = tokenSecret;
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));