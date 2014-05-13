module.exports = {
	reqLogger : function(req,res,next) {
		console.log("%s %s %s".green, req.method, req.url, req.path);
		next();
	}
}
