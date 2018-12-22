"use strict";

(function () {

	let m_refreshIntervalID = null;

	browser.runtime.onMessage.addListener(onMessage);

	//////////////////////////////////////////////////////////////////////
	// browserAction button FIRST update
	startRefreshInterval();

	////////////////////////////////////////////////////////////////////////////////////
	function onMessage(request, sender) {

		switch (request.msgId) {
			case globals.MSG_BKGD_REFRESH_BROWSER_ACTION_ICON:
				refreshBrowserActionIcon().catch(() => { /* There is no iconized progress bar */ });
				break;
				///////////////////////////////////////////////

			case globals.MSG_BKGD_START_REFRESH_INTERVAL:
				startRefreshInterval();
				break;
				///////////////////////////////////////////////
		}
	}

	////////////////////////////////////////////////////////////////////////////////////
	function startRefreshInterval() {

		if(m_refreshIntervalID !== null) {
			clearInterval(m_refreshIntervalID);
			m_refreshIntervalID = null;
		}

		refreshBrowserActionIcon().then((id) => {

			let timeout = 0;

			switch (id) {
				case globals.HTMLID_ELEMENT_DAY:
					timeout = globals.MILLISEC_IN_MINUTE / 2;		// update interval for minutes resolution
					break;
					/////////////////////////////////////////////////////////

				case globals.HTMLID_ELEMENT_MONTH:
				case globals.HTMLID_ELEMENT_YEAR:
				case globals.HTMLID_ELEMENT_LIFE:
				case globals.HTMLID_ELEMENT_USER:
					timeout = globals.MILLISEC_IN_MINUTE * 30;		// update interval for hour/day/year resolutions
					break;
					/////////////////////////////////////////////////////////
			}

			m_refreshIntervalID = setInterval(() => startRefreshInterval(), timeout);

		}).catch(() => { /* There is no iconized progress bar */ });
	}

	////////////////////////////////////////////////////////////////////////////////////
	function refreshBrowserActionIcon() {

		return new Promise((resolve, reject) => {

			prefs.getIconizedProgressBarId().then((id) => {

				if (id === globals.ICONIZED_PROGRESS_BAR_ID_NOT_SET) {
					utils.setBrowserActionDetails(null);
					reject();
				} else {
					calculator.getElapsedPercentageForElementId(id, (new Date())).then((result) => {
						utils.setBrowserActionDetails(result.percent, result.title);
						//console.log("[" + globals.WEB_EXT_NAME + "]", result.title, result.percent);
					});
					resolve(id);
				}
			});
		});
	}

})();
