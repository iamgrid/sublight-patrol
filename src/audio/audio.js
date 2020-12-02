const audio = {
	handlers: { PIXI_sound: null }, // gets its values in App.js
	defaultVolume: 0.4,
	muted: false,
	prevVolume: 0.4,
	domNodes: {
		slider: document.getElementById('header__volume_control_input'),
		muter: document.getElementById('header__volume_control_button'),
	},
	unmutedEmoji: '&#x1F50A;',
	mutedEmoji: '&#x1F508;',

	init() {
		audio.domNodes.slider.onchange = audio.setVolume;
		audio.domNodes.muter.onclick = audio.setVolume;

		audio.handlers.PIXI_sound.volumeAll = audio.defaultVolume;
		audio.domNodes.slider.value = audio.defaultVolume;
	},

	setVolume(event) {
		let mode = 'adjust';
		if (event.target.id === 'header__volume_control_button')
			mode = 'mute-unmute';

		let setTo = 1;
		if (mode === 'adjust') {
			const reqVolume = audio.domNodes.slider.value;
			if (reqVolume > 0) {
				audio.muted = false;
				audio.switchMuterIcon(true);
				audio.prevVolume = reqVolume;
				setTo = reqVolume;
			} else {
				audio.muted = true;
				audio.switchMuterIcon(false);
				setTo = reqVolume;
			}
		} else {
			if (audio.muted) {
				audio.muted = false;
				audio.switchMuterIcon(true);
				audio.domNodes.slider.value = audio.prevVolume;
				setTo = audio.prevVolume;
			} else {
				audio.muted = true;
				audio.switchMuterIcon(false);
				audio.domNodes.slider.value = 0;
				setTo = 0;
			}
		}

		audio.handlers.PIXI_sound.volumeAll = setTo;
	},

	switchMuterIcon(mode = true) {
		if (mode) {
			audio.domNodes.muter.innerHTML = audio.unmutedEmoji;
			audio.domNodes.muter.classList.remove(
				'header__volume_control_button--muted'
			);
		} else {
			audio.domNodes.muter.innerHTML = audio.mutedEmoji;
			audio.domNodes.muter.classList.add(
				'header__volume_control_button--muted'
			);
		}
	},
};

export default audio;
