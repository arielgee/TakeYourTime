"use strict";

let preferences = (function() {

    let m_elmBtnRefresh;
    let m_elmBtnPreferences;

    document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
    window.addEventListener("unload", onUnload);

	////////////////////////////////////////////////////////////////////////////////////
	function onDOMContentLoaded() {

        m_elmBtnRefresh = document.getElementById("btnRefresh");
        m_elmBtnPreferences = document.getElementById("btnPreferences");

        document.querySelectorAll(".progressBarContainer").forEach((elm, key, parent) => {
            elm.addEventListener("mouseenter", onMouseEnterProgressBarContainer);
            elm.addEventListener("mouseleave", onMouseLeaveProgressBarContainer);
            elm.addEventListener("click", onClickProgressBarContainer);
        });

        m_elmBtnRefresh.addEventListener("click", onClickRefresh, true);
        m_elmBtnPreferences.addEventListener("click", onClickPreferences, true);

        document.getElementById("version").textContent = "v" + browser.runtime.getManifest().version;

        refreshProgressBars();
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
                setProgressBar(document.getElementById("pBarDay"), details);
            })
        });

        // +++ Month
        details = {
            total: (new Date(now.getFullYear(), now.getMonth(), 0)).getDate() * 24,    // hours in this month
            elapsed: ((now.getDate() - 1) * 24) + now.getHours(),                      // hours elapsed
        };
        setProgressBar(document.getElementById("pBarMonth"), details);

        // +++ Year
        details = {
            total: (isLeapYear(now.getFullYear()) ? 366 : 365),                                  // days in this year
            elapsed: Math.ceil((now - (new Date(now.getFullYear(), 0, 1))) / millisecInDay),    // days elapsed
        };
        setProgressBar(document.getElementById("pBarYear"), details);

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
                            setProgressBar(document.getElementById("pBarLife"), details);
                        });
                    });

                } else {
                    setProgressBar(document.getElementById("pBarLife"));
                }
            });
        });

        // +++ User
        prefs.getUserProgressBar().then((checked) => {

            document.getElementById("userProgressBarContainer").style.display = (checked ? "block" : "none");

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
                            setProgressBar(document.getElementById("pBarUser"), details, title);
                        });
                    });
                });
            }
        });

    }

    ////////////////////////////////////////////////////////////////////////////////////
    function setProgressBar(elmProgressBar, details, name = undefined) {

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
    function onMouseEnterProgressBarContainer(event) {
        event.target.style.outlineWidth = "1px";

    }

    ////////////////////////////////////////////////////////////////////////////////////
    function onMouseLeaveProgressBarContainer(event) {
        event.target.style.outlineWidth = "0";
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function onClickProgressBarContainer(event) {

        let container = event.target;

        while(!container.classList.contains("progressBarContainer")) {
            container = container.parentElement;
        }

        if(container.hasAttribute("browserAction")) {
            container.removeAttribute("browserAction");
            browser.browserAction.setIcon( { } );
            browser.browserAction.setTitle( { title: null } );
        } else {

            let elmInBrowserAction = document.querySelectorAll(".progressBarContainer[browserAction]");

            if(elmInBrowserAction.length > 0) {
                for(let idx in elmInBrowserAction) {
                    if(!elmInBrowserAction.hasOwnProperty(idx)) continue;
                    elmInBrowserAction[idx].removeAttribute("browserAction");
                }
            }

            container.setAttribute("browserAction", "");
            browser.browserAction.setIcon( { imageData: createPercentageImage(container.querySelector(".progressBarValue").textContent) } );
            browser.browserAction.setTitle( { title: "Take Your Time - " + container.querySelector(".progressBarName").textContent } );
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function onClickRefresh(event) {
        refreshProgressBars();
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function onClickPreferences(event) {
        browser.runtime.openOptionsPage();
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function createPercentageImage(percentage) {

        let bg = "#000000";
        let fg = "#FFCF75";

        const cnvs = document.getElementById("canvasBrowserAction");
        cnvs.width = cnvs.height = 16;
        const ctx = cnvs.getContext("2d");

        // background
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, cnvs.width, cnvs.height);

        // percentage text
        ctx.fillStyle = fg;
        ctx.font = "10pt " + (percentage === "100%" ? "Segoe UI" : "serif");
        ctx.fillText(percentage, 0.5, 13, cnvs.width - 0.5);

        return ctx.getImageData(0, 0, cnvs.width, cnvs.height);
    }

})();
