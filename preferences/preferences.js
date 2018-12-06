"use strict";

let preferences = (function() {

	let m_elmGeoLocation;
	let m_elmDateOfBirth;
	let m_elmGender;
	let m_elmLifeExpectancyInfo;

	let m_elmBtnReloadExtension;
	let m_elmBtnRestoreDefaults;

	let m_txtHelpInfoLifeExpectancy;

	document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
	window.addEventListener("unload", onUnload);

	////////////////////////////////////////////////////////////////////////////////////
	function onDOMContentLoaded() {

		m_elmGeoLocation = document.getElementById("geoLocation");
		m_elmDateOfBirth = document.getElementById("dateOfBirth");
		m_elmGender = document.getElementById("gender");
		m_elmLifeExpectancyInfo = document.getElementById("lifeExpectancyInfo");

		m_elmBtnReloadExtension = document.getElementById("btnReloadExtension");
		m_elmBtnRestoreDefaults = document.getElementById("btnRestoreDefaults");

		addEventListeners();
		getSavedPreferences();
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onUnload(event) {
		document.removeEventListener("DOMContentLoaded", onDOMContentLoaded);
		window.removeEventListener("unload", onUnload);

		m_elmGeoLocation.removeEventListener("change", onChangeGeoLocation);
		m_elmDateOfBirth.removeEventListener("change", onChangeDateOfBirth);
		m_elmGender.removeEventListener("change", onChangeGender);

		m_elmBtnReloadExtension.removeEventListener("click", onClickBtnReloadExtension);
		m_elmBtnRestoreDefaults.removeEventListener("click", onClickBtnRestoreDefaults);
	}

	////////////////////////////////////////////////////////////////////////////////////
	function addEventListeners() {

		// save preferences when changed
		m_elmGeoLocation.addEventListener("change", onChangeGeoLocation);
		m_elmDateOfBirth.addEventListener("change", onChangeDateOfBirth, true);
		m_elmGender.addEventListener("change", onChangeGender);

		m_elmBtnReloadExtension.addEventListener("click", onClickBtnReloadExtension);
		m_elmBtnRestoreDefaults.addEventListener("click", onClickBtnRestoreDefaults);
	}

	////////////////////////////////////////////////////////////////////////////////////
	function getSavedPreferences() {

		let gettingGeoLocation = prefs.getGeoLocation();
		let creatingSelect = createSelectGeoLocationElements();

		gettingGeoLocation.then((value) => {
			creatingSelect.then(() => {
				m_elmGeoLocation.value = value;
				m_elmLifeExpectancyInfo.title = m_txtHelpInfoLifeExpectancy;
				setTimeout(() => {
					flashGeoLocationElement();
				}, 500);
			});
		});

		prefs.getDateOfBirth().then((value) => {
			m_elmDateOfBirth.value = value;
			setTimeout(() => {
				flashDateOfBirthElement();
			}, 500);
		});

		prefs.getGender().then((value) => {
			m_elmGender.value = value;
		});
	}

	//==================================================================================
	//=== Event Listeners
	//==================================================================================

	////////////////////////////////////////////////////////////////////////////////////
	function onChangeGeoLocation(event) {
		prefs.setGeoLocation(m_elmGeoLocation.value);
		flashGeoLocationElement();
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onChangeDateOfBirth(event) {

		prefs.getDateOfBirth().then((value) => {

			if(isValidBirthDate(m_elmDateOfBirth.value) || m_elmDateOfBirth.value === "") {
				prefs.setDateOfBirth(m_elmDateOfBirth.value);
			} else {
				m_elmDateOfBirth.value = value;
			}
			flashDateOfBirthElement();
		});
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onChangeGender(event) {
		prefs.setGender(m_elmGender.value);
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onClickBtnReloadExtension(event) {
		setTimeout(() => {
			browser.tabs.reload({ bypassCache: true });
			browser.runtime.reload();
		}, 10);
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onClickBtnRestoreDefaults(event) {
		let defPrefs = prefs.restoreDefaults();

		m_elmGeoLocation.value = defPrefs.geoLocation;
		m_elmDateOfBirth.value = defPrefs.dateOfBirth;
		m_elmGender.value = defPrefs.gender;

		flashGeoLocationElement();
		flashDateOfBirthElement();
	}

	//==================================================================================
	//=== flash functions
	//==================================================================================

	////////////////////////////////////////////////////////////////////////////////////
	function flashGeoLocationElement() {

		let selected = m_elmGeoLocation.options[m_elmGeoLocation.selectedIndex];

		if(selected === undefined || selected.value === prefs.PREF_DEF_GEO_LOCATION_VALUE) {
			m_elmGeoLocation.classList.add("flash");
		} else {
			m_elmGeoLocation.classList.remove("flash");
		}
	}

	////////////////////////////////////////////////////////////////////////////////////
	function flashDateOfBirthElement() {

		if(!isValidBirthDate(m_elmDateOfBirth.value)) {
			m_elmDateOfBirth.classList.add("flash");
		} else {
			m_elmDateOfBirth.classList.remove("flash");
		}
	}

	//==================================================================================
	//=== Geo Location <select> functions
	//==================================================================================

	////////////////////////////////////////////////////////////////////////////////////
	function createSelectGeoLocationElements() {

		return new Promise((resolve) => {

			while(m_elmGeoLocation.firstChild) {
				m_elmGeoLocation.removeChild(m_elmGeoLocation.firstChild);
			}

			getWHODataAsJson().then((jsonText) => {

				let elmOption = createTagOption(prefs.PREF_DEF_GEO_LOCATION_VALUE, "-Select geographic location-");
				m_elmGeoLocation.appendChild(elmOption);

				let whoData = JSON.parse(jsonText);
				createSelectGeoLocationElement(whoData);

				resolve();
			});
		});
	}

    ////////////////////////////////////////////////////////////////////////////////////
    function getWHODataAsJson() {

		return new Promise((resolve) => {

			let xhr = new XMLHttpRequest();

			xhr.overrideMimeType("application/json");
			xhr.open("GET", "/data/WHO2016data.json");
			xhr.onload = function () {
				if (xhr.readyState === xhr.DONE && xhr.status === 200) {
					resolve(xhr.responseText);
				}
			};
			xhr.send();
		});
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function createSelectGeoLocationElement(whoData) {

		let node, name;
		let elmOption;

		let specialItems = ["Global", "Region"];

        for(let idx in whoData) {

			node = whoData[idx];

            if(node.hasOwnProperty("metaData")) {

				m_txtHelpInfoLifeExpectancy = node.metaData[0].description + "\u000d\u000dSource:\u000d" + node.metaData[0].source;

			} else if(node.hasOwnProperty("name")) {

				name = node.name;

				elmOption = createTagOption(name, (specialItems.some(el => name.includes(el)) ? "[ " + name + " ]" : name));
				m_elmGeoLocation.appendChild(elmOption);

			} else {
                createSelectGeoLocationElement(node);
            }
        }
	}

	////////////////////////////////////////////////////////////////////////////////////
	function createTagOption(value, text) {
		let elm = document.createElement("option");
		elm.value = value;
		elm.innerHTML = text;
		return elm;
	}

	////////////////////////////////////////////////////////////////////////////////////
	function isValidBirthDate(value) {

		let dateVal = new Date(value);

		console.log("[Sage-Like]", dateVal);

		return (dateVal !== undefined && !isNaN(dateVal) && (dateVal instanceof Date) && dateVal < (new Date()));
	}

})();
