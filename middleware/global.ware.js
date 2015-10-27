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
			return [this.nowww, this.requireHTTPS];
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
