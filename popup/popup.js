"use strict";

let preferences = (function() {

    let m_whoData;

    let m_elmBtnRefresh;
    let m_elmBtnPreferences;

	document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
	window.addEventListener("unload", onUnload);

	////////////////////////////////////////////////////////////////////////////////////
	function onDOMContentLoaded() {


        m_elmBtnRefresh = document.getElementById("btnRefresh");
        m_elmBtnPreferences = document.getElementById("btnPreferences");

        m_elmBtnRefresh.addEventListener("click", onClickRefresh, true);
        m_elmBtnPreferences.addEventListener("click", onClickPreferences, true);

        refreshProgressBars();
    }

	////////////////////////////////////////////////////////////////////////////////////
	function onUnload(event) {
		document.removeEventListener("DOMContentLoaded", onDOMContentLoaded);
        window.removeEventListener("unload", onUnload);

        m_elmBtnRefresh.removeEventListener("click", onClickRefresh, true);
        m_elmBtnPreferences.removeEventListener("click", onClickPreferences, true);

    }

    ////////////////////////////////////////////////////////////////////////////////////
    function refreshProgressBars() {

        let details;
        let now = new Date();

        // +++ Day
        details = {
            total: 24 * 60,                                         // minutes in day
            elapsed: now.getHours() * 60 + now.getMinutes(),        // minutes elapsed
        };
        setProgressbar(document.getElementById("pBarDay"), details);

        // +++ Month
        details = {
            total: (new Date(now.getFullYear(), now.getMonth(), 0)).getDate() * 24,    // hours in this month
            elapsed: ((now.getDate() - 1) * 24) + now.getHours(),                      // hours elapsed
        };
        setProgressbar(document.getElementById("pBarMonth"), details);

        // +++ Year
        details = {
            total: (isLeapYear(now.getFullYear()) ? 366 : 356),                            // days in this year
            elapsed: Math.ceil((now - (new Date(now.getFullYear(), 0, 1))) / 86400000),    // days elapsed
        };
        setProgressbar(document.getElementById("pBarYear"), details);

        // +++ Life
        details = {
            total: 80.3,
            elapsed: 58,
        };
        setProgressbar(document.getElementById("pBarLife"), details);

    }

    ////////////////////////////////////////////////////////////////////////////////////
    function setProgressbar(elmProgressBar, details) {

        if(elmProgressBar) {
            let elmValue = elmProgressBar.querySelector(".progressBarTexts > .progressBarValue");
            let elmInner = elmProgressBar.querySelector(".progressBar > .progressBarInner");
            elmValue.textContent = elmInner.style.width = Math.round(details.elapsed * 100 / details.total) + "%";
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function isLeapYear(year) {
        return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
        //total = ((new Date(now.getFullYear()+1, 0, 1)) - (new Date(now.getFullYear(), 0, 1))) / 86400000;
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function onClickRefresh(event) {
        refreshProgressBars();
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function onClickPreferences(event) {
        browser.runtime.openOptionsPage();
    }

})();