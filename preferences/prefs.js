"use strict";

let prefs = (function() {

	// user preferences

	const PREF_DEF_DAY_START_VALUE = 0;
	const PREF_DEF_DAY_END_VALUE = 24;
	const PREF_DEF_GEO_LOCATION_VALUE = globals.GEO_LOCATION_NOT_SET;
	const PREF_DEF_DATE_OF_BIRTH_VALUE = "";
	const PREF_DEF_GENDER_VALUE = "bothSexes";

	const PREF_DAY_START_VALUE = "pref_dayStart";
	const PREF_DAY_END_VALUE = "pref_dayEnd";
	const PREF_GEO_LOCATION_KEY = "pref_geoLocation";
	const PREF_DATE_OF_BIRTH_KEY = "pref_dateOfBirth";
	const PREF_GENDER_KEY = "pref_gender";

	//////////////////////////////////////////////////////////////////////
	function getDayStart() {

		return new Promise((resolve) => {

			browser.storage.local.get(PREF_DAY_START_VALUE).then((result) => {
				resolve(result[PREF_DAY_START_VALUE] === undefined ? PREF_DEF_DAY_START_VALUE : result[PREF_DAY_START_VALUE]);
			});
		});
	}

	//////////////////////////////////////////////////////////////////////
	function setDayStart(value) {

		let obj = {};
		obj[PREF_DAY_START_VALUE] = value;
		browser.storage.local.set(obj);
	}

	//////////////////////////////////////////////////////////////////////
	function getDayEnd() {

		return new Promise((resolve) => {

			browser.storage.local.get(PREF_DAY_END_VALUE).then((result) => {
				resolve(result[PREF_DAY_END_VALUE] === undefined ? PREF_DEF_DAY_END_VALUE : result[PREF_DAY_END_VALUE]);
			});
		});
	}

	//////////////////////////////////////////////////////////////////////
	function setDayEnd(value) {

		let obj = {};
		obj[PREF_DAY_END_VALUE] = value;
		browser.storage.local.set(obj);
	}

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
		this.setDayStart(PREF_DEF_DAY_START_VALUE);
		this.setDayEnd(PREF_DEF_DAY_END_VALUE);
		this.setGeoLocation(PREF_DEF_GEO_LOCATION_VALUE);
		this.setDateOfBirth(PREF_DEF_DATE_OF_BIRTH_VALUE);
		this.setGender(PREF_DEF_GENDER_VALUE)

		return {
			dayStart: PREF_DEF_DAY_START_VALUE,
			dayEnd: PREF_DEF_DAY_END_VALUE,
			geoLocation: PREF_DEF_GEO_LOCATION_VALUE,
			dateOfBirth: PREF_DEF_DATE_OF_BIRTH_VALUE,
			gender: PREF_DEF_GENDER_VALUE,
		};
	}

	return {
		PREF_DEF_DAY_START_VALUE: PREF_DEF_DAY_START_VALUE,
		PREF_DEF_DAY_END_VALUE: PREF_DEF_DAY_END_VALUE,
		PREF_DEF_GEO_LOCATION_VALUE: PREF_DEF_GEO_LOCATION_VALUE,
		PREF_DEF_DATE_OF_BIRTH_VALUE: PREF_DEF_DATE_OF_BIRTH_VALUE,
		PREF_DEF_GENDER_VALUE: PREF_DEF_GENDER_VALUE,

		getDayStart: getDayStart,
		setDayStart: setDayStart,
		getDayEnd: getDayEnd,
		setDayEnd: setDayEnd,
		getGeoLocation: getGeoLocation,
		setGeoLocation: setGeoLocation,
		getDateOfBirth: getDateOfBirth,
		setDateOfBirth: setDateOfBirth,
		getGender: getGender,
		setGender: setGender,

		restoreDefaults: restoreDefaults,
	}

})();
