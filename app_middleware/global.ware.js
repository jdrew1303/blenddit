var visitors = 0, 
	ips = [], 
	totalVisitors = function() { 
		console.log('- Total unique visitors today: '+visitors);
	};

module.exports = function(module) {
	/*private variables*/
	kutil = module;
	/*public middleware*/
	return {
		get methods() {
			return [this.reqLogger,this.visitor,this.totalVisitors];
		}, 
		reqLogger : function(req,res,next) {
			console.log("%s %s %s".green, req.method, req.url, req.path);
			next();
		},
		visitor : function(req,res,next) {
			if (kutil.unique(req.ip, ips)) {
				console.log('User '+req.ip + ' connected.'.green); 
				ips.unshift(req.ip);
				visitors++;
				totalVisitors()
			}
			next();
		},
	};
}
