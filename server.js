// Der Wert einer Konstanten kann nicht verärdert werden durch Zuweisung oder Neudeklaration.
const express 	= require('express');
const app 		= express(); 
const http 		= require('http'); 
const server 	= http.createServer(app); 
const io 		= require('socket.io').listen(server);
const conf 		= require('./config.json');
const confDB 	= require('./config.db.json');
const fs      	= require('fs');
const log4js 	= require('log4js');
const path 		= require("path");
const formidable = require('formidable');


var utilsLogger = require('./server.utils.log4js.js'),
	utilsLoggerTypes = utilsLogger(conf, log4js, io),
	logError = utilsLoggerTypes.lggE, 
	logDebug = utilsLoggerTypes.lggD, 
	logSocket = utilsLoggerTypes.lggS;


conf.ip = process.env.IP || conf.ip;
conf.port = process.env.PORT || conf.port;




// start application
//server.listen(conf.port, conf.ip, function(){
server.listen(conf.port, function(){


	/*
		init utils
	*/
	var utilsInit = require('./server.utils.js');

	utilsInit(express, app, io, conf, confDB, fs, path, logError, logDebug, logSocket);


	
	/*
		public folder
	*/
	var utilsPublic = require('./server.utils.initPublic.js');

	utilsPublic(app, express, conf);


	
	/*
		file uploader
	*/
	var utilsFileUploader = require('./server.utils.initFileUploader.js');

	utilsFileUploader(app, path, fs, formidable, conf, logError, logDebug, logSocket);
 


	/* 
		IPv6: without an address parameter in the listen function, Node will bind it to any address, related to the address 0.0.0.0 of IPV4, and corresponding to :: in IPV6. And this IPv6 unspecified address, 0:0:0:0:0:0:0:0, is reduced to ::,
	*/
	var port = server.address().port
	
	require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        logDebug.info('App is listening at http://%s:%s', add, port);
    });



	
});