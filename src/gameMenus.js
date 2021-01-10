import c from './utils/constants';
import timing from './utils/timing';
import Button from './components/Button';
// import story from './story/story';

const gameMenus = {
	handlers: {
		menuStage: null,
		Matte: null,
		pixiHUD: null,
		showingMissionMenu: null,
		matteIsBeingUsedByPlates: null,
		hudShouldBeShowing: null,
	}, // gets its values in App.js
	buttonFunctions: {
		restartMission: null, // registered in story.js@init()
		mainMenu: null, // registered in story.js@init()
	},
	stageButtons: {},
	currentFocus: null,
	mattePauseOpacity: 80,
	correctedToPauseOpacityFrom: null,
	matteStep: 4,

	fadeInMatte(requestedBy = '') {
		if (gameMenus.handlers.matteIsBeingUsedByPlates.actual) {
			document.getElementById('game__plates').style.opacity = 0.2;
			const currentOpacity = Math.trunc(gameMenus.handlers.Matte.alpha * 100);
			if (currentOpacity < gameMenus.mattePauseOpacity) {
				gameMenus.correctedToPauseOpacityFrom = currentOpacity;
				gameMenus.handlers.Matte.alpha = gameMenus.mattePauseOpacity / 100;
			}
			if (c.debug.sequentialEvents)
				console.log(
					requestedBy,
					'-> gameMenus fadeInMatte (currently in use by plates.js)',
					currentOpacity,
					gameMenus.correctedToPauseOpacityFrom
				);

			return;
		}
		if (c.debug.sequentialEvents)
			console.log(requestedBy, '-> gameMenus.js@fadeInMatte()');
		gameMenus.handlers.pixiHUD.alpha = 0;
		document.getElementById('game__hud').style.opacity = 0;

		timing.setTrigger(
			'gameMenus fadeInMatte',
			() => {
				if (gameMenus.handlers.matteIsBeingUsedByPlates.actual) return;
				let currentOpacity = Math.trunc(gameMenus.handlers.Matte.alpha * 100);
				if (currentOpacity < gameMenus.mattePauseOpacity) {
					currentOpacity += gameMenus.matteStep;
					gameMenus.handlers.Matte.alpha = currentOpacity / 100;
				}
			},
			timing.modes.pause,
			0,
			true,
			22,
			40
		);
	},

	fadeOutMatte(requestedBy = '') {
		if (gameMenus.handlers.matteIsBeingUsedByPlates.actual) {
			document.getElementById('game__plates').style.opacity = 1;
			if (gameMenus.correctedToPauseOpacityFrom !== null) {
				gameMenus.handlers.Matte.alpha =
					gameMenus.correctedToPauseOpacityFrom / 100;
				gameMenus.correctedToPauseOpacityFrom = null;
			}
			if (c.debug.sequentialEvents)
				console.log(
					requestedBy,
					'-> gameMenus fadeOutMatte (currently in use by plates.js)',
					gameMenus.correctedToPauseOpacityFrom
				);
			return;
		}
		if (c.debug.sequentialEvents)
			console.log(
				requestedBy,
				'-> gameMenus.js@fadeOutMatte()',
				gameMenus.handlers.matteIsBeingUsedByPlates.actual
			);
		gameMenus.handlers.pixiHUD.alpha = 1;
		document.getElementById('game__hud').style.opacity = 1;

		timing.setTrigger(
			'gameMenus fadeOutMatte',
			() => {
				if (gameMenus.handlers.matteIsBeingUsedByPlates.actual) return;
				let currentOpacity = Math.trunc(gameMenus.handlers.Matte.alpha * 100);
				if (currentOpacity > 0) {
					currentOpacity -= gameMenus.matteStep;
					gameMenus.handlers.Matte.alpha = currentOpacity / 100;
				}
			},
			timing.modes.play,
			0,
			true,
			22,
			40
		);
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
					window.pixiapp.togglePause('dontFadeMatte');
					gameMenus.clearButtons();
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
					window.pixiapp.togglePause('dontFadeMatte');
					gameMenus.clearButtons();
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
