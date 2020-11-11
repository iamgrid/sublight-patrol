import idCreator from './idCreator';

const timing = {
	modes: {
		intro: 'intro',
		play: 'play',
		pause: 'pause',
	},
	times: {
		intro: 0,
		play: 0,
		pause: 0,
	},
	tickers: {
		intro: {},
		play: {},
		pause: {},
	},
	triggers: {
		intro: {},
		play: {},
		pause: {},
	},
	startTime: 0,
	currentMode: 'play',

	isPaused() {
		if (timing.currentMode === timing.modes.pause) return true;
		return false;
	},

	tick(mode, deltaMS) {
		timing.times[mode] += deltaMS;

		// timeouts
		for (const tickerId in timing.tickers[mode]) {
			timing.tickers[mode][tickerId].tick(deltaMS);
		}

		// triggers
		for (const triggerTime in timing.triggers[mode]) {
			if (triggerTime <= timing.times[mode]) {
				// execute callbackFns for these triggerTimes
				for (const triggerId in timing.triggers[mode][triggerTime])
					timing.triggers[mode][triggerTime][triggerId].finish();

				// remove triggerTimes that have been executed
				delete timing.triggers[mode][triggerTime];
			}
		}
	},

	setTimeout(callbackFn, mode, milliseconds) {
		// based on:
		// https://github.com/brenwell/pixi-timeout/blob/master/index.js
		let progress = 0;
		const tickerId = idCreator.create();

		const tick = (deltaMS) => {
			progress += deltaMS;

			if (progress > milliseconds) end(true);
		};

		const end = (fire) => {
			// remove from tickers
			delete timing.tickers[mode][tickerId];

			// fire callback function
			if (fire) callbackFn();
		};

		const clear = () => {
			end(false);
		};

		const finish = () => {
			end(true);
		};

		// start
		timing.tickers[mode][tickerId] = { tick };

		return { clear, finish };
	},

	clearTimeout(timerObj) {
		if (timerObj) timerObj.clear();
	},

	setTrigger(callbackFn, mode, milliseconds) {
		const triggerId = idCreator.create();
		const end = (fire) => {
			// remove from tickers
			delete timing.triggers[mode][milliseconds][triggerId];

			// fire callback function
			if (fire) callbackFn();
		};

		const clear = () => {
			end(false);
		};

		const finish = () => {
			end(true);
		};

		// set
		if (timing.triggers[mode][milliseconds] === undefined)
			timing.triggers[mode][milliseconds] = {};
		timing.triggers[mode][milliseconds][triggerId] = { finish };

		return { clear, finish };
	},

	clearTrigger(triggerObj) {
		if (triggerObj) triggerObj.clear();
	},
};

export default timing;
