"use strict";

let preferences = (function () {

	let m_elmVersionLabel;
	let m_elmBtnRefresh;
	let m_elmBtnPreferences;

	document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
	window.addEventListener("unload", onUnload);

	////////////////////////////////////////////////////////////////////////////////////
	function onDOMContentLoaded() {

		m_elmVersionLabel = document.getElementById("version");
		m_elmBtnRefresh = document.getElementById("btnRefresh");
		m_elmBtnPreferences = document.getElementById("btnPreferences");

		document.querySelectorAll(".progressBarContainer").forEach((elm, key, parent) => {
			elm.addEventListener("mouseenter", onMouseEnterProgressBarContainer);
			elm.addEventListener("mouseleave", onMouseLeaveProgressBarContainer);
			elm.addEventListener("click", onClickProgressBarContainer);
		});

		document.querySelectorAll(".progressBarLine > .btnProgressPreference").forEach((elm, key, parent) => {
			elm.addEventListener("click", onClickProgressBarPreference, true);
		});

		m_elmVersionLabel.addEventListener("dblclick", onDbClickVersion, true);
		m_elmBtnRefresh.addEventListener("click", onClickRefresh, true);
		m_elmBtnPreferences.addEventListener("click", onClickPreferences, true);

		refreshProgressBars();

		m_elmVersionLabel.textContent = "v" + globals.WEB_EXT_VERSION;
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onUnload(event) {
		document.removeEventListener("DOMContentLoaded", onDOMContentLoaded);
		window.removeEventListener("unload", onUnload);

		document.querySelectorAll(".progressBarContainer").forEach((elm, key, parent) => {
			elm.removeEventListener("mouseenter", onMouseEnterProgressBarContainer);
			elm.removeEventListener("mouseleave", onMouseLeaveProgressBarContainer);
			elm.removeEventListener("click", onClickProgressBarContainer);
		});

		document.querySelectorAll(".progressBarLine > .btnProgressPreference").forEach((elm, key, parent) => {
			elm.removeEventListener("click", onClickProgressBarPreference);
		});

		m_elmVersionLabel.removeEventListener("dblclick", onDbClickVersion, true);
		m_elmBtnRefresh.removeEventListener("click", onClickRefresh, true);
		m_elmBtnPreferences.removeEventListener("click", onClickPreferences, true);
	}

	////////////////////////////////////////////////////////////////////////////////////
	function refreshProgressBars() {

		let now = new Date();

		// +++ Day
		calculator.getDayElapsedPercentage(now).then((result) => {
			setProgressBar(document.getElementById(globals.HTMLID_ELEMENT_DAY), result.percent);
		});

		// +++ Month
		calculator.getMonthElapsedPercentage(now).then((result) => {
			setProgressBar(document.getElementById(globals.HTMLID_ELEMENT_MONTH), result.percent);
		});

		// +++ Year
		calculator.getYearElapsedPercentage(now).then((result) => {
			setProgressBar(document.getElementById(globals.HTMLID_ELEMENT_YEAR), result.percent);
		});

		// +++ Life
		calculator.getLifeElapsedPercentage(now).then((result) => {
			setProgressBar(document.getElementById(globals.HTMLID_ELEMENT_LIFE), result.percent);
		});

		// +++ User
		prefs.getUserProgressBar().then((checked) => {
			document.getElementById("userProgressBarContainer").style.display = (checked ? "block" : "none");
			if(checked) {
				calculator.getUserElapsedPercentage(now).then((result) => {
					setProgressBar(document.getElementById(globals.HTMLID_ELEMENT_USER), result.percent, result.title);
				});
			}
		});

		// ++ set iconized check mark
		prefs.getIconizedProgressBarId().then((id) => {

			if(id !== globals.ICONIZED_PROGRESS_BAR_ID_NOT_SET) {

				setProgressBarIconizeCheckMark(id, false);
				// Make sure both displays are synchronized (popup & iconized)
				browser.runtime.sendMessage({ msgId: globals.MSG_BKGD_REFRESH_BROWSER_ACTION_ICON });
			}
		});
	}

	////////////////////////////////////////////////////////////////////////////////////
	function setProgressBar(elmProgressBar, percent, title = undefined) {

		if (elmProgressBar) {

			if (title !== undefined) {
				let elmTitle = elmProgressBar.querySelector(".progressBarLine > .progressBarTitle");
				elmTitle.textContent = title;
			}

			let elmPref = elmProgressBar.querySelector(".progressBarLine > .btnProgressPreference");
			let elmValue = elmProgressBar.querySelector(".progressBarLine > .progressBarValue");
			let elmPrgBar = elmProgressBar.querySelector(".progressBar");
			let elmInner = elmProgressBar.querySelector(".progressBar > .progressBarInner");

			if (percent === undefined || percent === null) {

				if (elmPref) elmPref.style.visibility = "visible";
				elmValue.textContent = "\u2013";    // EN DASH (large hyphen)
				elmPrgBar.classList.add("optionsNotSet");
				elmInner.style.width = "0%";

				setTimeout(() => utils.blinkElement(elmPref, 200, 2000), 750);
			} else {
				if (elmPref) elmPref.style.visibility = "";
				elmValue.textContent = elmInner.style.width = percent + "%";
				elmPrgBar.classList.remove("optionsNotSet");
			}
		}
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onMouseEnterProgressBarContainer(event) {
		event.target.style.outlineWidth = "1px";
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onMouseLeaveProgressBarContainer(event) {
		event.target.style.outlineWidth = "0";
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onClickProgressBarContainer(event) {

		let elmPBarContainer = event.target;

		while (!elmPBarContainer.classList.contains("progressBarContainer")) {
			elmPBarContainer = elmPBarContainer.parentElement;
		}

		prefs.getIconizedProgressBarId().then((id) => {

			if(id === elmPBarContainer.id) {
				prefs.setIconizedProgressBarId(globals.ICONIZED_PROGRESS_BAR_ID_NOT_SET);
			} else {
				prefs.setIconizedProgressBarId(elmPBarContainer.id);
			}
			setProgressBarIconizeCheckMark(elmPBarContainer.id);

			browser.runtime.sendMessage({ msgId: globals.MSG_BKGD_START_REFRESH_INTERVAL });
		});
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onClickProgressBarPreference(event) {

		event.stopPropagation();

		browser.runtime.openOptionsPage().then(() => {

			setTimeout(() => {
				browser.runtime.sendMessage({
					msgId: globals.MSG_PREF_HIGHLIGHT_PREFERENCE,
					progressBarId: event.target.parentElement.parentElement.id
				});
				window.close();
			}, 100);
		});
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onDbClickVersion(event) {
		if (event.shiftKey) {
			browser.runtime.reload();
		}
	}
	////////////////////////////////////////////////////////////////////////////////////
	function onClickRefresh(event) {
		refreshProgressBars();
	}

	////////////////////////////////////////////////////////////////////////////////////
	function onClickPreferences(event) {
		browser.runtime.openOptionsPage();
		window.close();
	}

	////////////////////////////////////////////////////////////////////////////////////
	function setProgressBarIconizeCheckMark(id, flip = true) {

		document.querySelectorAll(".progressBarContainer").forEach((elm, key, parent) => {
			if(elm.id !== id || (flip && elm.classList.contains("iconized"))) {
				elm.classList.remove("iconized");
			} else {
				elm.classList.add("iconized");
			}
		});
	}

})();
