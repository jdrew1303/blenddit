rutil = new require(process.cwd() + '/app_middleware/utility.ware.js')();
module.exports = function(app, global, modules, prod) {
	var gware = [global.reqLogger],
		mware = modules[0].navLogger,
		all = rutil.union(gware,mware);
		
	app.get('/:var(home|index)?', [modules[0].navLogger,global.reqLogger], function(req, res){
		res.renderPjax('index', {
			page : "index"
		});
	});

	app.get('/book', modules[0].navLogger, function(req, res) {
		res.renderPjax('book', {
			page: "book"
		});
	});
}
