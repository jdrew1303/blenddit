module.exports = function(app, globalware, moduleArray, rutil, config) {
	if (!config.get('production')) { console.log('prod') }
	var gware = [globalware.reqLogger],
		mware = moduleArray[0].navLogger,
		all = rutil.union(gware,mware);

	app.get('/:var(home|index)?', [moduleArray[0].navLogger,globalware.reqLogger], function(req, res){
		res.renderPjax('index', {
			page : "index"
		});
	});

	app.get('/book', moduleArray[0].navLogger, function(req, res) {
		res.renderPjax('book', {
			page: "book"
		});
	});
}
