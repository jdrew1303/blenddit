module.exports = function(module) {
	/*private variables*/
	kutil = module;
	/*public middleware*/
	return {
		get methods() {
			return [this.ensureAuthenticated];
		}, 
		ensureAuthenticated : function(req,res,next) {
			if (req.isAuthenticated()) { return next(); }
  			res.redirect('/login');
		}
	};
}
