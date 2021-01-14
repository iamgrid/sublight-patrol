import c from './utils/constants';
import timing from './utils/timing';
import hud from './hud';
import { alertsAndWarnings, dialog } from './utils/helpers';
import { randomNumber } from './utils/formulas';

const plates = {
	handlers: {
		Matte: null,
		matteIsBeingUsedByPlates: null,
		hudShouldBeShowing: null,
	}, // gets its values in App.js
	scheduledEvents: {
		fadeInMatte: null,
		fadeOutMatte: null,
		fadeOutMatteCleanUp: null,
		fadeInPlate: null,
		fadeOutPlate: null,
	},

	fadeInMatte(steps = 25, delayMS = 0) {
		// 1 seconds is 25 steps because 25*40 = 1000 milliseconds
		alertsAndWarnings.hide();
		dialog.hide();

		if (hud.hudIsShowing) hud.toggle('plates.js@fadeInMatte()', false);

		plates.handlers.matteIsBeingUsedByPlates.actual = true;

		const opacityFraction = 100 / steps;

		if (c.debug.sequentialEvents)
			console.log(
				'plates.js@fadeInMatte()',
				steps,
				delayMS,
				plates.handlers.Matte.alpha
			);

		let firstRun = true;

		plates.scheduledEvents.fadeInMatte = timing.setTrigger(
			'plates.js fadeInMatte',
			() => {
				if (firstRun) {
					plates.handlers.Matte.alpha = 0;
					firstRun = false;
					return;
				}
				const currentOpacity = Math.trunc(plates.handlers.Matte.alpha * 100);
				if (c.debug.sequentialEvents) console.log(currentOpacity);

				if (currentOpacity < 100) {
					plates.handlers.Matte.alpha =
						(currentOpacity + opacityFraction) / 100;
				}
			},
			timing.modes.play,
			delayMS,
			true,
			steps + 1,
			40
		);
	},

	fadeOutMatte(steps = 25, delayMS = 0) {
		const opacityFraction = 100 / steps;

		if (c.debug.sequentialEvents)
			console.log(
				'plates.js@fadeOutMatte()',
				steps,
				delayMS,
				plates.handlers.Matte.alpha
			);

		let firstRun = true;

		plates.scheduledEvents.fadeOutMatte = timing.setTrigger(
			'plates.js fadeOutMatte',
			() => {
				if (firstRun) {
					plates.handlers.Matte.alpha = 1;
					firstRun = false;
					return;
				}
				const currentOpacity = Math.trunc(plates.handlers.Matte.alpha * 100);
				if (c.debug.sequentialEvents) console.log(currentOpacity);

				if (currentOpacity > 0)
					plates.handlers.Matte.alpha =
						(currentOpacity - opacityFraction) / 100;
			},
			timing.modes.play,
			delayMS,
			true,
			steps + 1,
			40
		);

		plates.scheduledEvents.fadeOutMatteCleanUp = timing.setTimeout(
			() => {
				plates.handlers.matteIsBeingUsedByPlates.actual = false;
				if (plates.handlers.hudShouldBeShowing) {
					hud.toggle('plates.js@fadeOutMatte()', true);
					alertsAndWarnings.show();
					dialog.show();
				}
			},
			timing.modes.play,
			delayMS + (steps + 1) * 40
		);
	},

	fullMatte() {
		plates.handlers.Matte.alpha = 1;
		plates.handlers.matteIsBeingUsedByPlates.actual = true;
		if (c.debug.sequentialEvents)
			console.log('plates.js@fullMatte()', plates.handlers.Matte.alpha);
		if (hud.hudIsShowing) hud.toggle('plates.js@fullMatte()', false);
	},

	loadPlate(plateId, quoteVariant = '', mainText = '', wittyText = '') {
		if (c.debug.sequentialEvents)
			console.log('loadPlate', plateId, quoteVariant, mainText, wittyText);
		let atlText = '';
		let btlText = '';

		const respawnQuoteVariants = {
			fenrir_dominator: "With a lil' help from my friends",
			valkyrie: 'Mess with the bull, get the horns',
			zangari_fighter_type_4: "It's jackhammer o'clock",
		};

		const missionSuccessQuoteVariants = [
			'Yeah baby!',
			'Easy-peasy',
			'This was worth getting out of bed for',
			"Ya boy 's got some moves",
			"Kickin' butt, takin' names",
			"That's what I do. I drink and I green objectives.",
		];

		const missionFailedQuoteVariants = [
			'Dagnabbit',
			'Gosh darnit',
			'Darn it all to heck!',
			'Fork.',
			'You forgot to work the thingamabob.',
		];

		switch (plateId) {
			case 'respawning':
				atlText = '';
				if (quoteVariant !== '') atlText = respawnQuoteVariants[quoteVariant];
				btlText =
					'Returning to the scene with a another craft from your hangar';
				break;
			case 'game_over':
				atlText = 'Tis but a scratch';
				btlText = 'Game Over';
				break;
			case 'the_end':
				atlText = "I'm proud of you.";
				btlText = 'Congratulations, you have finished the game!';
				break;
			case 'mission_failed':
				atlText =
					missionFailedQuoteVariants[
						randomNumber(0, missionFailedQuoteVariants.length - 1)
					];
				btlText = mainText;
				break;
			case 'mission_success':
				atlText =
					missionSuccessQuoteVariants[
						randomNumber(0, missionSuccessQuoteVariants.length - 1)
					];
				btlText = 'Mission success';
				break;
			case 'mission_title':
				atlText = wittyText;
				btlText = mainText;
				break;
		}

		document.getElementById('game__plates_plate_atl').innerHTML = atlText;
		document.getElementById('game__plates_plate_btl').innerHTML = btlText;
	},

	fadeInPlate(steps = 25, delayMS = 0) {
		// console.log('fadeInPlate', steps);

		document
			.getElementById('game__plates_plate_line')
			.classList.add('game__plates_plate_line--shown');

		const opacityFraction = 1 / steps;

		plates.scheduledEvents.fadeInPlate = timing.setTrigger(
			'fadeInPlate',
			() => {
				const currentOpacity = Number(
					document.getElementById('game__plates_plate').style.opacity
				);

				if (currentOpacity < 1) {
					document.getElementById('game__plates_plate').style.opacity =
						currentOpacity + opacityFraction;
				}
			},
			timing.modes.play,
			delayMS,
			true,
			steps,
			40
		);
	},

	fadeOutPlate(steps = 25, delayMS = 0) {
		// console.log('fadeOutPlate', steps);

		const opacityFraction = 1 / steps;

		plates.scheduledEvents.fadeOutPlate = timing.setTrigger(
			'fadeInPlate',
			() => {
				const currentOpacity = Number(
					document.getElementById('game__plates_plate').style.opacity
				);

				if (currentOpacity > 0) {
					document.getElementById('game__plates_plate').style.opacity =
						currentOpacity - opacityFraction;
				} else {
					document
						.getElementById('game__plates_plate_line')
						.classList.remove('game__plates_plate_line--shown');
					document.getElementById('game__plates_plate_atl').innerHTML = '';
					document.getElementById('game__plates_plate_btl').innerHTML = '';
				}
			},
			timing.modes.play,
			delayMS,
			true,
			steps + 3,
			40
		);
	},

	clearAll() {
		// for (const scheduledEventId in plates.scheduledEvents) {
		// 	if (plates.scheduledEvents[scheduledEventId] !== null)
		// 		plates.scheduledEvents[scheduledEventId].clear();
		// } -- this is now accomplished with calling timing.js@clearAllScheduledEvents()

		document.getElementById('game__plates_plate').style.opacity = 0;
		document
			.getElementById('game__plates_plate_line')
			.classList.remove('game__plates_plate_line--shown');

		document.getElementById('game__plates_plate_atl').innerHTML = '';
		document.getElementById('game__plates_plate_btl').innerHTML = '';

		plates.handlers.Matte.alpha = 1;
		plates.handlers.matteIsBeingUsedByPlates.actual = true;
		if (c.debug.sequentialEvents)
			console.log(
				'plates.js@clearAll()',
				plates.scheduledEvents,
				plates.handlers.Matte.alpha
			);
	},
};

export default plates;
