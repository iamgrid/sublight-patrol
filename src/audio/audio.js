const audio = {
	handlers: { PIXI_sound: null }, // gets its values in App.js
	defaultVolume: 0.4,
	muted: false,
	prevVolume: 0.4,
	domNodes: {
		audioControls: document.getElementById('header__sound'),
		slider: document.getElementById('header__volume_control_input'),
		muter: document.getElementById('header__volume_control_button'),
		muterIconUnmuted: document.getElementById(
			'header__volume_control_button__icon--unmuted'
		),
		muterIconMuted: document.getElementById(
			'header__volume_control_button__icon--muted'
		),
	},

	init() {
		const functionSignature = 'audio.js@init()';
		console.log(functionSignature);
		audio.domNodes.audioControls.style.display = 'flex';
		setTimeout(() => {
			audio.domNodes.audioControls.style.opacity = 1;
		}, 200);
		audio.domNodes.slider.oninput = audio.setVolume;
		audio.domNodes.slider.onchange = audio.setVolume;
		audio.domNodes.muter.onclick = audio.setVolume;

		audio.handlers.PIXI_sound.volumeAll = audio.defaultVolume;
		audio.domNodes.slider.value = audio.defaultVolume;
	},

	setVolume(event) {
		const functionSignature = 'audio.js@setVolume()';

		let mode = 'adjust';
		if (event.currentTarget.id === 'header__volume_control_button') {
			mode = 'mute-unmute';
			console.log(functionSignature, 'mute-unmute mode');
		}

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
			audio.domNodes.muterIconMuted.style.display = 'none';
			audio.domNodes.muterIconUnmuted.style.display = 'block';
		} else {
			audio.domNodes.muterIconMuted.style.display = 'block';
			audio.domNodes.muterIconUnmuted.style.display = 'none';
		}
	},
};

export default audio;
