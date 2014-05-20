// routes.navigation.js
module.exports = function(app, globalware, elseware, kutil) {
	var gware = globalware, mware = elseware,
	    all = gware.methods.concat(kutil.getMethods(mware));

	app.get('/:var(home|index)?',all, function(req, res){
		res.renderPjax('index', {
			page : "index"
		});
	});

	app.get('/book',all, function(req, res) {
		res.renderPjax('book', {
			page: "book"
		});
	});
}
