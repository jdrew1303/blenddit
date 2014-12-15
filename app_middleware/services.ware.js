var qs = require('querystring'),
	http = require('http'),
	OAuth = require('oauth');

function Services() {};

Services.prototype = {
	getTweets : function(req, callback) {
		var twitterKey = '',
			twitterSecret = '',
			token = '',
			secret = '';
		var oauth = new OAuth.OAuth(
		  'https://api.twitter.com/oauth/request_token',
		  'https://api.twitter.com/oauth/access_token',
		  twitterKey,
		  twitterSecret,
		  '1.0A',
		  null,
		  'HMAC-SHA1'
		);

		oauth.get('https://api.twitter.com/1.1/search/tweets.json?q=%23Russell%20Wilson',
		  token, secret,
		  function (error, data, response){
		    // if (error) console.error(error);
		    data = JSON.parse(data);
		    console.log(JSON.stringify(data, 0, 2));
		    // console.log(response);
		});
	}

		// getTweets : function(request, callback) {
		// 	http.get({
		// 		host : 'search.twitter.com',
		// 		path : '/searh.json?' + qs.stringify({q: 'Seahawks'})
		// 	}, function(response) {
		// 		var body = '';
		// 		response.setEncoding('utf8');
		// 		response.on('data',function(chunk) {
		// 			body += chunk;
		// 		})
		// 		response.on('end', function() {
		// 			var obj = JSON.parse(body);
		// 			console.log(obj)
		// 		})
		// 	})
		// }
}
module.exports = exports = new Services();
