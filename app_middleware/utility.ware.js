c = console;
fs = require('fs');
compress = require('node-minify');

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
		c.log('Server listening on '.concat(this.nconf.get('debug') ? this.nconf.get('port_debug') : this.nconf.get('port_live')).bold.green);
		c.log('----------------------------');
	},
	printDirContents : function(route) {
		var list = fs.readdirSync(route),i = 0, n = list.length;
		for(;i<n;i++) {
			if (/^[^\.]/.test(list[i])) {
				c.log(' - '+list[i]);
			}
		}
	},
	compressAssets : function(path){ 
		jsFiles = assetArray('js',this)
		cssFiles = assetArray('css',this)
		new compress.minify({
		    type: 'gcc',
		    fileIn: jsFiles,
		    fileOut: path+'/js/all.js',
		    callback: function(err, min){ if (err) console.log(err);}
		});
		new compress.minify({
		    type: 'sqwish',
		    fileIn: cssFiles,
		    fileOut: path+'/css/all.css',
		    callback: function(err, min){ if (err) console.log(err); }
		});
		function assetArray(type,ctx){ 
			var arr = [];
			ctx.nconf.get(type=='js'?'jsFiles':'cssFiles').forEach(function(file) {
				arr.push(path+'/'+type+'/'+file)
			})
			return arr;
		}
	}
}
module.exports = exports = new KUtil();

