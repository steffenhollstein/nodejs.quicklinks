var clientUtilsDefaults = {
	
	// WebSocket
	socket : io(location.protocol + '//' + location.hostname + ':' + location.port),
	
	selectors : {
		statusClassError : "error"
	},

	notifyOptions : {
		style: 'quicklinks',
		showDuration : 200,
		autoHideDelay : 3000
	},

	initOnceCount : 0,

	getLastActiveUser : null,
	currentUserSettings : null,

	notifyOptionsCustomStyle : {
		html: "<div>\n<span data-notify-text></span>\n</div>",
		classes: {
			base: {
				"font-weight": "bold",
				"padding": "0.55rem 1.15rem",
				"text-shadow": "0 0.0625rem 0 rgba(255, 255, 255, 0.5)",
				"background-color": "#fcf8e3",
				"border": "0.125rem solid #fbeed5",
				"border-radius": "0",
				"white-space": "nowrap",
				"padding-left": "1rem",
				"background-repeat": "no-repeat",
				"background-position": "3px 7px"
			},
			error: {
				"color": "#B94A48",
				"background-color": "#F2DEDE",
				"border-color": "#EED3D7",
				"background-image": "none"
			},
			success: {
				"color": "#468847",
				"background-color": "#DFF0D8",
				"border-color": "#D6E9C6",
				"background-image": "none"
			},
			info: {
				"color": "#3A87AD",
				"background-color": "#D9EDF7",
				"border-color": "#BCE8F1",
				"background-image": "none"
			},
			warn: {
				"color": "#C09853",
				"background-color": "#FCF8E3",
				"border-color": "#FBEED5",
				"background-image": "none"
			}
		}
	}

};