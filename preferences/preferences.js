"use strict";

let preferences = (function () {

	const FX_DELAY_MILLISEC = 500;

	let m_elmDayStart;
	let m_elmDayEnd;
	let m_elmGeoLocation;
	let m_elmDateOfBirth;
	let m_elmGender;
	let m_elmLifeExpectancyInfo;
	let m_elmUserProgressBar;
	let m_elmUserTitle;
	let m_elmUserStartDate;
	let m_elmUserEndDate;

	let m_elmBtnReloadExtension;
	let m_elmBtnRestoreDefaults;

	browser.runtime.onMessage.addListener(onMessage);
	document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
	window.addEventListener("unload", onUnload);

	////////////////////////////////////////////////////////////////////////////////////
	function onDOMContentLoaded() {

		m_elmDayStart = document.getElementById("dayStart");
		m_elmDayEnd = document.getElementById("dayEnd");
		m_elmGeoLocation = document.getElementById("geoLocation");
		m_elmDateOfBirth = document.getElementById("dateOfBirth");
		m_elmGender = document.getElementById("gender");
		m_elmLifeExpectancyInfo = document.getElementById("lifeExpectancyInfo");
		m_elmUserProgressBar = document.getElementById("userProgressBar");
		m_elmUserTitle = document.getElementById("userTitle");
		m_elmUserStartDate = document.getElementById("userStartDate");
		m_elmUserEndDate = document.getElementById("userEndDate");

		m_elmBtnReloadExtension = document.getElementById("btnReloadExtension");
		m_elmBtnRestoreDefaults = document.getElementById("btnRestoreDefaults");

		addEventListeners();
		getSavedPreferences();
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onUnload(event) {
		document.removeEventListener("DOMContentLoaded", onDOMContentLoaded);
		window.removeEventListener("unload", onUnload);

		m_elmDayStart.removeEventListener("change", onChangeDayStart);
		m_elmDayEnd.removeEventListener("change", onChangeDayEnd);
		m_elmGeoLocation.removeEventListener("change", onChangeGeoLocation);
		m_elmDateOfBirth.removeEventListener("change", onChangeDateOfBirth);
		m_elmDateOfBirth.removeEventListener("keyup", onKeyUpDateOfBirth);
		m_elmGender.removeEventListener("change", onChangeGender);
		m_elmUserProgressBar.removeEventListener("change", onChangeUserProgressBar);
		m_elmUserTitle.removeEventListener("change", onChangeUserTitle);
		m_elmUserTitle.removeEventListener("keyup", onKeyUpUserTitle);
		m_elmUserStartDate.removeEventListener("change", onChangeUserStartDate);
		m_elmUserStartDate.removeEventListener("keyup", onKeyUpUserDate);
		m_elmUserEndDate.removeEventListener("change", onChangeUserEndDate);
		m_elmUserEndDate.removeEventListener("keyup", onKeyUpUserDate);

		m_elmBtnReloadExtension.removeEventListener("click", onClickBtnReloadExtension);
		m_elmBtnRestoreDefaults.removeEventListener("click", onClickBtnRestoreDefaults);
	}

	////////////////////////////////////////////////////////////////////////////////////
	function addEventListeners() {

		// save preferences when changed
		m_elmDayStart.addEventListener("change", onChangeDayStart);
		m_elmDayEnd.addEventListener("change", onChangeDayEnd);
		m_elmGeoLocation.addEventListener("change", onChangeGeoLocation);
		m_elmDateOfBirth.addEventListener("change", onChangeDateOfBirth);
		m_elmDateOfBirth.addEventListener("keyup", onKeyUpDateOfBirth);
		m_elmGender.addEventListener("change", onChangeGender);
		m_elmUserProgressBar.addEventListener("change", onChangeUserProgressBar);
		m_elmUserTitle.addEventListener("change", onChangeUserTitle);
		m_elmUserTitle.addEventListener("keyup", onKeyUpUserTitle);
		m_elmUserStartDate.addEventListener("change", onChangeUserStartDate);
		m_elmUserStartDate.addEventListener("keyup", onKeyUpUserDate);
		m_elmUserEndDate.addEventListener("change", onChangeUserEndDate);
		m_elmUserEndDate.addEventListener("keyup", onKeyUpUserDate);

		m_elmBtnReloadExtension.addEventListener("click", onClickBtnReloadExtension);
		m_elmBtnRestoreDefaults.addEventListener("click", onClickBtnRestoreDefaults);
	}

	////////////////////////////////////////////////////////////////////////////////////
	function getSavedPreferences() {

		createSelectHoursElements(m_elmDayStart, 0, 23);

		prefs.getDayStart().then((startHour) => {

			m_elmDayStart.value = startHour;
			createSelectHoursElements(m_elmDayEnd, parseInt(startHour) + 1, 24);

			prefs.getDayEnd().then((endHour) => {

				if (endHour >= parseInt(startHour) + 1 && endHour <= 24) {
					m_elmDayEnd.value = endHour;
				} else {
					m_elmDayEnd.value = 24;
					prefs.setDayEnd(m_elmDayEnd.value);
				}
			});
		});

		let gettingGeoLocation = prefs.getGeoLocation();
		let creatingSelect = createSelectGeoLocationElements();

		gettingGeoLocation.then((value) => {
			creatingSelect.then(() => {
				m_elmGeoLocation.value = value;
				setTimeout(() => flashGeoLocationElement(), FX_DELAY_MILLISEC);
			});
		});

		prefs.getDateOfBirth().then((value) => {
			m_elmDateOfBirth.value = value;
			setTimeout(() => flashDateOfBirthElement(), FX_DELAY_MILLISEC);
		});

		prefs.getGender().then((value) => {
			m_elmGender.value = value;
		});

		prefs.getUserProgressBar().then((value) => {
			m_elmUserProgressBar.checked = value;
			document.querySelectorAll(".preference.user.subPref").forEach((elm, key, parent) => {
				utils.disableElementTree(elm, !value);
			});

			setTimeout(() => flashDateElement(m_elmUserStartDate), FX_DELAY_MILLISEC);
			setTimeout(() => flashDateElement(m_elmUserEndDate), FX_DELAY_MILLISEC);
		});

		prefs.getUserTitle().then((value) => {
			m_elmUserTitle.value = value;
		});

		prefs.getUserStartDate().then((value) => {
			m_elmUserStartDate.value = value;
		});

		prefs.getUserEndDate().then((value) => {
			m_elmUserEndDate.value = value;
		});
	}

	//==================================================================================
	//=== Event Listeners
	//==================================================================================

	////////////////////////////////////////////////////////////////////////////////////
	function onMessage(request, sender) {

		switch (request.msgId) {
			case globals.MSG_PREF_HIGHLIGHT_PREFERENCE:
				highlightPreference(request.progressBarId);
				break;
		}
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onChangeDayStart(event) {

		prefs.setDayStart(m_elmDayStart.value);

		let oldDayEndValue = m_elmDayEnd.value;
		let dayEndFromValue = parseInt(m_elmDayStart.value) + 1

		createSelectHoursElements(m_elmDayEnd, dayEndFromValue, 24);

		if (oldDayEndValue >= dayEndFromValue && oldDayEndValue <= 24) {
			m_elmDayEnd.value = oldDayEndValue;
		} else {
			m_elmDayEnd.value = 24;
			m_elmDayEnd.style.outlineWidth = "4px"
			setTimeout(() => m_elmDayEnd.style.outlineWidth = "0", 2500);
		}
		prefs.setDayEnd(m_elmDayEnd.value);
		browser.runtime.sendMessage({ msgId: globals.MSG_BKGD_REFRESH_BROWSER_ACTION_ICON });
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onChangeDayEnd(event) {
		prefs.setDayEnd(m_elmDayEnd.value);
		browser.runtime.sendMessage({ msgId: globals.MSG_BKGD_REFRESH_BROWSER_ACTION_ICON });
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onChangeGeoLocation(event) {
		prefs.setGeoLocation(m_elmGeoLocation.value);
		flashGeoLocationElement();
		browser.runtime.sendMessage({ msgId: globals.MSG_BKGD_REFRESH_BROWSER_ACTION_ICON });
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onChangeDateOfBirth(event) {

		prefs.getDateOfBirth().then((value) => {

			if (utils.isValidBirthDate(m_elmDateOfBirth.value) || m_elmDateOfBirth.value === "") {
				prefs.setDateOfBirth(m_elmDateOfBirth.value);
			} else {
				m_elmDateOfBirth.value = value;
			}
			flashDateOfBirthElement();
			browser.runtime.sendMessage({ msgId: globals.MSG_BKGD_REFRESH_BROWSER_ACTION_ICON });
		});
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onKeyUpDateOfBirth(event) {

		if (event.key >= "0" && event.key <= "9" && /^\d{4}(-\d{2})?$/.test(m_elmDateOfBirth.value)) {
			m_elmDateOfBirth.value += "-";
		}

		if (utils.isValidBirthDate(m_elmDateOfBirth.value) || m_elmDateOfBirth.value === "") {
			prefs.setDateOfBirth(m_elmDateOfBirth.value);
		}
		flashDateOfBirthElement();
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onChangeGender(event) {
		prefs.setGender(m_elmGender.value);
		browser.runtime.sendMessage({ msgId: globals.MSG_BKGD_REFRESH_BROWSER_ACTION_ICON });
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onChangeUserProgressBar(event) {

		let checked = m_elmUserProgressBar.checked;

		prefs.setUserProgressBar(checked);
		document.querySelectorAll(".preference.user.subPref").forEach((elm, key, parent) => {
			utils.disableElementTree(elm, !checked);
		});

		if(!checked) {
			prefs.getIconizedProgressBarId().then((id) => {
				if(id === globals.HTMLID_ELEMENT_USER) {
					prefs.setIconizedProgressBarId(globals.ICONIZED_PROGRESS_BAR_ID_NOT_SET);
					browser.runtime.sendMessage({ msgId: globals.MSG_BKGD_START_REFRESH_INTERVAL });
				}
			});
		}
		flashDateElement(m_elmUserStartDate);
		flashDateElement(m_elmUserEndDate);
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onKeyUpUserTitle(event) {
		flashTitleElement();
		browser.runtime.sendMessage({ msgId: globals.MSG_BKGD_REFRESH_BROWSER_ACTION_ICON });
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onChangeUserTitle(event) {

		prefs.getUserTitle().then((oldTitle) => {

			let newTitle = m_elmUserTitle.value.trim();

			if (newTitle.length === 0) {
				m_elmUserTitle.value = oldTitle;
				flashTitleElement();
			} else {
				m_elmUserTitle.value = newTitle;		// trimmed
				prefs.setUserTitle(newTitle);
			}
			browser.runtime.sendMessage({ msgId: globals.MSG_BKGD_REFRESH_BROWSER_ACTION_ICON });
		});
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onKeyUpUserDate(event) {

		let elm = event.target;

		if (event.key >= "0" && event.key <= "9" && /^\d{4}(-\d{2})?$/.test(elm.value)) {
			elm.value += "-";
		}
		flashDateElement(elm);
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onChangeUserStartDate(event) {

		prefs.getUserStartDate().then((startValue) => {

			if (utils.isValidDate(m_elmUserStartDate.value) || m_elmUserStartDate.value === "") {

				prefs.setUserStartDate(m_elmUserStartDate.value);

				prefs.getUserEndDate().then((endValue) => {

					if (endValue !== "" && (new Date(endValue)) <= (new Date(m_elmUserStartDate.value))) {
						prefs.setUserEndDate(m_elmUserEndDate.value = "");
						flashDateElement(m_elmUserEndDate);
					}
				});
			} else {
				m_elmUserStartDate.value = startValue;
			}
			flashDateElement(m_elmUserStartDate);
			browser.runtime.sendMessage({ msgId: globals.MSG_BKGD_REFRESH_BROWSER_ACTION_ICON });
		});
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onChangeUserEndDate(event) {

		prefs.getUserEndDate().then((value) => {

			if (utils.isValidDate(m_elmUserEndDate.value) || m_elmUserEndDate.value === "") {
				prefs.setUserEndDate(m_elmUserEndDate.value);
			} else {
				m_elmUserEndDate.value = value;
			}
			flashDateElement(m_elmUserEndDate);
			browser.runtime.sendMessage({ msgId: globals.MSG_BKGD_REFRESH_BROWSER_ACTION_ICON });
		});
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

		m_elmDayStart.value = defPrefs.dayStart;
		m_elmDayEnd.value = defPrefs.dayEnd;
		m_elmGeoLocation.value = defPrefs.geoLocation;
		m_elmDateOfBirth.value = defPrefs.dateOfBirth;
		m_elmGender.value = defPrefs.gender;
		m_elmUserProgressBar.checked = defPrefs.userProgressBar;
		m_elmUserTitle.value = defPrefs.userTitle;
		m_elmUserStartDate.value = defPrefs.userStartDate;
		m_elmUserEndDate.value = defPrefs.userEndDate;

		document.querySelectorAll(".preference.user.subPref").forEach((elm, key, parent) => {
			utils.disableElementTree(elm, !defPrefs.userProgressBar);
		});

		flashGeoLocationElement();
		flashDateOfBirthElement();
		flashDateElement(m_elmUserStartDate);
		flashDateElement(m_elmUserEndDate);
	}

	//==================================================================================
	//=== message handlers functions
	//==================================================================================

	////////////////////////////////////////////////////////////////////////////////////
	function highlightPreference(progressBarId) {

		let selector;

		switch (progressBarId) {
			case globals.HTMLID_ELEMENT_DAY:	selector = ".preference.day";	break;
			case globals.HTMLID_ELEMENT_LIFE:	selector = ".preference.life";	break;
			case globals.HTMLID_ELEMENT_USER:	selector = ".preference.user";	break;
		}

		document.querySelectorAll(selector).forEach((elm, key, parent) => {
			elm.style.backgroundColor = "rgb(255,165,0, 0.5)";
			setTimeout(() => elm.style.backgroundColor = "", 3000);
		});
	}

	//==================================================================================
	//=== flash functions
	//==================================================================================

	////////////////////////////////////////////////////////////////////////////////////
	function flashGeoLocationElement() {

		let selected = m_elmGeoLocation.options[m_elmGeoLocation.selectedIndex];

		if (selected === undefined || selected.value === prefs.PREF_DEF_GEO_LOCATION_VALUE) {
			m_elmGeoLocation.classList.add("flash");
		} else {
			m_elmGeoLocation.classList.remove("flash");
		}
	}

	////////////////////////////////////////////////////////////////////////////////////
	function flashDateOfBirthElement() {

		if (!utils.isValidBirthDate(m_elmDateOfBirth.value)) {
			m_elmDateOfBirth.classList.add("flash");
		} else {
			m_elmDateOfBirth.classList.remove("flash");
		}
	}

	////////////////////////////////////////////////////////////////////////////////////
	function flashTitleElement() {

		if (m_elmUserTitle.value.trim().length === 0) {
			m_elmUserTitle.classList.add("flash");
		} else {
			m_elmUserTitle.classList.remove("flash");
		}
	}

	////////////////////////////////////////////////////////////////////////////////////
	function flashDateElement(elm) {

		if (!utils.isValidDate(elm.value) && !elm.disabled) {
			elm.classList.add("flash");
		} else {
			elm.classList.remove("flash");
		}
	}

	//==================================================================================
	//=== Day satrt/end <select> functions
	//==================================================================================

	////////////////////////////////////////////////////////////////////////////////////
	function createSelectHoursElements(elm, nFrom, nTo) {

		while (elm.firstChild) {
			elm.removeChild(elm.firstChild);
		}

		let elmOption;

		for (let idx = nFrom; idx <= nTo; idx++) {
			elmOption = createTagOption(idx, idx.toString().padStart(2, "0") + ":00");
			elm.appendChild(elmOption);
		}
	}

	//==================================================================================
	//=== Geo Location <select> functions
	//==================================================================================

	////////////////////////////////////////////////////////////////////////////////////
	function createSelectGeoLocationElements() {

		return new Promise((resolve) => {

			while (m_elmGeoLocation.firstChild) {
				m_elmGeoLocation.removeChild(m_elmGeoLocation.firstChild);
			}

			// get WHO json data from file
			utils.getJsonTextData(globals.URL_WHO_LIFE_EXPECTANCY_DATA).then((jsonText) => {

				let elmOption = createTagOption(prefs.PREF_DEF_GEO_LOCATION_VALUE, "-Select geographic location-");
				m_elmGeoLocation.appendChild(elmOption);

				let whoData = JSON.parse(jsonText);

				// also init the help info
				m_elmLifeExpectancyInfo.title = whoData.description + "\u000d\u000dSource:\u000d" + whoData.source;

				createSelectGeoLocationElement(whoData);

				resolve();
			});
		});
	}

	////////////////////////////////////////////////////////////////////////////////////
	function createSelectGeoLocationElement(whoData) {

		let node, name;
		let elmOption;
		let specialItems = ["Global", "Region"];

		for (let n in whoData) {

			if (!whoData.hasOwnProperty(n)) {
				continue;
			}

			node = whoData[n];

			if (typeof node === 'object') {

				if (node.hasOwnProperty("name")) {

					// only nodes with values
					if (node.bothSexes !== "-") {

						name = node.name;

						elmOption = createTagOption(name, (specialItems.some(el => new RegExp("\\b" + el + "\\b").test(name)) ? "[ " + name + " ]" : name));
						m_elmGeoLocation.appendChild(elmOption);
					}
				} else {
					createSelectGeoLocationElement(node);
				}
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

})();
