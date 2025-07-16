import c from '../../utils/constants';
import controlSchemes from '../../controlSchemes';
// import timing from '../../utils/timing';
import plates from '../../plates';
import gameMenus from '../../gameMenus';
// import audioLibrary from '../../audio/audioLibrary';
// import music from '../../audio/music';

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
			execute(options) {
				// music.playTrack(
				// 	audioLibrary.library.music.sublight_patrol_theme.id,
				// 	25.0395
				// );
				// console.log('mainMenu.js@storyBeats[0].execute()', options);
				const shortenedGameVersion =
					c.gameVersion.substring(0, c.gameVersion.lastIndexOf(',')) + ')';
				document.getElementById('game__main_menu_version').innerHTML =
					shortenedGameVersion;
				if (options.hurryUp) {
					document
						.getElementById('game__main_menu')
						.classList.add('game__main_menu--quickshow');
				} else {
					document
						.getElementById('game__main_menu')
						.classList.add('game__main_menu--shown');
				}
				document
					.getElementById('header__title')
					.classList.add('header__title--hidden');
				plates.fullMatte();
				gameMenus.showMainMenuButtonSet();
			},
		},
	],
};

export default mainMenu;
