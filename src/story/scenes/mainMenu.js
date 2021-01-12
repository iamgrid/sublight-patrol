import c from '../../utils/constants';
import controlSchemes from '../../controlSchemes';
// import timing from '../../utils/timing';
import plates from '../../plates';
import gameMenus from '../../gameMenus';

const mainMenu = {
	handlers: { checkBeatCompletion: null }, // gets its values in story.js@advance()
	id: 'mainMenu',
	playVolume: {
		minX: -100,
		maxX: 1300,
		minY: -100,
		maxY: 550,
		softBoundary: 50,
	},
	storyBeats: [
		{
			keyboardLayout: controlSchemes.gameMenus.id,
			cameraMode: c.cameraModes.stationary,
			// isTheFinalGameplayBeat: false,
			execute() {
				console.log('main menu');
				plates.fullMatte();
				gameMenus.showMainMenuButtonSet();
			},
		},
	],
};

export default mainMenu;
