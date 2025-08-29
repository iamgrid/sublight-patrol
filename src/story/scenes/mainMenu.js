import c from '../../utils/constants';
import controlSchemes from '../../controlSchemes';
import plates from '../../plates';
import gameMenus from '../../gameMenus';
import audioLibrary from '../../audio/audioLibrary';
import { shortenGameVersion } from '../../utils/helpers';
import finishers from '../../finishers';

const mainMenu = {
	handlers: { checkBeatCompletion: null }, // gets its values in story.js@advance()
	id: 'mainMenu',
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
			keyboardLayout: controlSchemes.gameMenus.id,
			cameraMode: c.cameraModes.stationary,
			// isTheFinalGameplayBeat: false,
			execute(options) {
				document.getElementById('game__intro').style.display = 'none';

				document.getElementById('game__finishers').style.display = 'flex';
				finishers.updatePreview(true);

				const shortenedGameVersion = shortenGameVersion(c.gameVersion);
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
