"use strict";

let preferences = (function() {

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

        m_elmVersionLabel.textContent = "v" + browser.runtime.getManifest().version;

        refreshProgressBars();

        prefs.getIconizedProgressBarId().then((idElm) => {
            setTimeout(() => iconizeProgressBar(document.getElementById(idElm)), 200);
        });
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
        calcDayProgress(now).then((result) => {
            setProgressBar(document.getElementById("pBarDay"), result.percentage);
        });

        // +++ Month
        calcMonthProgress(now).then((result) => {
            setProgressBar(document.getElementById("pBarMonth"), result.percentage);
        });

        // +++ Year
        calcYearProgress(now).then((result) => {
            setProgressBar(document.getElementById("pBarYear"), result.percentage);
        });

        // +++ Life
        calcLifeProgress(now).then((result) => {
            setProgressBar(document.getElementById("pBarLife"), result.percentage);
        });

        // +++ User
        calcUserProgress(now).then((result) => {
            setProgressBar(document.getElementById("pBarUser"), result.percentage, result.title);
        }).catch(() => { /* rejected due to no user progress displayed */ });
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function calcDayProgress(now) {

        return new Promise((resolve) => {

            prefs.getDayStart().then((start) => {
                prefs.getDayEnd().then((end) => {
                    let total =  (end - start) * 60;                                  // minutes in day
                    let elapsed =  (now.getHours() - start) * 60 + now.getMinutes();  // minutes elapsed
                    let percentage = Math.min(Math.max(Math.round(elapsed * 100 / total), 0), 100);

                    resolve({ percentage: percentage });
                })
            });
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function calcMonthProgress(now) {

        return new Promise((resolve) => {

            let total = (new Date(now.getFullYear(), now.getMonth(), 0)).getDate() * 24;    // hours in this month
            let elapsed = ((now.getDate() - 1) * 24) + now.getHours();                      // hours elapsed
            let percentage = Math.min(Math.max(Math.round(elapsed * 100 / total), 0), 100);

            resolve({ percentage: percentage });
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function calcYearProgress(now) {

        return new Promise((resolve) => {

            let total = (isLeapYear(now.getFullYear()) ? 366 : 365);                                            // days in this year
            let elapsed = Math.ceil((now - (new Date(now.getFullYear(), 0, 1))) / globals.MILLISEC_IN_DAY);     // days elapsed
            let percentage = Math.min(Math.max(Math.round(elapsed * 100 / total), 0), 100);

            resolve({ percentage: percentage });
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function calcLifeProgress(now) {

        return new Promise((resolve) => {

            prefs.getGeoLocation().then((geoLocation) => {
                prefs.getDateOfBirth().then((dateOfBirth) => {

                    if(geoLocation !== globals.GEO_LOCATION_NOT_SET && utils.isValidBirthDate(dateOfBirth)) {

                        prefs.getGender().then((gender) => {
                            utils.getJsonTextData(globals.URL_WHO_LIFE_EXPECTANCY_DATA).then((jsonText) => {

                                let whoData = JSON.parse(jsonText);
                                let nodes = getLifeExpectancyNode(geoLocation, whoData);
                                let years = Object.getOwnPropertyDescriptor(nodes[0], gender);

                                let total = years.value;                                                            // expectancy years
                                let elapsed = Math.floor((now - new Date(dateOfBirth)) / globals.MILLISEC_IN_YEAR); // years elapsed - ignoring leap years
                                let percentage = Math.min(Math.max(Math.round(elapsed * 100 / total), 0), 100);

                                resolve({ percentage: percentage });
                            });
                        });

                    } else {
                        resolve({ percentage: null });
                    }
                });
            });
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function calcUserProgress(now) {

        return new Promise((resolve, reject) => {

            prefs.getUserProgressBar().then((checked) => {

                document.getElementById("userProgressBarContainer").style.display = (checked ? "block" : "none");

                if(checked) {

                    prefs.getUserTitle().then((title) => {
                        prefs.getUserStartDate().then((startDate) => {
                            prefs.getUserEndDate().then((endDate) => {

                                let percentage;

                                if(title !== "" && utils.isValidDate(startDate) && utils.isValidDate(endDate) && endDate > startDate) {

                                    let total = ((new Date(endDate)) - (new Date(startDate))) / globals.MILLISEC_IN_DAY;   // days in range
                                    let elapsed = (now - new Date(startDate)) / globals.MILLISEC_IN_DAY;                   // days elapsed
                                    percentage = Math.min(Math.max(Math.round(elapsed * 100 / total), 0), 100);
                                } else {
                                    percentage = null;
                                }
                                resolve({ percentage: percentage, title: title });
                            });
                        });
                    });
                } else {
                    reject();
                }
            });
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function setProgressBar(elmProgressBar, percentage, title = undefined) {


        if(elmProgressBar) {

            if(title !== undefined) {
                let elmTitle = elmProgressBar.querySelector(".progressBarLine > .progressBarTitle");
                elmTitle.textContent = title;
            }

            let elmValue = elmProgressBar.querySelector(".progressBarLine > .progressBarValue");
            let elmInner = elmProgressBar.querySelector(".progressBar > .progressBarInner");
            let elmPrgBar = elmProgressBar.querySelector(".progressBar");

            if(percentage === undefined || percentage === null) {
                elmPrgBar.classList.add("optionsNotSet");
                elmValue.textContent = "-";
                elmInner.style.width = "0%";
                setTimeout(() => utils.blinkElement(m_elmBtnPreferences, 200, 2000), 750);
            } else {
                elmPrgBar.classList.remove("optionsNotSet");
                elmValue.textContent = elmInner.style.width = percentage + "%";
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

        let elmPBarContainer = event.target;

        while(!elmPBarContainer.classList.contains("progressBarContainer")) {
            elmPBarContainer = elmPBarContainer.parentElement;
        }

        prefs.getIconizedProgressBarId().then((idElm) => {

            if(idElm !== globals.ICONIZED_PROGRESS_BAR_ID_NOT_SET && idElm !== elmPBarContainer.id) {
                document.getElementById(idElm).classList.remove("iconized");
            }
            iconizeProgressBar(elmPBarContainer);
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function onClickProgressBarPreference(event) {

        event.stopPropagation();

        browser.runtime.openOptionsPage().then(() => {

            setTimeout(() => {
                browser.runtime.sendMessage({progressBarId: event.target.parentElement.parentElement.id});
                window.close();
            }, 100);
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function onDbClickVersion(event) {
        if(event.shiftKey) {
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
    function iconizeProgressBar(elmPBarContainer) {

        if(!elmPBarContainer || elmPBarContainer === undefined) {
            return;
        }

        let iconDetails = {};
        let titleDetails = { title: null };

        if(elmPBarContainer.classList.contains("iconized")) {

            elmPBarContainer.classList.remove("iconized");
            prefs.setIconizedProgressBarId(globals.ICONIZED_PROGRESS_BAR_ID_NOT_SET);

        } else {

            elmPBarContainer.classList.add("iconized");
            prefs.setIconizedProgressBarId(elmPBarContainer.id);

            iconDetails = { imageData: createPercentageImage(elmPBarContainer.querySelector(".progressBarValue").textContent) };
            titleDetails = { title: "Take Your Time - " + elmPBarContainer.querySelector(".progressBarTitle").textContent };
        }

        browser.browserAction.setIcon(iconDetails);
        browser.browserAction.setTitle(titleDetails);
    }

    ////////////////////////////////////////////////////////////////////////////////////
    function createPercentageImage(percentage) {

        const bg = "#000000";
        const fg = "#FFCF75";

        const cnvs = document.getElementById("canvasBrowserAction");
        cnvs.width = cnvs.height = 16;
        const ctx = cnvs.getContext("2d");

        // background
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, cnvs.width, cnvs.height);

        if(/^\d{1,3}%$/.test(percentage)) {

            // percentage text
            ctx.fillStyle = fg;
            ctx.font = "10pt " + (percentage === "100%" ? "Segoe UI" : "serif");
            ctx.fillText(percentage, 0.5, 13, cnvs.width - 0.5);
        }

        return ctx.getImageData(0, 0, cnvs.width, cnvs.height);
    }

})();
