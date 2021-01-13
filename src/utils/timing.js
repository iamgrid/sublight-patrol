import c from './constants';
import idCreator from './idCreator';

const timing = {
	modes: {
		play: 'play',
		pause: 'pause',
	},
	times: {
		play: 0,
		pause: 0,
	},
	tickingTimeouts: {
		play: {},
		pause: {},
	},
	triggers: {},
	triggerTimes: {
		play: {},
		pause: {},
	},
	startTime: 0,
	entityMovementEnabled: false,
	currentMode: 'play',

	isPaused() {
		if (timing.currentMode === timing.modes.pause) return true;
		return false;
	},

	toggleEntityMovement(toggle = true, requestedBy = '', delayMS = 0) {
		if (c.debug.sequentialEvents)
			console.log(requestedBy, '-> Entity movement toggled: ', toggle, delayMS);
		if (delayMS === 0) {
			timing.entityMovementEnabled = toggle;
		} else {
			timing.setTimeout(
				() => {
					timing.entityMovementEnabled = toggle;
				},
				timing.modes.play,
				delayMS
			);
		}
	},

	isEntityMovementEnabled() {
		return timing.entityMovementEnabled;
	},

	tick(mode, deltaMS) {
		timing.times[mode] += deltaMS;

		// timeouts
		for (const tickerId in timing.tickingTimeouts[mode]) {
			timing.tickingTimeouts[mode][tickerId].tick(deltaMS);
		}

		// triggers
		for (const triggerTime in timing.triggerTimes[mode]) {
			if (triggerTime <= timing.times[mode]) {
				// execute callbackFns for these triggerTimes
				timing.triggerTimes[mode][triggerTime].forEach((triggerId) => {
					if (timing.triggers[triggerId] !== undefined)
						timing.triggers[triggerId].run();
				});

				// remove triggerTimes that have been executed
				delete timing.triggerTimes[mode][triggerTime];
			}
		}
	},

	setTimeout(callbackFn, mode, delayMS) {
		// based on:
		// https://github.com/brenwell/pixi-timeout/blob/master/index.js
		let progress = 0;
		const tickerId = idCreator.create();

		const tick = (deltaMS) => {
			progress += deltaMS;

			if (progress > delayMS) end(true);
		};

		const end = (fire) => {
			// remove from tickingTimeouts
			delete timing.tickingTimeouts[mode][tickerId];

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
		timing.tickingTimeouts[mode][tickerId] = { tick, clear };

		return { clear, finish };
	},

	clearTimeout(timerObj) {
		if (timerObj) timerObj.clear();
	},

	setTrigger(
		desc = '',
		callbackFn,
		mode,
		delayMS,
		relative = false,
		repetitions = 0,
		repetitionIntervalMS = 30
	) {
		const triggerId = desc + '_' + idCreator.create();
		let delay = Math.max(30, delayMS);
		if (relative) delay = delayMS + Math.trunc(timing.times[mode]);
		const repetitionInterval = Math.max(30, repetitionIntervalMS);

		const clear = () => {
			// remove from triggers
			delete timing.triggers[triggerId];
		};

		const run = () => {
			if (repetitions === 0) clear();

			callbackFn();
		};

		// set
		timing.triggers[triggerId] = { run, clear };

		let reps = repetitions + 1;
		while (reps > 0) {
			let currentDelay =
				delay + (repetitions - (reps - 1)) * repetitionInterval;
			if (timing.triggerTimes[mode][currentDelay] === undefined) {
				timing.triggerTimes[mode][currentDelay] = [triggerId];
			} else {
				timing.triggerTimes[mode][currentDelay].push(triggerId);
			}

			reps--;
		}

		return { clear, run };
	},

	clearTrigger(triggerObj) {
		if (triggerObj) triggerObj.clear();
	},

	clearAllScheduledEvents() {
		for (const modeId in timing.modes) {
			for (const tickerId in timing.tickingTimeouts[modeId]) {
				timing.tickingTimeouts[modeId][tickerId].clear();
			}
		}

		for (const triggerId in timing.triggers) {
			timing.triggers[triggerId].clear();
		}

		if (c.debug.sequentialEvents)
			console.log(
				'Cleared all scheduled events: ',
				timing.tickingTimeouts,
				timing.triggers
			);
	},
};

export default timing;
