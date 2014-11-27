// routes.navigation.js
module.exports = function(app, globalware, elseware, kutil) {
	var gware = globalware, mware = elseware,
	    all = gware.methods.concat(kutil.getMethods(mware)),
	    fs = require('fs');

	app.get('/:var(home|index)?',gware.visitor, function(req, res){
		res.renderPjax('index', {
			page : "index"
		});
	});

	app.get('/merger',gware.visitor, function(req, res) {
		var json = {};
		fs.readFile(require('path').dirname(require.main.filename)+'/teams.json', 'utf8', function (err, data) {
		  if (err) { return console.log(err); }
		  json.teams = JSON.parse(data);
		  res.renderPjax('merger', json);	
		});
	});

	app.get('/lists',gware.visitor, function(req, res) {
		var json = {};
		fs.readFile(require('path').dirname(require.main.filename)+'/listsjs.json', 'utf8', function (err, data) {
		  if (err) { return console.log(err); }
		  json.listsJSON = JSON.parse(data);
		  res.renderPjax('lists', json);	
		});
	});
}
