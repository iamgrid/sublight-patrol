import c from '../../utils/constants';
import controlSchemes from '../../controlSchemes';
import timing from '../../utils/timing';
import plates from '../../plates';
import story from '../story';

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
				console.log('intro.js@storyBeats[0].execute()');
				plates.fullMatte();
				timing.setTimeout(
					() => {
						console.log('Advancing to main menu.');
						story.advance('mainMenu', 0);
					},
					timing.modes.play,
					3000
				);
			},
		},
	],
};

export default intro;
