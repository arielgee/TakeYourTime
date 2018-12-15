"use strict";

/***************************************/
let globals = (function() {

    return {
        GEO_LOCATION_NOT_SET: "_geoLocationNotSet_",
		URL_WHO_LIFE_EXPECTANCY_DATA: "/data/WHO2016data.json",
		ICONIZED_PROGRESS_BAR_ID_NOT_SET: "_iconizedProgressBarIdNotSet_",
        MILLISEC_IN_DAY: 86400000,
		MILLISEC_IN_YEAR: 31536000000,       // ignoring leap years
    }
})();


/***************************************/
let utils = (function() {

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

		if(duration > 0) {
			setTimeout(() => blinkElement(elm, interval, duration-interval), interval);
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
	};

    return {
		getJsonTextData: getJsonTextData,
		isValidDate: isValidDate,
		isValidBirthDate: isValidBirthDate,
		blinkElement: blinkElement,
		disableElementTree: disableElementTree,
    }
})();