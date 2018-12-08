"use strict";

/***************************************/
let globals = (function() {

    return {
        GEO_LOCATION_NOT_SET: "_geoLocationNotSet_",
        URL_WHO_LIFE_EXPECTANCY_DATA: "/data/WHO2016data.json",
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
	function isValidBirthDate(value) {

		let dateVal = new Date(value);

		return (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value) &&
			dateVal !== undefined &&
			!isNaN(dateVal)	&&
			(dateVal instanceof Date) &&
			dateVal < (new Date()));
	}

	//////////////////////////////////////////////////////////////////////
	//
	function blinkElement(elm, orgVisibility, interval, duration) {

		elm.style.visibility = (elm.style.visibility === "hidden" ? orgVisibility : "hidden");

		if(duration > 0) {
			setTimeout(blinkElement, interval, elm, orgVisibility, interval, duration-interval);
		} else {
			elm.style.visibility = orgVisibility;
		}
	}

    return {
        getJsonTextData: getJsonTextData,
		isValidBirthDate: isValidBirthDate,
		blinkElement: blinkElement,
    }
})();