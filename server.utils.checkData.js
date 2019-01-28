// http://www.tutorialsteacher.com/nodejs/nodejs-module-exports
// https://darrenderidder.github.io/talks/ModulePatterns/#/8


/*
	Example to use:
	-----------------------------
	var serverCheckData = require('./server.utils.checkData.js');

	var checkData = serverCheckData(
		userData,
		globalOptions
	);
*/
module.exports = function(userData, globalOptions){
			
	var returnObj = {
		currentLinkList : [],
		currentLinkIsNew : true,
		currentLinkIsValid : globalOptions.regexRules.linkCheckStandard.test(
			userData.link
		),
		currentLinkContainsProtocol : globalOptions.regexRules.linkCheckProtocol.test(
			userData.link
		),
		currentLinkIsEmpty : (
			userData.link == "" ? true : false
		),
		userExist : false,
		userDataFinalized : userData
	};


	// add protocol if not entered
	if( !returnObj.currentLinkContainsProtocol && returnObj.currentLinkIsValid )
	{
		returnObj.userDataFinalized.link = "http://" + userData.link;
	}

	
	if( typeof(globalOptions.databaseTempJSON.users[userData.user]) !== "undefined" )	
	{
		
		returnObj.userExist = true;
		returnObj.currentLinkList = globalOptions.databaseTempJSON.users[userData.user].links;
		

		if( returnObj.currentLinkList.length > 0 )
		{
			for( var i=0; i < returnObj.currentLinkList.length; i++ )
			{
				if( 
					!userData.forceUpdate && 
					returnObj.currentLinkList[i].link === userData.link 
				){
					returnObj.currentLinkIsNew = false;
					break;
				}
			}
		}
	}
	
	
	return returnObj;
	
	
}