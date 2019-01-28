var clientUtils = {
	
	
	
	// clientUtils.updateLinklist(data);
	updateLinklist : function(data){
		
		
		var content = '';

		var linklistObj = $(
			"#ql-linklist"
		);

		var showAsTablist = true;

		var tablistArray = [];

		var tabindex = 0;
		
		
		if( data.quicklinks )
		{
			$.each(data.quicklinks.users, function(key,val){
				
				if( val.displayName !== "" )
				{
					tabindex++;

					var isActive = false;
					
					if( clientUtilsDefaults.getLastActiveUser && clientUtilsDefaults.getLastActiveUser === key )
					{
						isActive = true;
					} 
					else if( tabindex === 1 ) 
					{
						isActive = true;
					}


					tablistArray.push({
						user : key,
						tabindex : tabindex,
						label : val.displayName,
						active : isActive
					});
					

					var getLinkList = clientUtils.sortJSON(val.links, "tag", "string", true);
					var lastTagCount = 0;
					var lastDisplayingTag = null;
					var lastTagWrapperOpen = false;
					
					content += '<div data-tabindex="' + tabindex + '" class="ql-linklist-content type-user">';
							
						content += showAsTablist ? '' : '<div class="ql-linklist-content-header">' + val.displayName + '</div>';
						content += '<div class="ql-linklist-content-list">';

						for( var i=0; i < getLinkList.length; i++ )
						{
							var currentTag = getLinkList[i].tag;

							if( currentTag !== lastDisplayingTag )
							{
								lastTagCount = 0;
								lastDisplayingTag = currentTag;

								if( lastTagCount === 0 && currentTag !== "" )
								{
									content += '<div class="ql-linklist-content-tag">';
										content += currentTag;
									content += '</div>';
								}
							}
							

							content += '<a class="ql-linklist-content-link" ' + 
											
											'data-name="' + getLinkList[i].name + '" ' + 
											'data-link="' + getLinkList[i].link + '" ' + 
											'data-description="' + getLinkList[i].description + '" ' + 
											'data-tag="' + getLinkList[i].tag + '" ' + 

											'href="' + getLinkList[i].link + '" ' + 
											'title="' + getLinkList[i].description + 
										'">';
								content += '<span class="ql-linklist-content-link-inner">';
									content += getLinkList[i].name;
									content += '<span class="button-remove"></span>';
								content += '</span>';
							content += '</a>';


							lastTagCount++;

						}

						content += '</div>';
					content += '</div>';
				}
				
			});
		} 
		else 
		{
			content += '<div class="ql-linklist-content type-status"></div>';
				content += 'Inhalte nicht verfügbar';
			content += '</div>';
		}
		
		
		linklistObj.html(
			content
		);


		if( showAsTablist )
		{
			if( !linklistObj.hasClass("tablist") )
			{
				linklistObj.addClass("tablist");
			}
				
			clientUtils.initTab(
				linklistObj, 
				tablistArray
			);
		}


		clientUtils.initRemoveEvent(
			linklistObj
		);


		clientUtils.initDragEvents(
			linklistObj
		);
		
		
	},
	
	
	
	// clientUtils.initRemoveEvent();
	initRemoveEvent : function(linklistObj){

		linklistObj.find(
			".ql-linklist-content-list a"
		).off("click.ql-stop-propagation").on("click.ql-stop-propagation", function(event, dataType){

			if( dataType !== "undefined" )
			{
				if( dataType === "delete" )
				{
					event.preventDefault();

					clientUtils.updateToServer({
						removeLink : true, 
						user : clientUtilsDefaults.getLastActiveUser, 
						link : $(this).attr("data-link")
					});
				} 
			}
			else 
			{
				location.href = $(this).attr("href");
			}
			
		}).find(
			".button-remove"
		).off("click.button-remove-stop-propagation").on("click.button-remove-stop-propagation", function(event, dataType){

			event.preventDefault();
			event.stopPropagation();

			if( !(dataType !== "undefined" && dataType === "stopPropagation") )
			{
				$(this).closest("a").trigger("click.ql-stop-propagation", ["delete"]);
			}

		});

	},
	
	
	
	// clientUtils.initDragEvents();
	initDragEvents : function(linklistObj){

		//https://jqueryui.com/draggable/#sortable
		// http://api.jqueryui.com/sortable/#event-update


		var sortObj = linklistObj.find(".ql-linklist-content-list");
		var selectorItemType = ".ql-linklist-content-link";

	    
	    sortObj.sortable({
	    	items : selectorItemType,
			placeholder : "ui-state-highlight",
			update: function( event, ui ) {}
		});

		
		sortObj.disableSelection();

		
		sortObj.on( "sortupdate", function( event, ui ){

			var getSisterObj = ui.item.prev(selectorItemType);

			if( getSisterObj.length === 0 )
			{
				getSisterObj = ui.item.next(selectorItemType);
			}

			if( getSisterObj.length > 0 )
			{
				var qlUserObj = $(
					"form#ql-form"
				).find(
					"input[name='ql_user']"
				);
				
				var qlUser = qlUserObj.val().trim();
				
				qlUser = typeof(qlUser) !== "undefined" && qlUser !== "" ? qlUser : "default";


				var currentNewTag = getSisterObj.attr("data-tag");
				var currentOldTag = ui.item.attr("data-tag");

				if( currentNewTag !== currentOldTag )
				{
					clientUtils.updateToServer({
						forceUpdate : true, 
						user : qlUser, 
						name : ui.item.attr("data-name"), 
						link : ui.item.attr("data-link"), 
						tag : currentNewTag, 
						oldTag : currentOldTag,
						description : ui.item.attr("data-description")
					});
				} 
				else 
				{
					clientUtils.updateToServer({
						wrongMovement : true,
						user : qlUser
					});
				}
			}

		}).on("sortstart", function( event, ui ){

			linklistObj.find(
				".ql-linklist-content-list a .button-remove"
			).trigger(
				"click.button-remove-stop-propagation", 
				["stopPropagation"]
			);

		});
	},
	
	
	
	// clientUtils.initTab();
	initTab : function(linklistObj, tablistArray){

		
		if( linklistObj.find(".ql-tablist").length === 0 )
		{
			linklistObj.prepend(
				'<div class="ql-tablist"></div>'
			);
		}


		var tablistObj = linklistObj.find(
			".ql-tablist"
		);

		var content = '';

		var getPreSelection = '';


		for( var i=0; i < tablistArray.length; i++ )
		{
			if( tablistArray[i].active )
			{
				getPreSelection = tablistArray[i].tabindex;

				clientUtils.pushCurrentUserEvent(
					tablistArray[i].user
				);
			}

			content += '<div class="ql-tablist-label" data-user="' + tablistArray[i].user + '" data-tabindex="' + tablistArray[i].tabindex + '">' + tablistArray[i].label + '</div>';
		}


		tablistObj.html(
			content
		);


		var tablistLabelObj = tablistObj.find(
			".ql-tablist-label"
		);


		if( getPreSelection !== "" )
		{
			tablistObj.find(
				'.ql-tablist-label[data-tabindex="' + getPreSelection + '"]'
			).addClass(
				"active"
			);

			linklistObj.find(
				'.ql-linklist-content[data-tabindex="' + getPreSelection + '"]'
			).addClass(
				"active"
			);
		}



		tablistLabelObj.off("click").on("click", function(){

			
			var thisObj = $(this);
			var getTabIndex = thisObj.attr("data-tabindex");
			var getTabUser = thisObj.attr("data-user");


			tablistLabelObj.removeClass(
				"active"
			);


			thisObj.addClass(
				"active"
			);


			linklistObj.find(
				".ql-linklist-content"
			).removeClass(
				"active"
			);

			linklistObj.find(
				'.ql-linklist-content[data-tabindex="' + getTabIndex + '"]'
			).addClass(
				"active"
			);

			clientUtils.pushCurrentUserEvent(
				getTabUser
			);

		});

	},
	
	
	
	// clientUtils.pushCurrentUserEvent(currentUser);
	pushCurrentUserEvent : function(currentUser){

		clientUtilsDefaults.getLastActiveUser = currentUser;

		$(document).trigger(
			"ql-event-updateuserlist", [currentUser] 
		);

	},
	
	
	
	// clientUtils.updateForm(data);
	updateForm : function(data){
		
		
		var formObj = $(
			"form#ql-form"
		);
			
		// qlLink
		var qlLinkObj = formObj.find(
			"input[name='ql_link']"
		);
		
		// qlUser
		var qlUserObj = formObj.find(
			"input[name='ql_user']"
		);
		
		// qlName
		var qlNameObj = formObj.find(
			"input[name='ql_name']"
		);
		
		// qlTag
		var qlTagObj = formObj.find(
			"input[name='ql_tag']"
		);
		
		// qlDescription
		var qlDescriptionObj = formObj.find(
			"input[name='ql_description']"
		);


		// clean status class and attribute
		$(
			qlLinkObj,
			qlUserObj,
			qlNameObj,
			qlTagObj,
			qlDescriptionObj
		).removeClass(
			clientUtilsDefaults.selectors.statusClassError
		).removeAttr(
			"data-error-message"
		);


		// update user datalist
		var currentUsersOptionFields = '';

		$.each(data.quicklinks.users, function(key, val){

			currentUsersOptionFields += '<option class="proved" value="' + key + '">' + val.displayName + '</option>';

		});

		if( currentUsersOptionFields !== "" )
		{
			qlUserObj.next(
				"#ql-user-list"
			).html(
				currentUsersOptionFields
			);
		}
			
		
		// add status class
		if( data.type_error && (data.type_error == 'link_invalid' || data.type_error == 'link_empty') )
		{
			qlLinkObj.val(
				data.newLink.link
			).attr({
				"data-error-message" : data.status
			}).addClass(
				clientUtilsDefaults.selectors.statusClassError
			);
		}

		
	},
	
	
	
	// clientUtils.updateStatusbar(data);
	updateStatusbar : function(data){

		/*
			Success:
			$.notify("Access granted", "success");

			Info:
			$.notify("Do not press this button", "info");

			Warning:
			$.notify("Warning: Self-destruct in 3.. 2..", "warn");

			Error:
			$.notify("BOOM!", "error");
		*/

		if( data.status )
		{
			$.notify(data.status, "warn");
		} 
		else if( data.type_error === 'unknownuser' )
		{
			$.notify("Dieser Benutzer existiert nicht", "error");
		} 
		else if( data.userSettingsUpdatedSuccess )
		{
			$.notify("Benutzereinstellungen gespeichert", "success");
		}  
		else if( data.removeLinkSuccess )
		{
			$.notify("Link erfolgreich gelöscht", "success");
		} 
		else if( data.newLink === null )
		{
			$.notify("Dieser Link existiert schon", "info");
		} 
		else if( data.newLink && data.newLink.forceUpdate )
		{
			$.notify("Link erfolgreich verschoben", "success");
		} 
		else if( data.newLink )
		{
			$.notify("Link erfolgreich angelegt", "success");
		}
	},
	
	
	
	// clientUtils.updateSiteSettingsByUser();
	updateSiteSettingsByUser : function(data){

		
		var currentUserSettings = null;

		var bodyObj = $("body");

		var btnOpenCloseObj = $(
			".ql-nav-main .btn-open-close"
		);

		bodyObj.attr({
			"style" : ""
		}).removeClass(
			"status-customimage"
		);

		
		if( clientUtilsDefaults.getLastActiveUser )
		{
			currentUserSettings = data.quicklinks.users[clientUtilsDefaults.getLastActiveUser].userSettings;
		} 
		else 
		{
			currentUserSettings = data.quicklinks.users["default"].userSettings;
		}


		clientUtilsDefaults.currentUserSettings = currentUserSettings;


		if( currentUserSettings.backgroundImage )
		{
			bodyObj.attr({
				"style" : "background-image:url(img/fileupload/" + currentUserSettings.backgroundImage + ");"
			}).addClass(
				"status-customimage"
			);
		}


		if( clientUtilsDefaults.initOnceCount === 1 && currentUserSettings.mainNaviOpen )
		{
			var getDataTextOpen = btnOpenCloseObj.attr("data-text-open");
			var getDataTextClose = btnOpenCloseObj.attr("data-text-close");

			bodyObj.addClass(
				currentUserSettings.mainNaviOpen ? "ql-nav-status-open no-transition" : ""
			);

			btnOpenCloseObj.text(
				currentUserSettings.mainNaviOpen ? getDataTextOpen : getDataTextClose
			);
		}

	},
	
	
	
	// clientUtils.initMainNav();
	initMainNav : function(){

		var bodyObj = $("body");
		
		$(
			".ql-nav-main .btn-open-close"
		).on("off").on("click", function(){

			var thisObj = $(this);

			var getDataTextOpen = thisObj.attr("data-text-open");
			var getDataTextClose = thisObj.attr("data-text-close");

			bodyObj.removeClass(
				"no-transition ql-settings-status-open"
			).toggleClass(
				"ql-nav-status-open"
			);

			thisObj.text(
				bodyObj.hasClass("ql-nav-status-open") ? getDataTextOpen : getDataTextClose
			);

			clientUtilsDefaults.currentUserSettings.mainNaviOpen = bodyObj.hasClass("ql-nav-status-open");

			clientUtils.updateToServer({
				user : clientUtilsDefaults.getLastActiveUser, 
				userSettings : clientUtilsDefaults.currentUserSettings,
				userSettingsUpdated : true
			});

		});
		
		$(
			".ql-nav-main .btn-settings"
		).on("off").on("click", function(){

			bodyObj.toggleClass(
				"ql-settings-status-open"
			);

		});

	},
	
	
	
	// clientUtils.initFormEvents();
	initFormEvents : function(){
		
		
		var formObj = $(
			"form#ql-form"
		);


		// qlLink
		var qlLinkObj = formObj.find(
			"input[name='ql_link']"
		);

		// qlUser
		var qlUserObj = formObj.find(
			"input[name='ql_user']"
		);

		// qlUserWrapper
		var qlUserWrapperObj = qlUserObj.closest(
			".ql-user"
		);

		// qlName
		var qlNameObj = formObj.find(
			"input[name='ql_name']"
		);

		// qlTag
		var qlTagObj = formObj.find(
			"input[name='ql_tag']"
		);

		// qlDescription
		var qlDescriptionObj = formObj.find(
			"input[name='ql_description']"
		);

		// qlSubmit
		var qlSubmitObj = formObj.find(
			"input[type='submit']"
		);
			

		
		// standard form submit verhindern
		formObj.submit(function(event){
			
			event.preventDefault();
			
		});


		// init submit button
		qlSubmitObj.on("off").on("click", function(){
			
			
			
			// qlLink
			var qlLink = qlLinkObj.val().trim();
			qlLink = typeof(qlLink) !== "undefined" ? qlLink : "";
			
			
			
			// qlUser
			var qlUser = qlUserObj.val().trim();
			qlUser = typeof(qlUser) !== "undefined" && qlUser !== "" ? qlUser : "default";
			
			
			
			// qlName
			var qlName = qlNameObj.val().trim();
			qlName = typeof(qlName) !== "undefined" ? qlName : "";
			qlName = qlName !== "" ? qlName : qlLink.replace("http://", "").replace("https://", "").replace("www.", "");
			
			
			
			// qlTag
			var qlTag = qlTagObj.val().trim();
			qlTag = typeof(qlTag) !== "undefined" ? qlTag : "";			
			
			
			
			// qlDescription
			var qlDescription = qlDescriptionObj.val().trim();
			qlDescription = typeof(qlDescription) !== "undefined" ? qlDescription : "";
			
			
			clientUtils.updateToServer({
				forceUpdate : false, 
				user : qlUser, 
				name : qlName, 
				link : qlLink, 
				tag : qlTag, 
				description : qlDescription
			});
			
			
			// Eingaben nach submit leeren
			qlNameObj.val('');
			
			qlLinkObj.val('');
			
			qlTagObj.val('');

			qlDescriptionObj.val('');
			
			
		});


		qlUserObj.off(
			"focusin focusout"
		).on("focusin focusout", function(event){

			if( event.type === "focusin" )
			{
				qlUserWrapperObj.addClass("status-focusin")
			}
			else 
			{
				qlUserWrapperObj.removeClass("status-focusin")
			}

		});


		$(
			'<span class="ql-user-emptybutton"></div>'
		).on("off").on("click", function(event){

			qlUserObj.val('').focus();

		}).appendTo(
			qlUserWrapperObj
		);


		$(document).off(
			"ql-event-updateuserlist"
		).on("ql-event-updateuserlist", function( event, currentUser ){

			qlUserObj.val(
				currentUser
			);

		});

		
	},


	
	updateToServer : function(options){

		var settings = $.extend({
			
			removeLink : false, 
			forceUpdate : false,
			wrongMovement : false, 
			user : null, 
			userSettings : null, 
			userSettingsUpdated : false, 
			name : null, 
			link : null, 
			tag : null, 
			oldTag : null,
			description : null
			
		}, options || {} );

		
		// Socket senden
		clientUtilsDefaults.socket.emit(
			"realtimequicklink", { 
				removeLink : settings.removeLink, 
				forceUpdate : settings.forceUpdate, 
				wrongMovement : settings.wrongMovement, 
				user : settings.user, 
				userSettings : settings.userSettings, 
				userSettingsUpdated : settings.userSettingsUpdated, 
				name : settings.name, 
				link : settings.link, 
				tag : settings.tag, 
				oldTag : settings.oldTag, 
				description : settings.description
			}
		);
	},


	/*
		sortJSON(yourJsonObj, "l_name", "string", true);
		sortJSON(yourJsonObj, "sequence", "int", true);
	*/
	sortJSON : function(element, prop, propType, asc) {
	
		switch (propType) {
			
			case "int" :
				
				return element.sort(function (a, b) {
					if (asc) {
						return (parseInt(a[prop]) > parseInt(b[prop])) ? 1 : ((parseInt(a[prop]) < parseInt(b[prop])) ? -1 : 0);
					} else {
						return (parseInt(b[prop]) > parseInt(a[prop])) ? 1 : ((parseInt(b[prop]) < parseInt(a[prop])) ? -1 : 0);
					}
				});

				break;

			default :
				
				return element.sort(function (a, b) {
					if (asc) {
						return (a[prop].toLowerCase() > b[prop].toLowerCase()) ? 1 : ((a[prop].toLowerCase() < b[prop].toLowerCase()) ? -1 : 0);
					} else {
						return (b[prop].toLowerCase() > a[prop].toLowerCase()) ? 1 : ((b[prop].toLowerCase() < a[prop].toLowerCase()) ? -1 : 0);
					}
				});
		}
	}
	
	
};