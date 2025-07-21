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
				timing.setTimeout(
					() => {
						console.log('Advancing to main menu.');
						story.advance(functionSignature, 'mainMenu', 0);
					},
					timing.modes.play,
					25000
				);
			},
		},
	],
};

export default intro;
