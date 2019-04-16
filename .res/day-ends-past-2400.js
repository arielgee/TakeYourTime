/*
	Day ends past 24:00
*/
let calculator = (function () {

	////////////////////////////////////////////////////////////////////////////////////
	function getDayElapsedPercentage(now) {

		return new Promise((resolve) => {

			prefs.getDayStart().then((start) => {
				prefs.getDayEnd().then((end) => {

					start = parseInt(start);
					end = parseInt(end);

/*
					let total = (end - start) * 60;                                  // minutes in day
					let elapsed = (now.getHours() - start) * 60 + now.getMinutes();  // minutes elapsed
*/
					let total, elapsed;

					if (end > start) {
						total = (end - start) * 60;                                  // minutes in day
						elapsed = (now.getHours() - start) * 60 + now.getMinutes();  // minutes elapsed
					} else {
						total = (24 - start + end) * 60;                                  // minutes in day
						elapsed = ((now.getHours() - start) * 60 + now.getMinutes()) + (end * 60);  // minutes elapsed
					}

					console.log("[Sage-Like]", start,"-",end, total,elapsed);
					let percent = presentationalPercentageRounding(elapsed * 100 / total);

					resolve({ percent: percent, title: "Your Day" });
				})
			});
		});
	}

})();

let preferences = (function () {

	createSelectHoursElements(m_elmDayEnd, parseInt(startHour) + 1);

	createSelectHoursElements(m_elmDayEnd, dayEndFromValue);

	////////////////////////////////////////////////////////////////////////////////////
	function createSelectHoursElements(elm, nFrom, nTo = undefined) {

		while (elm.firstChild) {
			elm.removeChild(elm.firstChild);
		}

		let elmOption;
		let nLoopTo = (!!nTo) ? nTo : 24;

		for (let idx = nFrom; idx <= nLoopTo; idx++) {
			elmOption = createTagOption(idx, idx.toString().padStart(2, "0") + ":00");
			elm.appendChild(elmOption);
		}

		if (nTo === undefined) {
			for (let idx = 1; idx < nFrom-1; idx++) {
				elmOption = createTagOption(idx, idx.toString().padStart(2, "0") + ":00");
				elm.appendChild(elmOption);
			}
		}
	}

})();
