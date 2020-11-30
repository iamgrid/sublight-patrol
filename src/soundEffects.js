import { randomNumber } from './utils/formulas';

const soundEffects = {
	handlers: { resources: null }, // gets its values in App.js
	// prettier-ignore
	manifest: {
		'laser_type1_1': 'laser_type1_1.mp3',
		'laser_type1_2': 'laser_type1_2.mp3',
		'laser_type1_3': 'laser_type1_3.mp3',
		'laser_type1_4': 'laser_type1_4.mp3',
		'laser_type2_1': 'laser_type2_1.mp3',
		'laser_type2_2': 'laser_type2_2.mp3',
		'laser_type2_3': 'laser_type2_3.mp3',
		'laser_type2_4': 'laser_type2_4.mp3',
		'shield_damage_1': 'shield_damage_1.mp3',
		'shield_damage_2': 'shield_damage_2.mp3',
		'shield_damage_3': 'shield_damage_3.mp3',
		'shield_damage_4': 'shield_damage_4.mp3',
		'hull_damage_high_health_1': 'hull_damage_high_health_1.mp3',
		'hull_damage_high_health_2': 'hull_damage_high_health_2.mp3',
		'hull_damage_high_health_3': 'hull_damage_high_health_3.mp3',
		'hull_damage_high_health_4': 'hull_damage_high_health_4.mp3',
	},
	// prettier-ignore
	library: {
		laser_type1: { id: 'laser_type1', variants: 4 },
		laser_type2: { id: 'laser_type2', variants: 4 },
		shield_damage: { id: 'shield_damage', variants: 4 },
		hull_damage_high_health: { id: 'hull_damage_high_health', variants: 4 },
		hull_damage_low_health: { id: 'hull_damage_low_health', variants: 3 },
		hull_damage_sys_dropout: { id: 'hull_damage_sys_dropout', variants: 2 },
	},

	playOnce(libraryItemId, variant = -1) {
		if (soundEffects.handlers.resources === null) return;

		const libraryItem = soundEffects.library[libraryItemId];

		let effectVariant = variant;
		if (effectVariant === -1)
			effectVariant = randomNumber(1, libraryItem.variants);

		const effectId = `${libraryItem.id}_${effectVariant}`;
		soundEffects.handlers.resources[effectId].sound.play({
			loop: false,
			singleInstance: false,
		});
	},
};

export default soundEffects;
