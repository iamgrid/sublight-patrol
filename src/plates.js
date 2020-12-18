import timing from './utils/timing';

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

	loadPlate(plateId) {
		console.log('loadPlate', plateId);
		let atlText = '';
		let btlText = '';

		switch (plateId) {
			case 'respawning':
				atlText = 'We have the technology';
				btlText = 'Returning to the scene with a new ship from your inventory';
				break;
			case 'game_over':
				atlText = 'Tis but a scratch';
				btlText = 'Game Over';
				break;
		}

		document.getElementById('game__plates_plate_atl').innerHTML = atlText;
		document.getElementById('game__plates_plate_btl').innerHTML = btlText;
	},

	fadeInPlate(steps = 25, delayMS = 0) {
		console.log('fadeInPlate', steps);

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
		console.log('fadeOutPlate', steps);

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
