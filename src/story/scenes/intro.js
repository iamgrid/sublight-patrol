import c from '../../utils/constants';
import controlSchemes from '../../controlSchemes';
import timing from '../../utils/timing';
import plates from '../../plates';
import story from '../story';
import audioLibrary from '../../audio/audioLibrary';
import music from '../../audio/music';

const intro = {
	handlers: { checkBeatCompletion: null }, // gets its values in story.js@advance()
	id: 'intro',
	pairedTrack: audioLibrary.library.music.sublight_patrol_theme.id,
	playVolume: {
		minX: -100,
		maxX: 1300,
		minY: -100,
		maxY: 550,
		softBoundary: 50,
	},
	storyBeats: [
		{
			keyboardLayout: controlSchemes.intro.id,
			cameraMode: c.cameraModes.stationary,
			// isTheFinalGameplayBeat: false,
			execute() {
				const functionSignature = 'intro.js@storyBeats[0].execute()';
				console.log(functionSignature);
				music.playTrack(audioLibrary.library.music.sublight_patrol_theme.id);
				plates.fullMatte();

				document.getElementById('game__intro').style.display = 'block';
				document
					.getElementById('game__intro-plate-1')
					.classList.remove('game__intro-plate--visible');
				document
					.getElementById('game__intro-plate-2')
					.classList.remove('game__intro-plate--visible');
				document
					.getElementById('game__intro-plate-3')
					.classList.remove('game__intro-plate--visible');

				let timingIterator = 1.2; // in seconds

				// PLATE 1
				timing.setTimeout(
					() => {
						document
							.getElementById('game__intro-plate-1')
							.classList.add('game__intro-plate--visible');
					},
					timing.modes.play,
					timingIterator * 1000
				);

				// text fade-in

				timingIterator += 0.1;

				timing.setTimeout(
					() => {
						document.getElementById(
							'game__intro-plate-1__big-text'
						).style.opacity = 1;
					},
					timing.modes.play,
					timingIterator * 1000
				);

				timingIterator += 0.9;

				timing.setTimeout(
					() => {
						document.getElementById(
							'game__intro-plate-1__small-text'
						).style.opacity = 1;
					},
					timing.modes.play,
					timingIterator * 1000
				);

				// text fade-out
				timingIterator += 4.9;

				timing.setTimeout(
					() => {
						document.getElementById(
							'game__intro-plate-1__big-text'
						).style.opacity = 0;
						document.getElementById(
							'game__intro-plate-1__small-text'
						).style.opacity = 0;
					},
					timing.modes.play,
					timingIterator * 1000
				);

				// PLATE 2
				timingIterator += 1.2; // in seconds

				timing.setTimeout(
					() => {
						document
							.getElementById('game__intro-plate-1')
							.classList.remove('game__intro-plate--visible');
						document
							.getElementById('game__intro-plate-2')
							.classList.add('game__intro-plate--visible');
					},
					timing.modes.play,
					timingIterator * 1000
				);

				// text fade-in

				timingIterator += 0.1;

				timing.setTimeout(
					() => {
						document.getElementById(
							'game__intro-plate-2__small-text'
						).style.opacity = 1;
					},
					timing.modes.play,
					timingIterator * 1000
				);

				timingIterator += 0.9;

				timing.setTimeout(
					() => {
						document.getElementById(
							'game__intro-plate-2__big-text'
						).style.opacity = 1;
					},
					timing.modes.play,
					timingIterator * 1000
				);

				// text fade-out
				timingIterator += 6;

				timing.setTimeout(
					() => {
						document.getElementById(
							'game__intro-plate-2__big-text'
						).style.opacity = 0;
						document.getElementById(
							'game__intro-plate-2__small-text'
						).style.opacity = 0;
					},
					timing.modes.play,
					timingIterator * 1000
				);

				// PLATE 3
				timingIterator += 1.5; // in seconds

				timing.setTimeout(
					() => {
						document
							.getElementById('game__intro-plate-2')
							.classList.remove('game__intro-plate--visible');
						document
							.getElementById('game__intro-plate-3')
							.classList.add('game__intro-plate--visible');
					},
					timing.modes.play,
					timingIterator * 1000
				);

				// text fade-in

				timingIterator += 0.1;

				timing.setTimeout(
					() => {
						document.getElementById(
							'game__intro-plate-3__small-text-1'
						).style.opacity = 1;
					},
					timing.modes.play,
					timingIterator * 1000
				);

				timingIterator += 1.8;

				timing.setTimeout(
					() => {
						document.getElementById(
							'game__intro-plate-3__big-text-1'
						).style.opacity = 1;
					},
					timing.modes.play,
					timingIterator * 1000
				);

				timingIterator += 1.1;

				timing.setTimeout(
					() => {
						document.getElementById(
							'game__intro-plate-3__small-text-2'
						).style.opacity = 1;
					},
					timing.modes.play,
					timingIterator * 1000
				);

				timingIterator += 1.3;

				timing.setTimeout(
					() => {
						document.getElementById(
							'game__intro-plate-3__big-text-2'
						).style.opacity = 1;
					},
					timing.modes.play,
					timingIterator * 1000
				);

				// text fade-out
				timingIterator += 5;

				timing.setTimeout(
					() => {
						document.getElementById(
							'game__intro-plate-3__big-text-1'
						).style.opacity = 0;
						document.getElementById(
							'game__intro-plate-3__small-text-1'
						).style.opacity = 0;
						document.getElementById(
							'game__intro-plate-3__big-text-2'
						).style.opacity = 0;
						document.getElementById(
							'game__intro-plate-3__small-text-2'
						).style.opacity = 0;
					},
					timing.modes.play,
					timingIterator * 1000
				);

				// Intro is done, advance to the main menu
				timing.setTimeout(
					() => {
						document.getElementById('game__intro').style.display = 'none';
						console.log('Advancing to main menu.');
						story.advance(functionSignature, 'mainMenu', 0);
					},
					timing.modes.play,
					27500
				);
			},
		},
	],
};

export default intro;
