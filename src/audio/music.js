import audioLibrary from './audioLibrary';

const music = {
	handlers: { resources: null, PIXI_sound: null, pairedTrack: null }, // gets its values in App.js
	manifest: audioLibrary.manifest.music,
	library: audioLibrary.library.music,
	musicIsEnabled: true,
	playingTrack: null,
	readoutTimeout: null,
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
			music.updateReadout('<span>Music playback disabled</span>');
		} else {
			music.playTrack(music.handlers.pairedTrack.actual);
		}
	},

	updateReadout(newHTML) {
		music.domNodes.playingReadout.innerHTML = newHTML;
		music.domNodes.playingReadout.classList.remove(
			'header__music-playing--fade-out'
		);

		clearTimeout(music.readoutTimeout);
		music.readoutTimeout = setTimeout(() => {
			music.domNodes.playingReadout.classList.add(
				'header__music-playing--fade-out'
			);
		}, 6500);
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

		if (music.playingTrack === libraryItemId) {
			console.log(
				functionSignature,
				'music.playingTrack is already the requested track'
			);
			return;
		}

		if (music.playingTrack !== null) {
			console.log(
				functionSignature,
				'music.playingTrack is not null and is not the requested track, stopping playback first'
			);
			music.stopPlaying();
		}

		music.playingTrack = libraryItemId;

		let volume = 0.4;
		if (libraryItemId === audioLibrary.library.music.sublight_patrol_theme.id) {
			volume = 0.5;
		} else if (
			libraryItemId === audioLibrary.library.music.mission_override.id
		) {
			volume = 0.28;
		}

		music.handlers.resources[libraryItemId].sound.play({
			loop: false,
			singleInstance: false,
			volume,
			start: startAt,
			complete: () => {
				console.log(
					'music@playTrack() -> sound.play() -> complete(): track playback completed'
				);
				music.playingTrack = null;
			},
		});

		music.handlers.resources[libraryItemId].sound.volume = 1; // reset volume in case this track was previously faded out

		music.updateReadout(
			`<span>Playing:</span> ${music.library[libraryItemId].title}`
		);
	},

	fadeOutPlayingTrack() {
		const functionSignature = 'music.js@fadeOutPlayingTrack()';
		console.log(functionSignature);
		if (music.playingTrack === null) {
			console.log(functionSignature, 'music.playingTrack is null');
			return;
		}

		const fadeAudio = setInterval(() => {
			const currentVolume =
				music.handlers.resources[music.playingTrack].sound.volume; // volume here will start from 1

			// console.log(
			// 	functionSignature,
			// 	'fadeAudio interval fn()',
			// 	'currentVolume',
			// 	currentVolume
			// );
			if (currentVolume > 0.025) {
				music.handlers.resources[music.playingTrack].sound.volume -= 0.025;
			} else {
				clearInterval(fadeAudio);
				music.stopPlaying();
			}
		}, 120);
	},

	stopPlaying() {
		const functionSignature = 'music.js@stopPlaying()';
		console.log(functionSignature);
		if (music.playingTrack === null) {
			console.log(functionSignature, 'music.playingTrack is null');
			return;
		}

		music.handlers.resources[music.playingTrack].sound.stop();
		music.playingTrack = null;
	},
};

export default music;
