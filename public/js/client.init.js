clientUtilsDefaults.socket.on('realtimequicklink', function(data){

	$(function(){

		clientUtilsDefaults.initOnceCount++;
		
		clientUtils.updateLinklist(
			data
		);
		
		clientUtils.updateStatusbar(
			data
		);
		
		clientUtils.updateForm(
			data
		);
		
		clientUtils.updateSiteSettingsByUser(
			data
		);

	});

});



$(function(){

	
	$.notify.addStyle( 
		"quicklinks",
		clientUtilsDefaults.notifyOptionsCustomStyle 
	);


	$.notify.defaults( 
		clientUtilsDefaults.notifyOptions 
	);


	clientUtils.initFormEvents();


	clientUtils.initMainNav();


	/* TEST:
	$.notify("Access granted", "success");

	$.notify("Do not press this button", "info");

	$.notify("Warning: Self-destruct in 3.. 2..", "warn");

	$.notify("BOOM!", "error");
	*/

	

});