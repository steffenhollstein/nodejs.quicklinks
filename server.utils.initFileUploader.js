// http://www.tutorialsteacher.com/nodejs/nodejs-module-exports
// https://darrenderidder.github.io/talks/ModulePatterns/#/8


/*
	Example to use:
	-----------------------------
	var utilsFileUploader = require('./server.utils.initFileUploader.js');

	utilsFileUploader(app, path, fs, formidable, conf, logError, logDebug, logSocket);
*/
module.exports = function(app, path, fs, formidable, conf, logError, logDebug, logSocket){
			
			
	app.post(conf.fileUploader.pathTemp, function(req, res){

		
		// create an incoming form object
		var form = new formidable.IncomingForm();

		
		// specify that we want to allow the user to upload multiple files in a single request
		form.multiples = conf.fileUploader.allowMultiples;

		
		// store all uploads in the /uploads directory
		form.uploadDir = path.join(
			__dirname + conf.publicPath + conf.fileUploader.path
		);

		// every time a file has been uploaded successfully,
		// rename it to it's orignal name
		form.on('file', function(field, file) {
			
			fs.rename(file.path, path.join(form.uploadDir, file.name));

		});


		// log any errors that occur
		form.on('error', function(err) {
			logError.error('File Uploader. An error has occured: \n' + err);
		});


		// once all the files have been uploaded, send a response to the client
		form.on('end', function() {
			res.end('success');
		});


		// parse the incoming request containing the form data
		form.parse(req);


	});
	
	
}