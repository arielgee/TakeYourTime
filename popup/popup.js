"use strict";

let preferences = (function() {

    let m_elmUserProgressBarContainer;
    let m_elmVersion;
    let m_elmBtnRefresh;
    let m_elmBtnPreferences;

    document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
    window.addEventListener("unload", onUnload);

	////////////////////////////////////////////////////////////////////////////////////
	function onDOMContentLoaded() {

        m_elmUserProgressBarContainer = document.getElementById("userProgressBarContainer");
        m_elmVersion = document.getElementById("version");
        m_elmBtnRefresh = document.getElementById("btnRefresh");
        m_elmBtnPreferences = document.getElementById("btnPreferences");

        m_elmBtnRefresh.addEventListener("click", onClickRefresh, true);
        m_elmBtnPreferences.addEventListener("click", onClickPreferences, true);

        m_elmVersion.textContent = "v" + browser.runtime.getManifest().version;
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
        let millisecInDay = 86400000;
        let millisecInYear = 31536000000;       // ignoring leap years


        // +++ Day
        prefs.getDayStart().then((start) => {
            prefs.getDayEnd().then((end) => {
                details = {
                    total: (end - start) * 60,                                  // minutes in day
                    elapsed: (now.getHours() - start) * 60 + now.getMinutes(),  // minutes elapsed
                };
                setProgressbar(document.getElementById("pBarDay"), details);


                browser.browserAction.setBadgeBackgroundColor({color: "#2f2f2f"});
                browser.browserAction.setBadgeText({ text: "1%0" });
                browser.browserAction.setIcon({imageData: canvasContext.getImageData(0, 0, canvas.width,canvas.height)});
                /*
                https://developer.mozilla.org/en-US/search?q=getImageData
                https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas
                https://developer.mozilla.org/en-US/docs/Web/API/RenderingContext
                https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
                https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeText

                */
            })
        });

        // +++ Month
        details = {
            total: (new Date(now.getFullYear(), now.getMonth(), 0)).getDate() * 24,    // hours in this month
            elapsed: ((now.getDate() - 1) * 24) + now.getHours(),                      // hours elapsed
        };
        setProgressbar(document.getElementById("pBarMonth"), details);

        // +++ Year
        details = {
            total: (isLeapYear(now.getFullYear()) ? 366 : 365),                                  // days in this year
            elapsed: Math.ceil((now - (new Date(now.getFullYear(), 0, 1))) / millisecInDay),    // days elapsed
        };
        setProgressbar(document.getElementById("pBarYear"), details);

        // +++ Life
        prefs.getGeoLocation().then((geoLocation) => {
            prefs.getDateOfBirth().then((dateOfBirth) => {

                if(geoLocation !== globals.GEO_LOCATION_NOT_SET && utils.isValidBirthDate(dateOfBirth)) {

                    prefs.getGender().then((gender) => {
                        utils.getJsonTextData(globals.URL_WHO_LIFE_EXPECTANCY_DATA).then((jsonText) => {

                            let whoData = JSON.parse(jsonText);
                            let nodes = getLifeExpectancyNode(geoLocation, whoData);
                            let years = Object.getOwnPropertyDescriptor(nodes[0], gender);

                            details = {
                                total: years.value,                                                     // expectancy years
                                elapsed: Math.floor((now - new Date(dateOfBirth)) / millisecInYear),    // years elapsed - ignoring leap years
                            };
                            setProgressbar(document.getElementById("pBarLife"), details);
                        });
                    });

                } else {
                    setProgressbar(document.getElementById("pBarLife"));
                }
            });
        });

        // +++ User
        prefs.getUserProgressBar().then((checked) => {

            m_elmUserProgressBarContainer.style.display = (checked ? "block" : "none");

            if(checked) {

                prefs.getUserTitle().then((title) => {
                    prefs.getUserStartDate().then((startDate) => {
                        prefs.getUserEndDate().then((endDate) => {

                            if(title !== "" && utils.isValidDate(startDate) && utils.isValidDate(endDate) && endDate > startDate) {

                                details = {
                                    total: ((new Date(endDate)) - (new Date(startDate))) / millisecInDay,   // days in range
                                    elapsed: (now - new Date(startDate)) / millisecInDay,                   // days elapsed
                                };
                            } else {
                                details = null;
                            }
                            setProgressbar(document.getElementById("pBarUser"), details, title);
                        });
                    });
                });
            }
        });

    }

    ////////////////////////////////////////////////////////////////////////////////////
    function setProgressbar(elmProgressBar, details, name = undefined) {

        if(elmProgressBar) {

            if(name !== undefined) {
                let elmName = elmProgressBar.querySelector(".progressBarTexts > .progressBarName");
                elmName.textContent = name;
            }

            let elmValue = elmProgressBar.querySelector(".progressBarTexts > .progressBarValue");
            let elmInner = elmProgressBar.querySelector(".progressBar > .progressBarInner");
            let elmPrgBar = elmProgressBar.querySelector(".progressBar");

            if(details === undefined || details === null) {
                elmPrgBar.classList.add("optionsNotSet");
                elmValue.textContent = "-";
                elmInner.style.width = "0%";
                setTimeout(() => utils.blinkElement(m_elmBtnPreferences, 200, 2000), 750);
            } else {
                elmPrgBar.classList.remove("optionsNotSet");
                elmValue.textContent = elmInner.style.width = Math.min(Math.max(Math.round(details.elapsed * 100 / details.total), 0), 100) + "%";
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function isLeapYear(year) {
        return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
    }

	////////////////////////////////////////////////////////////////////////////////////
	function getLifeExpectancyNode(name, whoData) {

        let node, nodes = [];

        for(let n in whoData) {

            if(!whoData.hasOwnProperty(n)) {
                continue;
            }

            node = whoData[n];

            if (typeof node === 'object') {
                if(node.hasOwnProperty("name") && node.name === name) {
                    nodes.push(node);
                } else {
                    nodes = nodes.concat(getLifeExpectancyNode(name, node));
                }
            }
        }
        return nodes;
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
