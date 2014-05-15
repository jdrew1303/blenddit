module.exports = {
	get methods() {
		return [this.navLogger];
	},
	navLogger : function(req,res,next) {
		console.log('routes available: '.red + '/ /home /index '.red);
		next();
	}
}
