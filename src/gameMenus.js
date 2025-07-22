import c from './utils/constants';
import timing from './utils/timing';
import Button from './components/Button';
import {
	readPlayerProgress,
	getHasThePlayerMadeProgress,
	alertsAndWarnings,
	messageLayer,
	getHasThePlayerCompletedTheGame,
} from './utils/helpers';
import soundEffects from './audio/soundEffects';

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
		// registered in story.js@init()
		restartMission: null,
		mainMenu: null,
		newGame: null,
		continueGame: null,
		replaySceneMenu: null,
		replaySceneActual: null,
	},
	scheduledEvents: {
		fadeInButtons: null,
	},
	stageButtons: {},
	currentFocus: null,
	mattePauseOpacity: 80,
	correctedToPauseOpacityFrom: null,
	matteStep: 4,

	fadeInMatte(requestedBy = '') {
		alertsAndWarnings.hide();
		messageLayer.hide();
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
		alertsAndWarnings.show();
		messageLayer.show();
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
				if (c.debug.menuButtons) console.log('doActivate resumeGame');
				gameMenus.clearButtons();
				window.pixiapp.togglePause();
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
				if (c.debug.menuButtons) console.log('doActivate restartMission');
				gameMenus.buttonFunctions.restartMission();
				window.pixiapp.togglePause('dontFadeMatte');
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
				if (c.debug.menuButtons) console.log('doActivate mainMenu');
				gameMenus.buttonFunctions.mainMenu();
			},
		});

		gameMenus.handlers.menuStage.addChild(gameMenus.stageButtons['resumeGame']);
		gameMenus.handlers.menuStage.addChild(
			gameMenus.stageButtons['restartMission']
		);
		gameMenus.handlers.menuStage.addChild(gameMenus.stageButtons['mainMenu']);

		gameMenus.fadeInButtons();
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
				if (c.debug.menuButtons) console.log('doActivate restartMission');
				gameMenus.buttonFunctions.restartMission();
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
				if (c.debug.menuButtons) console.log('doActivate mainMenu');
				gameMenus.buttonFunctions.mainMenu(false, false, true);
			},
		});

		gameMenus.handlers.menuStage.addChild(
			gameMenus.stageButtons['restartMission']
		);
		gameMenus.handlers.menuStage.addChild(gameMenus.stageButtons['mainMenu']);

		gameMenus.fadeInButtons();
	},

	showMainMenuButtonSet() {
		gameMenus.currentFocus = 'newGame';

		const localStoragePlayerProgress = readPlayerProgress();
		let relevantPlayerProgress = getHasThePlayerMadeProgress(
			localStoragePlayerProgress
		);

		let hasThePlayerCompletedTheGame = getHasThePlayerCompletedTheGame(
			localStoragePlayerProgress
		);

		if (relevantPlayerProgress && !hasThePlayerCompletedTheGame) {
			gameMenus.currentFocus = 'continueGame';
		} else if (hasThePlayerCompletedTheGame) {
			gameMenus.currentFocus = 'replayScene';
		}

		const startX = 280;
		const startY = 330;
		gameMenus.stageButtons['newGame'] = new Button({
			coordsAndDimensions: {
				x: startX,
				y: startY,
				width: 200,
				height: 32,
			},
			label: 'New game',
			isFocused: gameMenus.currentFocus === 'newGame',
			doActivate: () => {
				if (c.debug.menuButtons) console.log('doActivate newGame');
				gameMenus.buttonFunctions.newGame();
			},
		});

		gameMenus.stageButtons['continueGame'] = new Button({
			coordsAndDimensions: {
				x: startX + 220,
				y: startY,
				width: 200,
				height: 32,
			},
			label: 'Continue game',
			isFocused: gameMenus.currentFocus === 'continueGame',
			isDisabled: !relevantPlayerProgress || hasThePlayerCompletedTheGame,
			doActivate: () => {
				if (c.debug.menuButtons) console.log('doActivate continueGame');
				gameMenus.buttonFunctions.continueGame();
			},
		});

		gameMenus.stageButtons['replayScene'] = new Button({
			coordsAndDimensions: {
				x: startX + 440,
				y: startY,
				width: 200,
				height: 32,
			},
			label: 'Replay scene',
			isFocused: gameMenus.currentFocus === 'replayScene',
			isDisabled: !relevantPlayerProgress,
			doActivate: () => {
				if (c.debug.menuButtons) console.log('doActivate replayScene');
				gameMenus.buttonFunctions.replaySceneMenu();
			},
		});

		gameMenus.handlers.menuStage.addChild(gameMenus.stageButtons['newGame']);
		gameMenus.handlers.menuStage.addChild(
			gameMenus.stageButtons['continueGame']
		);
		gameMenus.handlers.menuStage.addChild(
			gameMenus.stageButtons['replayScene']
		);

		gameMenus.fadeInButtons();
	},

	showReplaySceneButtonSet(sceneList) {
		const functionSignature = 'gameMenus.js@showReplaySceneButtonSet()';
		const localStoragePlayerProgress = readPlayerProgress();

		if (localStoragePlayerProgress === null) {
			console.error(
				functionSignature,
				'No player progress found in localStorage'
			);
			return;
		}

		const bestSceneId = localStoragePlayerProgress.bestSceneId;
		const bestSceneIndex = sceneList.findIndex((sc) => sc.id === bestSceneId);
		gameMenus.currentFocus = bestSceneId;

		let startY = 30;

		gameMenus.stageButtons['mainMenu'] = new Button({
			coordsAndDimensions: {
				x: 500,
				y: startY,
				width: 200,
				height: 32,
			},
			label: 'Main menu',
			isFocused: false,
			doActivate: () => {
				if (c.debug.menuButtons) console.log('doActivate mainMenu');
				gameMenus.buttonFunctions.mainMenu(false, true);
			},
		});

		gameMenus.handlers.menuStage.addChild(gameMenus.stageButtons['mainMenu']);

		startY += 64;

		sceneList.forEach((sceneListItem, idx) => {
			if (sceneListItem.id === 'mainMenu') return;

			let sceneDisplayName = '';
			if (sceneListItem.sceneObject.titlePlate !== undefined) {
				sceneDisplayName = sceneListItem.sceneObject.titlePlate.mainText;
			} else {
				if (sceneListItem.id === 'intro') sceneDisplayName = 'Intro';
			}

			gameMenus.stageButtons[sceneListItem.id] = new Button({
				coordsAndDimensions: {
					x: 350,
					y: startY,
					width: 500,
					height: 32,
				},
				label: sceneDisplayName,
				isFocused: sceneListItem.id === gameMenus.currentFocus ? true : false,
				isDisabled: idx <= bestSceneIndex ? false : true,
				doActivate: () => {
					if (c.debug.menuButtons)
						console.log('doActivate scene: ', sceneListItem.id);
					gameMenus.buttonFunctions.replaySceneActual(sceneListItem.id, idx);
				},
			});

			startY += 42;

			gameMenus.handlers.menuStage.addChild(
				gameMenus.stageButtons[sceneListItem.id]
			);
		});

		gameMenus.fadeInButtons();
	},

	fadeInButtons() {
		gameMenus.handlers.menuStage.alpha = 0;
		const increments = 5;
		let fadeTiming = timing.modes.play;
		if (timing.isPaused()) fadeTiming = timing.modes.pause;
		gameMenus.scheduledEvents.fadeInButtons = timing.setTrigger(
			'gameMenus.js@fadeInButtons()',
			() => {
				const currentAlpha = Math.trunc(
					gameMenus.handlers.menuStage.alpha * 100
				);
				if (currentAlpha < 100) {
					gameMenus.handlers.menuStage.alpha =
						(currentAlpha + increments) / 100;
				}
			},
			fadeTiming,
			0,
			true,
			22,
			40
		);
	},

	clearButtons() {
		for (const scheduledEventId in gameMenus.scheduledEvents) {
			if (gameMenus.scheduledEvents[scheduledEventId] !== null)
				gameMenus.scheduledEvents[scheduledEventId].clear();
		}

		gameMenus.handlers.menuStage.alpha = 0;
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

		if (noOfButtons > 1)
			soundEffects.playOnce(null, soundEffects.library.menu_cycle.id);

		// console.log({ dir, noOfButtons, currentFocusIdx, newIdx }, keys[newIdx]);
	},

	activateFocusedButton() {
		const currentFocus = gameMenus.currentFocus;
		gameMenus.stageButtons[currentFocus].doActivate();
		// console.log('activateFocusedButton: ', currentFocus);
	},
};

export default gameMenus;
