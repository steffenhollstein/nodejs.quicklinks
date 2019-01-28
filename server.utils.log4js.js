// http://www.tutorialsteacher.com/nodejs/nodejs-module-exports
// https://darrenderidder.github.io/talks/ModulePatterns/#/8
module.exports = function(conf, log4js, io){


	
	log4js.configure({
		replaceConsole : true,
		appenders : [
			{ 
				type : 'console', 
				category : ['trace', 'debug', 'info', 'warn'] 
			}, { 
				type : 'file', 
				filename : conf.log.fileNameError, 
				category : ['error', 'fatal'],
				maxLogSize : conf.log.maxLogSize,
				backups : conf.log.backups
			}, { 
				type : 'file', 
				filename : conf.log.fileNameDebug, 
				category : ['trace', 'debug', 'info', 'warn'],
				maxLogSize : conf.log.maxLogSize,
				backups : conf.log.backups 
			}, { 
				type : 'file', 
				filename : conf.log.fileNameSocket, 
				category : ['socket'],
				maxLogSize : conf.log.maxLogSize,
				backups : conf.log.backups 
			}
		]
	});



	io.on("configure", function(configure){
		
		io.set(
			'log', 
			false
		);
		
		io.set(
			'log level', 
			log4js.levels.WARN
		);
		
		io.set(
			'logger', 
			logger_socket
		);
		
	});
	


	return {
		lggE : log4js.getLogger(
			'error'
		), 
		lggD : log4js.getLogger(
			'debug'
		), 
		lggS : log4js.getLogger(
			'socket'
		)
	}
}
