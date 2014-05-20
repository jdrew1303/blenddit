c = console;
fs = require('fs');	

function KUtil() {};

KUtil.prototype = {
	configure : function(nconf) {
		this.nconf = nconf;
	},	
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
	serverOut : function() { // pretty server stats
		date = new Date();
		c.log('----------------------------');
		c.log(this.nconf.get('name').concat(' : '+this.nconf.get('description')).underline.grey);
		c.log('- Dependencies'.grey);
		for (dependency in this.nconf.get('dependencies')) {
			c.log(' - '+dependency);
		}
		c.log('- Middleware'.grey);
		this.printDirContents('./app_middleware');			

		c.log('- Routes'.grey);
		this.printDirContents('./app_routes');
		c.log('----------------------------');
		c.log(date.toString());
		c.log('Server listening on '.concat(this.nconf.get('port')).bold.green);
		c.log('----------------------------');
	},
	printDirContents : function(route) {
		var list = fs.readdirSync(route),i = 0, n = list.length;
		for(;i<n;i++) {
			if (/^[^\.]/.test(list[i])) {
				c.log(' - '+list[i]);
			}
		}
	}
}
module.exports = exports = new KUtil();

