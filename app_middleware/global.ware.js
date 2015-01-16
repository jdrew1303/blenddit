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
  			else if (req.url=='/save-reddit-reply') { 
  				res.redirect('/reddit-login')
  			} else {
  				res.redirect('/'); //res.redirect('/login');
  			}
		}
	};
}
