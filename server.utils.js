// http://www.tutorialsteacher.com/nodejs/nodejs-module-exports
// https://darrenderidder.github.io/talks/ModulePatterns/#/8
/*
	Example to use:
	-----------------------------------
	var serverInit = require('./server.utils.js');

	serverInit(
		express, 
		app, 
		io, 
		conf, 
		confDB, 
		fs, 
		path, 
		logError, 
		logDebug, 
		logSocket
	);
*/
module.exports = function(express, app, io, conf, confDB, fs, path, logError, logDebug, logSocket){


	
	var methods = {



		globalOptions : {
			
			// inspired by <http://mathiasbynens.be/demo/url-regex>
			regexRules : {
				linkCheckStandard : new RegExp(
					/((([0-9a-z_-]+\.)+([a-z]{2,4})(:[0-9]+)?((\/([~0-9a-zA-Z\#\+\%@\.\/_-]+))?(\?[0-9a-zA-Z\+\%@\/&\[\];=_-]+)?)?))\b/
				),
				linkCheckProtocol : new RegExp(
					/(ftp|http|https):\/\//
				)
			},
			
			databaseTempJSON : confDB.database.savingDataJsonDefault,
			dbIntervalSavingCounter : 0
			
		},
		
		
		
		startingServer : function(){


			// Websocket
			//io.sockets.on('connection', function(socket){
			io.on('connection', function(client){


				// der Client ist verbunden
				client.emit(
					"realtimequicklink", { 
						status : conf.localizationStrings.clientConnected, 
						quicklinks : methods.globalOptions.databaseTempJSON
					}
				);
				
				
				// wenn Benutzer einen Text senden
				client.on("realtimequicklink", function(data_realtime) {

					
					var serverCheckData = require('./server.utils.checkData.js');

					var checkData = serverCheckData(
						data_realtime,
						methods.globalOptions
					);
					

					if( checkData.userExist )
					{
						// update user settings
						if( data_realtime.userSettings && data_realtime.userSettingsUpdated )
						{
							if( data_realtime.userSettings.backgroundImage )
							{
								data_realtime.userSettings.backgroundImage = data_realtime.userSettings.backgroundImage;
							}

							methods.globalOptions.databaseTempJSON.users[data_realtime.user].userSettings = data_realtime.userSettings;
						
						}

						
						// delete link
						if( data_realtime.removeLink )
						{
							methods.dbRemoveData(
								checkData.userDataFinalized,
								true
							);
						} 

						if( !data_realtime.wrongMovement )
						{
							if( checkData.currentLinkIsNew && checkData.currentLinkIsValid )
							{
								// delete old item first
								if( data_realtime.forceUpdate )
								{
									methods.dbRemoveData(
										checkData.userDataFinalized,
										false
									);
								} 

								// Daten vom Client in temporäres JSON schreiben
								methods.globalOptions.databaseTempJSON.users[data_realtime.user].links.push(
									checkData.userDataFinalized
								);
									
							}
						}
					}
						
					// Aktualisierung an alle Benutzer schicken
					methods.updateToClient(
						checkData.userDataFinalized,
						checkData,
						methods.globalOptions.databaseTempJSON
					);

					
				});
				
				
			});

			
		},
		
		
		
		
		updateToClient : function(data, checkData, databaseTempJSON){
			
			
			var json = {
				quicklinks : databaseTempJSON,
				status : null,
				type_error : null,
				newLink : null,
				removeLinkSuccess : false,
				userSettingsUpdatedSuccess : false
			};
			
			
			if( !checkData.userExist )
			{
				json.type_error = "unknownuser";
			} 
			else if( data.userSettings && data.userSettingsUpdated )
			{
				json.userSettingsUpdatedSuccess = true;
			}  
			else if( data.removeLink )
			{
				json.removeLinkSuccess = true;
			}  
			else if( data.wrongMovement )
			{
				json.status = conf.localizationStrings.error.linkWrongMovement;
			}  
			else if( !checkData.currentLinkIsNew )
			{
				json.status = conf.localizationStrings.error.linkAlreadyInUse;
			} 
			else if( !checkData.currentLinkIsValid )
			{
				if( checkData.currentLinkIsEmpty )
				{
					json.status = conf.localizationStrings.error.emptyLink;
					json.type_error = "link_empty";
				} 
				else 
				{
					json.status = conf.localizationStrings.error.linkNotValid;
					json.type_error = "link_invalid";
				}
				
				json.newLink = {
					forceUpdate : data.forceUpdate, 
					user : data.user || "default", 
					name : data.name, 
					link : data.link, 
					tag : data.tag, 
					description : data.description || conf.localizationStrings.error.noDescriptionAvailable
				};
			} 
			else 
			{
				json.newLink = {
					forceUpdate : data.forceUpdate, 
					user : data.user || "default", 
					name : data.name, 
					link : data.link, 
					tag : data.tag, 
					description : data.description || conf.localizationStrings.error.noDescriptionAvailable
				};
			}
			
			
			io.sockets.emit(
				"realtimequicklink", 
				json
			);
			
			
		},
		

		
		dbGetInitialData : function(){


			fs.readFile(confDB.database.fileName, 'utf8', function(err,filedata){
				
				if( err )
				{
					logDebug.info(
						"local file <" + confDB.database.fileName + "> doesn't exist. creating a new file."
					);
					
					// Daten initial in JSON-Datei schreiben
					methods.dbUpdate(
						methods.globalOptions.databaseTempJSON
					);
				} 
				else if( filedata.length > 0 )
				{
					logDebug.info(
						"init() success. File data pushed to databaseTempJSON"
					);

					methods.globalOptions.databaseTempJSON = JSON.parse(filedata);
				}


				methods.startingServer();

				methods.dbIntervalSaving();
				
				
			});
			
		},
		
		
		
		dbIntervalSaving : function(){

			setInterval(function(){

				// Daten vom Client in JSON-Datei schreiben
				methods.dbUpdate(
					methods.globalOptions.databaseTempJSON
				);
				
				if( methods.globalOptions.dbIntervalSavingCounter == 0 )
				{
					methods.globalOptions.dbIntervalSavingCounter = 1;
					
					logDebug.info(
						'temp data saved (every ' + confDB.database.savingDataInterval + ' ms) to file (' + confDB.database.fileName + ')'
					);
				}
				
			}, confDB.database.savingDataInterval );

		},

		
		
		dbUpdate : function(data){
			
			// Datei schreiben
			fs.writeFileSync(confDB.database.fileName, JSON.stringify(data), function(err){
				
				if( err ){
					logError.error(err);
				} else {
					logDebug.info("JSON file updated");
				}
				
			});
			
		},

		
		
		dbRemoveData : function(data, removeOnly){
			
			var tempLinks = methods.globalOptions.databaseTempJSON.users[data.user].links;

			var count = 0;

			if( removeOnly )
			{
				for( var i=0; i < tempLinks.length; i++ ){

					if( tempLinks[i].link === data.link )
					{
						var removed = tempLinks.splice(
							count, 1
						);

						break;
					}

					count++;

				}
			} 
			else 
			{
				for( var i=0; i < tempLinks.length; i++ ){

					if( tempLinks[i].tag === data.oldTag && tempLinks[i].link === data.link )
					{
						var removed = tempLinks.splice(
							count, 1
						);

						break;
					} 

					count++;

				}
			}
			
		}
		
	};


	methods.dbGetInitialData();
	

}