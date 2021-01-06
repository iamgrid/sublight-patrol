import timing from './utils/timing';
import Button from './components/Button';
// import story from './story/story';

const gameMenus = {
	handlers: {
		menuStage: null,
		Matte: null,
		pixiHUD: null,
		showingMissionMenu: null,
	}, // gets its values in App.js
	buttonFunctions: {
		restartMission: null, // registered in story.js@init()
		mainMenu: null, // registered in story.js@init()
	},
	stageButtons: {},
	currentFocus: null,
	currentMatteAlpha: 0,
	maxMatteAlpha: 80,
	matteStep: 4,

	fadeInMatte() {
		gameMenus.handlers.pixiHUD.alpha = 0;
		document.getElementById('game__hud').style.opacity = 0;
		gameMenus.currentMatteAlpha = 0;
		timing.setTrigger(
			'gameMenus fadeInMatte',
			() => {
				if (gameMenus.currentMatteAlpha < gameMenus.maxMatteAlpha) {
					gameMenus.currentMatteAlpha += gameMenus.matteStep;
					gameMenus.handlers.Matte.alpha = gameMenus.currentMatteAlpha / 100;
				}
			},
			timing.modes.pause,
			0,
			true,
			22,
			40
		);
	},

	fadeOutMatte() {
		gameMenus.handlers.pixiHUD.alpha = 1;
		document.getElementById('game__hud').style.opacity = 1;
		gameMenus.currentMatteAlpha = gameMenus.maxMatteAlpha;
		timing.setTrigger(
			'gameMenus fadeOutMatte',
			() => {
				if (gameMenus.currentMatteAlpha > 0) {
					gameMenus.currentMatteAlpha -= gameMenus.matteStep;
					gameMenus.handlers.Matte.alpha = gameMenus.currentMatteAlpha / 100;
				}
			},
			timing.modes.play,
			0,
			true,
			22,
			40
		);
	},

	fullMatte() {
		gameMenus.handlers.pixiHUD.alpha = 0;
		document.getElementById('game__hud').style.opacity = 0;
		gameMenus.handlers.Matte.alpha = 1;
	},

	clearMatte() {
		gameMenus.handlers.pixiHUD.alpha = 1;
		document.getElementById('game__hud').style.opacity = 1;
		gameMenus.handlers.Matte.alpha = 0;
	},

	showPauseButtonSet() {
		gameMenus.currentFocus = 'resumeGame';

		const startX = 280;
		const startY = 48;
		gameMenus.stageButtons['resumeGame'] = new Button({
			coordsAndDimensions: {
				x: startX,
				y: startY,
				width: 200,
				height: 32,
			},
			label: 'Resume game',
			isFocused: true,
			doActivate: () => {
				console.log('doActivate resumeGame');
				window.pixiapp.togglePause();
				gameMenus.clearButtons();
			},
		});

		gameMenus.stageButtons['restartMission'] = new Button({
			coordsAndDimensions: {
				x: startX + 220,
				y: startY,
				width: 200,
				height: 32,
			},
			label: 'Restart mission',
			isFocused: false,
			doActivate: () => {
				console.log('doActivate restartMission');
				if (typeof gameMenus.buttonFunctions.restartMission === 'function') {
					gameMenus.buttonFunctions.restartMission();
					window.pixiapp.togglePause();
					gameMenus.clearButtons();
					gameMenus.clearMatte();
				}
			},
		});

		gameMenus.stageButtons['mainMenu'] = new Button({
			coordsAndDimensions: {
				x: startX + 440,
				y: startY,
				width: 200,
				height: 32,
			},
			label: 'Main menu',
			isFocused: false,
			doActivate: () => {
				console.log('doActivate mainMenu');
				if (typeof gameMenus.buttonFunctions.mainMenu === 'function') {
					gameMenus.buttonFunctions.mainMenu();
					window.pixiapp.togglePause();
					gameMenus.clearButtons();
					gameMenus.clearMatte();
				}
			},
		});

		gameMenus.handlers.menuStage.addChild(gameMenus.stageButtons['resumeGame']);
		gameMenus.handlers.menuStage.addChild(
			gameMenus.stageButtons['restartMission']
		);
		gameMenus.handlers.menuStage.addChild(gameMenus.stageButtons['mainMenu']);
	},

	showMissionFailedButtonSet() {
		gameMenus.currentFocus = 'restartMission';

		gameMenus.handlers.showingMissionMenu.actual = true;

		const startX = 390;
		const startY = 209;

		gameMenus.stageButtons['restartMission'] = new Button({
			coordsAndDimensions: {
				x: startX,
				y: startY,
				width: 200,
				height: 32,
			},
			label: 'Restart mission',
			isFocused: true,
			doActivate: () => {
				console.log('doActivate restartMission');
				if (typeof gameMenus.buttonFunctions.restartMission === 'function') {
					gameMenus.buttonFunctions.restartMission();
					gameMenus.clearButtons();
					gameMenus.clearMatte();
				}
			},
		});

		gameMenus.stageButtons['mainMenu'] = new Button({
			coordsAndDimensions: {
				x: startX + 220,
				y: startY,
				width: 200,
				height: 32,
			},
			label: 'Main menu',
			isFocused: false,
			doActivate: () => {
				console.log('doActivate mainMenu');
				if (typeof gameMenus.buttonFunctions.mainMenu === 'function') {
					gameMenus.buttonFunctions.mainMenu();
					gameMenus.clearButtons();
					gameMenus.clearMatte();
				}
			},
		});

		gameMenus.handlers.menuStage.addChild(
			gameMenus.stageButtons['restartMission']
		);
		gameMenus.handlers.menuStage.addChild(gameMenus.stageButtons['mainMenu']);
	},

	clearButtons() {
		gameMenus.handlers.showingMissionMenu.actual = false;
		for (const stageButtonId in gameMenus.stageButtons) {
			gameMenus.handlers.menuStage.removeChild(
				gameMenus.stageButtons[stageButtonId]
			);
			gameMenus.stageButtons[stageButtonId].destroy();
			delete gameMenus.stageButtons[stageButtonId];
		}
	},

	cycleFocus(dir = 'forward') {
		const keys = Object.keys(gameMenus.stageButtons);
		const noOfButtons = keys.length;
		const currentFocusIdx = keys.findIndex(
			(el) => el === gameMenus.currentFocus
		);
		let newIdx;
		if (dir === 'forward') {
			newIdx = currentFocusIdx + 1;
			if (newIdx + 1 > noOfButtons) newIdx = 0;
		} else {
			newIdx = currentFocusIdx - 1;
			if (newIdx < 0) newIdx = noOfButtons - 1;
		}

		gameMenus.currentFocus = keys[newIdx];

		for (const buttonId in gameMenus.stageButtons) {
			gameMenus.stageButtons[buttonId].doBlur();
		}
		gameMenus.stageButtons[gameMenus.currentFocus].doFocus();

		// console.log({ dir, noOfButtons, currentFocusIdx, newIdx }, keys[newIdx]);
	},

	activateFocusedButton() {
		const currentFocus = gameMenus.currentFocus;
		gameMenus.stageButtons[currentFocus].doActivate();
		// console.log('activateFocusedButton: ', currentFocus);
	},
};

export default gameMenus;
