"use strict";

/***************************************/
let globals = (function () {

	let manifest = browser.runtime.getManifest();

	return {
		MSG_PREF_HIGHLIGHT_PREFERENCE: "_msgPref_highlightPreference_",
		MSG_BKGD_REFRESH_BROWSER_ACTION_ICON: "_msgBkgd_refreshBrowserActionIcon_",
		MSG_BKGD_START_REFRESH_INTERVAL: "_msgBkgd_startRefreshInterval_",

		HTMLID_ELEMENT_DAY: "pBarDay",
		HTMLID_ELEMENT_MONTH: "pBarMonth",
		HTMLID_ELEMENT_YEAR: "pBarYear",
		HTMLID_ELEMENT_LIFE: "pBarLife",
		HTMLID_ELEMENT_USER: "pBarUser",

		WEB_EXT_NAME: manifest.name,
		WEB_EXT_VERSION: manifest.version,
		GEO_LOCATION_NOT_SET: "_geoLocationNotSet_",
		URL_WHO_LIFE_EXPECTANCY_DATA: "/data/WHO2016data.json",
		ICONIZED_PROGRESS_BAR_ID_NOT_SET: "_iconizedProgressBarIdNotSet_",
		MILLISEC_IN_MINUTE: 60000,
		MILLISEC_IN_DAY: 86400000,
		MILLISEC_IN_YEAR: 31536000000,       // ignoring leap years
	}
})();

/***************************************/
let calculator = (function () {

	////////////////////////////////////////////////////////////////////////////////////
	function getElapsedPercentageForElementId(id, now) {

		return new Promise((resolve) => {

			let calcFunc;

			switch (id) {
				case globals.HTMLID_ELEMENT_DAY:	calcFunc = getDayElapsedPercentage;		break;
				case globals.HTMLID_ELEMENT_MONTH:	calcFunc = getMonthElapsedPercentage;	break;
				case globals.HTMLID_ELEMENT_YEAR:	calcFunc = getYearElapsedPercentage;	break;
				case globals.HTMLID_ELEMENT_LIFE:	calcFunc = getLifeElapsedPercentage;	break;
				case globals.HTMLID_ELEMENT_USER:	calcFunc = getUserElapsedPercentage;	break;
			}

			calcFunc(now).then((result) => resolve(result));
		});
	}

	////////////////////////////////////////////////////////////////////////////////////
	function getDayElapsedPercentage(now) {

		return new Promise((resolve) => {

			prefs.getDayStart().then((start) => {
				prefs.getDayEnd().then((end) => {
					let total = (end - start) * 60;                                  // minutes in day
					let elapsed = (now.getHours() - start) * 60 + now.getMinutes();  // minutes elapsed
					let percent = presentationalPercentageRounding(elapsed * 100 / total);

					resolve({ percent: percent, title: "Your Day" });
				})
			});
		});
	}

	////////////////////////////////////////////////////////////////////////////////////
	function getMonthElapsedPercentage(now) {

		return new Promise((resolve) => {

			let total = (new Date(now.getFullYear(), now.getMonth(), 0)).getDate() * 24;    // hours in this month
			let elapsed = ((now.getDate() - 1) * 24) + now.getHours();                      // hours elapsed
			let percent = presentationalPercentageRounding(elapsed * 100 / total);

			resolve({ percent: percent, title: "Your Month" });
		});
	}

	////////////////////////////////////////////////////////////////////////////////////
	function getYearElapsedPercentage(now) {

		return new Promise((resolve) => {

			let total = (isLeapYear(now.getFullYear()) ? 366 : 365);                                            // days in this year
			let elapsed = Math.ceil((now - (new Date(now.getFullYear(), 0, 1))) / globals.MILLISEC_IN_DAY);     // days elapsed
			let percent = presentationalPercentageRounding(elapsed * 100 / total);

			resolve({ percent: percent, title: "Your Year" });
		});
	}

	////////////////////////////////////////////////////////////////////////////////////
	function getLifeElapsedPercentage(now) {

		return new Promise((resolve) => {

			prefs.getGeoLocation().then((geoLocation) => {
				prefs.getDateOfBirth().then((dateOfBirth) => {

					if (geoLocation !== globals.GEO_LOCATION_NOT_SET && utils.isValidBirthDate(dateOfBirth)) {

						prefs.getGender().then((gender) => {
							utils.getJsonTextData(globals.URL_WHO_LIFE_EXPECTANCY_DATA).then((jsonText) => {

								let whoData = JSON.parse(jsonText);
								let nodes = getLifeExpectancyNode(geoLocation, whoData);
								let years = Object.getOwnPropertyDescriptor(nodes[0], gender);

								let total = years.value;                                                            // expectancy years
								let elapsed = Math.floor((now - new Date(dateOfBirth)) / globals.MILLISEC_IN_YEAR); // years elapsed - ignoring leap years
								let percent = presentationalPercentageRounding(elapsed * 100 / total);

								resolve({ percent: percent, title: "Your Life" });
							});
						});

					} else {
						resolve({ percent: null });
					}
				});
			});
		});
	}

	////////////////////////////////////////////////////////////////////////////////////
	function getUserElapsedPercentage(now) {

		return new Promise((resolve) => {

			prefs.getUserTitle().then((title) => {
				prefs.getUserStartDate().then((startDate) => {
					prefs.getUserEndDate().then((endDate) => {

						let percent;

						if (title !== "" && utils.isValidDate(startDate) && utils.isValidDate(endDate) && endDate > startDate) {

							let total = ((new Date(endDate)) - (new Date(startDate))) / globals.MILLISEC_IN_DAY;   // days in range
							let elapsed = (now - (new Date(startDate))) / globals.MILLISEC_IN_DAY;                   // days elapsed
							percent = presentationalPercentageRounding(elapsed * 100 / total);
						} else {
							percent = null;
						}
						resolve({ percent: percent, title: title });
					});
				});
			});
		});
	}

	////////////////////////////////////////////////////////////////////////////////////
	function isLeapYear(year) {
		return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
	}

	////////////////////////////////////////////////////////////////////////////////////
	function getLifeExpectancyNode(name, whoData) {

		let node, nodes = [];

		for (let n in whoData) {

			if (!whoData.hasOwnProperty(n)) {
				continue;
			}

			node = whoData[n];

			if (typeof node === 'object') {
				if (node.hasOwnProperty("name") && node.name === name) {
					nodes.push(node);
				} else {
					nodes = nodes.concat(getLifeExpectancyNode(name, node));
				}
			}
		}
		return nodes;
	}

	////////////////////////////////////////////////////////////////////////////////////
	// For presentational reasons percentages between 0-1 and between 99-100 are rounded to 1 and 100 respectively.
	function presentationalPercentageRounding(percent) {

		if (percent > 0.0 && percent < 1.0) {
			return 1;
		} else if (percent > 99.0 && percent < 100.0) {
			return 99;
		} else {
			return Math.min(Math.max(Math.round(percent), 0), 100);
		}
	}

	return {
		getElapsedPercentageForElementId: getElapsedPercentageForElementId,
		getDayElapsedPercentage: getDayElapsedPercentage,
		getMonthElapsedPercentage: getMonthElapsedPercentage,
		getYearElapsedPercentage: getYearElapsedPercentage,
		getLifeElapsedPercentage: getLifeElapsedPercentage,
		getUserElapsedPercentage: getUserElapsedPercentage,
	}

})();

/***************************************/
let utils = (function () {

	////////////////////////////////////////////////////////////////////////////////////
	function getJsonTextData(url) {

		return new Promise((resolve) => {

			let xhr = new XMLHttpRequest();

			xhr.overrideMimeType("application/json");
			xhr.open("GET", url);
			xhr.onload = function () {
				if (xhr.readyState === xhr.DONE && xhr.status === 200) {
					resolve(xhr.responseText);
				}
			};
			xhr.send();
		});
	}

	////////////////////////////////////////////////////////////////////////////////////
	function isValidDate(value) {

		let dateVal = new Date(value);

		return (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
			dateVal !== undefined &&
			!isNaN(dateVal) &&
			(dateVal instanceof Date));
	}

	////////////////////////////////////////////////////////////////////////////////////
	function isValidBirthDate(value) {
		return (isValidDate(value) && (new Date(value)) < (new Date()));
	}

	//////////////////////////////////////////////////////////////////////
	function blinkElement(elm, interval, duration) {

		elm.style.opacity = (elm.style.opacity ^ 1).toString();		// bitwise flip

		if (duration > 0) {
			setTimeout(() => blinkElement(elm, interval, duration - interval), interval);
		} else {
			elm.style.opacity = "1";
		}
	}

	////////////////////////////////////////////////////////////////////////////////////
	function disableElementTree(elm, value) {

		if (elm.nodeType !== Node.ELEMENT_NODE) {
			return;
		}

		for (let i in elm.children) {
			disableElementTree(elm.children[i], value);
		}

		if (elm.disabled !== undefined) {
			elm.disabled = value;
		}

		if (value === true) {
			elm.classList.add("disabled");
		} else {
			elm.classList.remove("disabled");
		}
	}

	////////////////////////////////////////////////////////////////////////////////////
	function getPercentImageData(percent) {

		const id = "tytCanvasElapsedPercentage";
		const bg = "#000000";
		const fg = "#FFCF75";


		let cnvs = document.getElementById(id);

		if(cnvs === null) {
			cnvs = document.createElement("canvas");
			cnvs.id = id;
			cnvs.width = cnvs.height = 16;
		}

		const ctx = cnvs.getContext("2d");

		// background
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, cnvs.width, cnvs.height);

		if (/^\d{1,3}%$/.test(percent)) {

			// percent text
			ctx.fillStyle = fg;
			ctx.font = "10pt " + (percent === "100%" ? "Segoe UI" : "serif");
			ctx.fillText(percent, 0.5, 13, cnvs.width - 0.5);
		}

		return ctx.getImageData(0, 0, cnvs.width, cnvs.height);
	}

	////////////////////////////////////////////////////////////////////////////////////
	function setBrowserActionDetails(percent, title) {

		let iconDetails, titleDetails;

		if(percent === null) {
			iconDetails = {};
			titleDetails = { title: null };
		} else {
			iconDetails = { imageData: utils.getPercentImageData(percent + "%") };
			titleDetails = { title: globals.WEB_EXT_NAME + " - " + title };
		}

		browser.browserAction.setIcon(iconDetails);
		browser.browserAction.setTitle(titleDetails);
	}

	////////////////////////////////////////////////////////////////////////////////////
	function getBrowserVersion() {
		return new Promise((resolve) => {
			browser.runtime.getBrowserInfo().then((result) => {
				resolve(result.version);
			});
		});
	}

	return {
		getJsonTextData: getJsonTextData,
		isValidDate: isValidDate,
		isValidBirthDate: isValidBirthDate,
		blinkElement: blinkElement,
		disableElementTree: disableElementTree,
		getPercentImageData: getPercentImageData,
		setBrowserActionDetails: setBrowserActionDetails,
		getBrowserVersion: getBrowserVersion,
	}

})();
