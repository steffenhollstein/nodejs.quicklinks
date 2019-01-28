// http://www.tutorialsteacher.com/nodejs/nodejs-module-exports
// https://darrenderidder.github.io/talks/ModulePatterns/#/8


/*
	Example to use:
	-----------------------------
	var utilsPublic = require('./server.utils.initPublic.js');

	utilsPublic(app, express, conf);
*/
module.exports = function(app, express, conf){
			
			
	// statische Dateien ausliefern
	app.use(
		express.static(
			__dirname + conf.publicPath
		)
	);


	// wenn der Pfad "/" aufgerufen wird
	app.get('/', function (req, res) {
		
		// so wird die Datei index.html ausgegeben
		res.sendfile(
			__dirname + conf.publicPath + conf.publicStartPage
		);
		
	});
	
	
}