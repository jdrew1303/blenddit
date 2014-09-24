// routes.navigation.js
module.exports = function(app, globalware, elseware, kutil) {
	var gware = globalware, mware = elseware,
	    all = gware.methods.concat(kutil.getMethods(mware));

	app.get('/:var(home|index)?',gware.visitor, function(req, res){
		res.renderPjax('index', {
			page : "index"
		});
	});

	app.get('/book',gware.visitor, function(req, res) {
		res.renderPjax('book', {
			page: "book"
		});
	});

	app.get('/lists',gware.visitor, function(req, res) {
		var fs = require('fs'), json = {};
		fs.readFile(require('path').dirname(require.main.filename)+'/listsjs.json', 'utf8', function (err, data) {
		  if (err) { return console.log(err); }
		  json.listsJSON = JSON.parse(data);
		  res.renderPjax('lists', json);	
		});
	});
}
