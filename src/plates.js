import timing from './utils/timing';
import { randomNumber } from './utils/formulas';

const plates = {
	fadeInMatte(steps = 25, delayMS = 0) {
		// 1 seconds is 25 steps because 25*40 = 1000 milliseconds
		// console.log('fadeInMatte', steps);
		const opacityFraction = 1 / steps;

		timing.setTrigger(
			'fadeInMatte',
			() => {
				const currentOpacity = Number(
					document.getElementById('game__plates_matte').style.opacity
				);

				if (currentOpacity < 1) {
					document.getElementById('game__plates_matte').style.opacity =
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

	fadeOutMatte(steps = 25, delayMS = 0) {
		const opacityFraction = 1 / steps;

		timing.setTrigger(
			'fadeInMatte',
			() => {
				const currentOpacity = Number(
					document.getElementById('game__plates_matte').style.opacity
				);

				if (currentOpacity > 0)
					document.getElementById('game__plates_matte').style.opacity =
						currentOpacity - opacityFraction;
			},
			timing.modes.play,
			delayMS,
			true,
			steps,
			40
		);
	},

	fullMatte() {
		document.getElementById('game__plates_matte').style.opacity = 1;
	},

	loadPlate(plateId, quoteVariant = -1, mainText = '', wittyText = '') {
		console.log('loadPlate', plateId, quoteVariant, mainText, wittyText);
		let atlText = '';
		let btlText = '';

		const respawnQuoteVariants = [
			"With a lil' help from my friends",
			'Mess with the bull, get the horns',
			"It's jackhammer o'clock",
		];

		const missionSuccessQuoteVariants = [
			'Yeah baby!',
			'Easy-peasy',
			'This was worth getting out of bed for',
			"Ya boy 's got some moves",
			"Kickin' ass, takin' names",
			"That's what I do. I drink and I green objectives.",
		];

		switch (plateId) {
			case 'respawning':
				atlText = respawnQuoteVariants[1];
				if (quoteVariant > -1) atlText = respawnQuoteVariants[quoteVariant];
				btlText =
					'Returning to the scene with a stronger ship from your inventory';
				break;
			case 'game_over':
				atlText = 'Tis but a scratch';
				btlText = 'Game Over';
				break;
			case 'the_end':
				atlText = "All's well that ends well";
				btlText = 'Congratulations, you have finished the game!';
				break;
			case 'mission_failed':
				atlText = 'dagnabbit';
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

		timing.setTrigger(
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

		timing.setTrigger(
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
};

export default plates;
