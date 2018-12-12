"use strict";

let prefs = (function() {

	// user preferences

	const PREF_DEF_DAY_START_VALUE = 0;
	const PREF_DEF_DAY_END_VALUE = 24;
	const PREF_DEF_GEO_LOCATION_VALUE = globals.GEO_LOCATION_NOT_SET;
	const PREF_DEF_DATE_OF_BIRTH_VALUE = "";
	const PREF_DEF_GENDER_VALUE = "bothSexes";
	const PREF_DEF_USER_PROGRESS_BAR_VALUE = false;
	const PREF_DEF_USER_TITLE_VALUE = "This Process";
	const PREF_DEF_USER_START_DATE_VALUE = "";
	const PREF_DEF_USER_END_DATE_VALUE = "";

	const PREF_DAY_START_KEY = "pref_dayStart";
	const PREF_DAY_END_KEY = "pref_dayEnd";
	const PREF_GEO_LOCATION_KEY = "pref_geoLocation";
	const PREF_DATE_OF_BIRTH_KEY = "pref_dateOfBirth";
	const PREF_GENDER_KEY = "pref_gender";
	const PREF_USER_PROGRESS_BAR_KEY = "pref_userProgressBar";
	const PREF_USER_TITLE_KEY = "pref_userTitle";
	const PREF_USER_START_DATE_KEY = "pref_userStartDate";
	const PREF_USER_END_DATE_KEY = "pref_userEndDate";

	//////////////////////////////////////////////////////////////////////
	function getDayStart() {

		return new Promise((resolve) => {

			browser.storage.local.get(PREF_DAY_START_KEY).then((result) => {
				resolve(result[PREF_DAY_START_KEY] === undefined ? PREF_DEF_DAY_START_VALUE : result[PREF_DAY_START_KEY]);
			});
		});
	}

	//////////////////////////////////////////////////////////////////////
	function setDayStart(value) {

		let obj = {};
		obj[PREF_DAY_START_KEY] = value;
		browser.storage.local.set(obj);
	}

	//////////////////////////////////////////////////////////////////////
	function getDayEnd() {

		return new Promise((resolve) => {

			browser.storage.local.get(PREF_DAY_END_KEY).then((result) => {
				resolve(result[PREF_DAY_END_KEY] === undefined ? PREF_DEF_DAY_END_VALUE : result[PREF_DAY_END_KEY]);
			});
		});
	}

	//////////////////////////////////////////////////////////////////////
	function setDayEnd(value) {

		let obj = {};
		obj[PREF_DAY_END_KEY] = value;
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
	function getUserProgressBar() {

		return new Promise((resolve) => {

			browser.storage.local.get(PREF_USER_PROGRESS_BAR_KEY).then((result) => {
				resolve(result[PREF_USER_PROGRESS_BAR_KEY] === undefined ? PREF_DEF_USER_PROGRESS_BAR_VALUE : result[PREF_USER_PROGRESS_BAR_KEY]);
			});
		});
	}

	//////////////////////////////////////////////////////////////////////
	function setUserProgressBar(value) {

		let obj = {};
		obj[PREF_USER_PROGRESS_BAR_KEY] = value;
		browser.storage.local.set(obj);
	}

	//////////////////////////////////////////////////////////////////////
	function getUserTitle() {

		return new Promise((resolve) => {

			browser.storage.local.get(PREF_USER_TITLE_KEY).then((result) => {
				resolve(result[PREF_USER_TITLE_KEY] === undefined ? PREF_DEF_USER_TITLE_VALUE : result[PREF_USER_TITLE_KEY]);
			});
		});
	}

	//////////////////////////////////////////////////////////////////////
	function setUserTitle(value) {

		let obj = {};
		obj[PREF_USER_TITLE_KEY] = value;
		browser.storage.local.set(obj);
	}

	//////////////////////////////////////////////////////////////////////
	function getUserStartDate() {

		return new Promise((resolve) => {

			browser.storage.local.get(PREF_USER_START_DATE_KEY).then((result) => {
				resolve(result[PREF_USER_START_DATE_KEY] === undefined ? PREF_DEF_USER_START_DATE_VALUE : result[PREF_USER_START_DATE_KEY]);
			});
		});
	}

	//////////////////////////////////////////////////////////////////////
	function setUserStartDate(value) {

		let obj = {};
		obj[PREF_USER_START_DATE_KEY] = value;
		browser.storage.local.set(obj);
	}

	//////////////////////////////////////////////////////////////////////
	function getUserEndDate() {

		return new Promise((resolve) => {

			browser.storage.local.get(PREF_USER_END_DATE_KEY).then((result) => {
				resolve(result[PREF_USER_END_DATE_KEY] === undefined ? PREF_DEF_USER_END_DATE_VALUE : result[PREF_USER_END_DATE_KEY]);
			});
		});
	}

	//////////////////////////////////////////////////////////////////////
	function setUserEndDate(value) {

		let obj = {};
		obj[PREF_USER_END_DATE_KEY] = value;
		browser.storage.local.set(obj);
	}

	//////////////////////////////////////////////////////////////////////
	function restoreDefaults() {
		this.setDayStart(PREF_DEF_DAY_START_VALUE);
		this.setDayEnd(PREF_DEF_DAY_END_VALUE);
		this.setGeoLocation(PREF_DEF_GEO_LOCATION_VALUE);
		this.setDateOfBirth(PREF_DEF_DATE_OF_BIRTH_VALUE);
		this.setGender(PREF_DEF_GENDER_VALUE)
		this.setUserProgressBar(PREF_DEF_USER_PROGRESS_BAR_VALUE);
		this.setUserTitle(PREF_DEF_USER_TITLE_VALUE);
		this.setUserStartDate(PREF_DEF_USER_START_DATE_VALUE);
		this.setUserEndDate(PREF_DEF_USER_END_DATE_VALUE);

		return {
			dayStart: PREF_DEF_DAY_START_VALUE,
			dayEnd: PREF_DEF_DAY_END_VALUE,
			geoLocation: PREF_DEF_GEO_LOCATION_VALUE,
			dateOfBirth: PREF_DEF_DATE_OF_BIRTH_VALUE,
			gender: PREF_DEF_GENDER_VALUE,
			userProgressBar: PREF_DEF_USER_PROGRESS_BAR_VALUE,
			userTitle: PREF_DEF_USER_TITLE_VALUE,
			userStartDate: PREF_DEF_USER_START_DATE_VALUE,
			userEndDate: PREF_DEF_USER_END_DATE_VALUE,
		};
	}

	return {
		PREF_DEF_DAY_START_VALUE: PREF_DEF_DAY_START_VALUE,
		PREF_DEF_DAY_END_VALUE: PREF_DEF_DAY_END_VALUE,
		PREF_DEF_GEO_LOCATION_VALUE: PREF_DEF_GEO_LOCATION_VALUE,
		PREF_DEF_DATE_OF_BIRTH_VALUE: PREF_DEF_DATE_OF_BIRTH_VALUE,
		PREF_DEF_GENDER_VALUE: PREF_DEF_GENDER_VALUE,
		PREF_DEF_USER_PROGRESS_BAR_VALUE: PREF_DEF_USER_PROGRESS_BAR_VALUE,
		PREF_DEF_USER_TITLE_VALUE: PREF_DEF_USER_TITLE_VALUE,
		PREF_DEF_USER_START_DATE_VALUE: PREF_DEF_USER_START_DATE_VALUE,
		PREF_DEF_USER_END_DATE_VALUE: PREF_DEF_USER_END_DATE_VALUE,

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
		getUserProgressBar: getUserProgressBar,
		setUserProgressBar: setUserProgressBar,
		getUserTitle: getUserTitle,
		setUserTitle: setUserTitle,
		getUserStartDate: getUserStartDate,
		setUserStartDate: setUserStartDate,
		getUserEndDate: getUserEndDate,
		setUserEndDate: setUserEndDate,

		restoreDefaults: restoreDefaults,
	}

})();
