import audioLibrary from './audioLibrary';

const music = {
	handlers: { resources: null, PIXI_sound: null }, // gets its values in App.js
	manifest: audioLibrary.manifest.music,
	library: audioLibrary.library.music,
	themeIsPlaying: false,
	playingTrack: null,

	playTrack(libraryItemId, startAt = 0) {
		if (music.handlers.resources === null) return;

		if (libraryItemId === audioLibrary.library.music.sublight_patrol_theme.id) {
			if (music.themeIsPlaying) {
				console.log('@playTrack(): theme is already playing');
				return;
			} else {
				music.themeIsPlaying = true;
			}
		}

		if (music.playingTrack !== null) {
			console.log(
				'@playTrack(): music.playingTrack is not null, stopping it first'
			);
			music.stopPlaying();
		}

		music.playingTrack = libraryItemId;

		music.handlers.resources[libraryItemId].sound.play({
			loop: false,
			singleInstance: false,
			volume: 0.5,
			start: startAt,
		});
	},

	stopPlaying() {
		console.log('@stopPlaying()');
		if (music.playingTrack === null) return;

		music.handlers.resources[music.playingTrack].sound.stop();
		music.playingTrack = null;
		music.themeIsPlaying = false;
	},
};

export default music;
