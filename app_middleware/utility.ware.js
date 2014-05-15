module.exports = function() {
	c = console;
	fs = require('fs');
	return {
		getMethods : function(modules) {
			var funcs = [];
			var i=0,n=modules.length;
			for(;i<n;i++) {
				funcs = modules[i].methods.concat(funcs);
			}
			return funcs 
		},
		unique : function(ip,ips) {
			var i = 0, n = ips.length;
			for (;i < n; i++) {
				if (ip == ips[i]) {
					return false;
				}
			}
			return true;
		},
		serverOut : function(nconf) { // pretty server stats
			package = nconf.file({'file':'./package.json'});
			date = new Date();

			c.log('----------------------------');
			c.log(package.get('name').concat(' : ').concat(package.get('description')).underline.grey);
			c.log('- Dependencies'.grey);
			for (dependency in package.get('dependencies')) {
				c.log(' - '+dependency);
			}
			c.log('- Middleware'.grey);
			printDirContents('./app_middleware');			

			c.log('- Routes'.grey);
			printDirContents('./app_routes');
			c.log('----------------------------');
			c.log(date.toString());
			c.log('Server listening on '.concat(nconf.file({'file':'./config.json'}).get('port')).bold.green);
			c.log('----------------------------');

			function printDirContents(route) {
				var list = fs.readdirSync(route),i = 0, n = list.length;
				for(;i<n;i++) {
					if (/^[^\.]/.test(list[i])) {
						c.log(' - '+list[i]);
					}
				}
			}
		}
	}
}
