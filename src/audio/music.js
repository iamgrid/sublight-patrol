import audioLibrary from './audioLibrary';

const music = {
	handlers: { resources: null, PIXI_sound: null, pairedTrack: null }, // gets its values in App.js
	manifest: audioLibrary.manifest.music,
	library: audioLibrary.library.music,
	musicIsEnabled: true,
	playingTrack: null,
	domNodes: {
		musicPanel: document.getElementById('header__music'),
		enableMusicButton: document.getElementById('header__music-button'),
		playingReadout: document.getElementById('header__music-playing'),
	},

	init() {
		music.domNodes.musicPanel.onclick = music.toggleMusic;
	},

	toggleMusic() {
		// const functionSignature = 'music.js@toggleMusic()';

		const enable = !music.musicIsEnabled;

		// console.log(functionSignature, music.musicIsEnabled);
		document.getElementById(
			'header__music-button-icon--enabled'
		).style.display = enable ? 'block' : 'none';
		document.getElementById(
			'header__music-button-icon--disabled'
		).style.display = enable ? 'none' : 'block';

		// music.domNodes.playingReadout.innerHTML = "<span>Paused</span>";

		music.musicIsEnabled = enable;

		if (!enable) {
			music.stopPlaying();
			music.updateReadout('<span>Playback disabled</span>');
		} else {
			music.playTrack(music.handlers.pairedTrack.actual);
		}
	},

	updateReadout(newHTML) {
		music.domNodes.playingReadout.innerHTML = newHTML;
		music.domNodes.playingReadout.style.opacity = 1;

		setTimeout(() => {
			music.domNodes.playingReadout.style.opacity = 0;
		}, 8000);
	},

	playTrack(libraryItemId, startAt = 0) {
		const functionSignature = 'music.js@playTrack()';

		console.log(functionSignature, libraryItemId, startAt);

		if (music.handlers.resources === null) {
			console.error(functionSignature, 'music.handlers.resources is null');
			return;
		}

		if (!music.musicIsEnabled) {
			console.log(functionSignature, 'music.musicIsEnabled is false');
			return;
		}

		if (music.playingTrack !== null) {
			console.log(
				functionSignature,
				'music.playingTrack is not null, stopping it first'
			);
			music.stopPlaying();
		}

		music.playingTrack = libraryItemId;

		music.handlers.resources[libraryItemId].sound.play({
			loop: false,
			singleInstance: false,
			volume: 0.5,
			start: startAt,
			complete: () => {
				console.log(
					'music@playTrack() -> sound.play() -> complete(): track playback completed'
				);
				music.playingTrack = null;
			},
		});

		music.updateReadout(
			`<span>Playing:</span> ${music.library[libraryItemId].title}`
		);
	},

	stopPlaying() {
		console.log('@stopPlaying()');
		if (music.playingTrack === null) return;

		music.handlers.resources[music.playingTrack].sound.stop();
		music.playingTrack = null;
	},
};

export default music;
