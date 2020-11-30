const soundEffects = {
	// prettier-ignore
	manifest: {
		'laser_type1_1': './assets/sound_effects/laser_type1_1.mp3',
		'laser_type1_2': './assets/sound_effects/laser_type1_2.mp3',
		'laser_type1_3': './assets/sound_effects/laser_type1_3.mp3',
		'laser_type1_4': './assets/sound_effects/laser_type1_4.mp3',
	},
	handlers: { resources: null }, // gets its values in App.js

	playOnce(resourceId) {
		if (soundEffects.handlers.resources === null) return;

		soundEffects.handlers.resources[resourceId].sound.play({
			loop: false,
			singleInstance: false,
		});
	},
};

export default soundEffects;
