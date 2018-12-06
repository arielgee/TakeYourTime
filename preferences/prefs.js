"use strict";

let prefs = (function() {

	// user preferences

	const PREF_DEF_GEO_LOCATION_VALUE = "_geoLocationNotSet_";
	const PREF_DEF_DATE_OF_BIRTH_VALUE = "";
	const PREF_DEF_GENDER_VALUE = "bothSexes";

	const PREF_GEO_LOCATION_KEY = "pref_geoLocation";
	const PREF_DATE_OF_BIRTH_KEY = "pref_dateOfBirth";
	const PREF_GENDER_KEY = "pref_gender";

	//////////////////////////////////////////////////////////////////////
	function getGeoLocation() {

		return new Promise((resolve) => {

			browser.storage.local.get(PREF_GEO_LOCATION_KEY).then((result) => {
				resolve(result[PREF_GEO_LOCATION_KEY] === undefined ? PREF_DEF_GEO_LOCATION_VALUE : result[PREF_GEO_LOCATION_KEY]);
			});
		});
	}

	//////////////////////////////////////////////////////////////////////
	function setGeoLocation(value) {

		let obj = {};
		obj[PREF_GEO_LOCATION_KEY] = value;
		browser.storage.local.set(obj);
	}

	//////////////////////////////////////////////////////////////////////
	function getDateOfBirth() {

		return new Promise((resolve) => {

			browser.storage.local.get(PREF_DATE_OF_BIRTH_KEY).then((result) => {
				resolve(result[PREF_DATE_OF_BIRTH_KEY] === undefined ? PREF_DEF_DATE_OF_BIRTH_VALUE : result[PREF_DATE_OF_BIRTH_KEY]);
			});
		});
	}

	//////////////////////////////////////////////////////////////////////
	function setDateOfBirth(value) {

		let obj = {};
		obj[PREF_DATE_OF_BIRTH_KEY] = value;
		browser.storage.local.set(obj);
	}

	//////////////////////////////////////////////////////////////////////
	function getGender() {

		return new Promise((resolve) => {

			browser.storage.local.get(PREF_GENDER_KEY).then((result) => {
				resolve(result[PREF_GENDER_KEY] === undefined ? PREF_DEF_GENDER_VALUE : result[PREF_GENDER_KEY]);
			});
		});
	}

	//////////////////////////////////////////////////////////////////////
	function setGender(value) {

		let obj = {};
		obj[PREF_GENDER_KEY] = value;
		browser.storage.local.set(obj);
	}

	//////////////////////////////////////////////////////////////////////
	function restoreDefaults() {
		this.setGeoLocation(PREF_DEF_GEO_LOCATION_VALUE);
		this.setDateOfBirth(PREF_DEF_DATE_OF_BIRTH_VALUE);
		this.setGender(PREF_DEF_GENDER_VALUE)

		return {
			geoLocation: PREF_DEF_GEO_LOCATION_VALUE,
			dateOfBirth: PREF_DEF_DATE_OF_BIRTH_VALUE,
			gender: PREF_DEF_GENDER_VALUE,
		};
	}

	return {
		PREF_DEF_GEO_LOCATION_VALUE: PREF_DEF_GEO_LOCATION_VALUE,
		PREF_DEF_DATE_OF_BIRTH_VALUE: PREF_DEF_DATE_OF_BIRTH_VALUE,
		PREF_DEF_GENDER_VALUE: PREF_DEF_GENDER_VALUE,

		getGeoLocation: getGeoLocation,
		setGeoLocation: setGeoLocation,
		getDateOfBirth: getDateOfBirth,
		setDateOfBirth: setDateOfBirth,
		getGender: getGender,
		setGender: setGender,

		restoreDefaults: restoreDefaults,
	}

})();
