import { randomNumber } from './utils/formulas';

const soundEffects = {
	handlers: { resources: null }, // gets its values in App.js
	// prettier-ignore
	manifest: {
		'laser_type1_1': './assets/sound_effects/laser_type1_1.mp3',
		'laser_type1_2': './assets/sound_effects/laser_type1_2.mp3',
		'laser_type1_3': './assets/sound_effects/laser_type1_3.mp3',
		'laser_type1_4': './assets/sound_effects/laser_type1_4.mp3',
	},
	// prettier-ignore
	library: {
		laser_type1: { id: 'laser_type1', variants: 4 }
	},

	playOnce(libraryItemId) {
		if (soundEffects.handlers.resources === null) return;

		const libraryItem = soundEffects.library[libraryItemId];

		const effectId = `${libraryItem.id}_${randomNumber(
			1,
			libraryItem.variants
		)}`;
		soundEffects.handlers.resources[effectId].sound.play({
			loop: false,
			singleInstance: false,
		});
	},
};

export default soundEffects;
