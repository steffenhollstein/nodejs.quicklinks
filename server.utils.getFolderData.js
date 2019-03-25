// http://www.tutorialsteacher.com/nodejs/nodejs-module-exports
// https://darrenderidder.github.io/talks/ModulePatterns/#/8


/*
	Example to use:
	-----------------------------
	var getFolderData = require('./server.utils.getFolderData.js');

	var testData = getFolderData(
		fs, path, confDB.database.path
	);

	logDebug.info(
		"testData: ", testData
	);
*/
module.exports = function(fs, path, currentPath){
	
	
	var returnData = [];

			
	fs.readdir(currentPath, function (err, files) {
		    
	    if (err) 
	    {
	    	/*console.error(
				err
			);*/

	        throw err;
	    }

	    files.map(function (file) {
	        
	        return path.join(currentPath, file);

	    }).filter(function (file) {

	        return fs.statSync(file).isFile();

	    }).forEach(function (file) {

	        fs.readFileSync(file, 'utf8', function(err,filedata){
		
				if( err )
				{
					/*console.error(
						"local file <" + file + "> could not be loaded."
					);*/
				} 
				else if( filedata.length > 0 )
				{
					// JSON String zu JSON Object umwandeln
					returnData.push(
						JSON.parse(filedata)
					);
				}
				
			});

	    });

	});
	
	
	return returnData;

	
}
