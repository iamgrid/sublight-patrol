import timing from './utils/timing';
import Button from './components/Button';

const gameMenus = {
	handlers: { menuStage: null, Matte: null, pixiHUD: null }, // gets its values in App.js
	stageButtons: {},
	currentMatteAlpha: 0,
	maxMatteAlpha: 80,
	matteStep: 4,

	fadeInMatte() {
		gameMenus.handlers.pixiHUD.alpha = 0;
		document.getElementById('game__hud').style.opacity = 0;
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

	showPauseButtonSet() {
		const startX = 280;
		gameMenus.stageButtons['resumeGame'] = new Button({
			coordsAndDimensions: {
				x: startX,
				y: 48,
				width: 200,
				height: 32,
			},
			label: 'Resume game',
			isFocused: true,
			onActivation: () => {
				console.log('onActivation resumeGame');
			},
		});

		gameMenus.stageButtons['restartMission'] = new Button({
			coordsAndDimensions: {
				x: startX + 220,
				y: 48,
				width: 200,
				height: 32,
			},
			label: 'Restart mission',
			isFocused: false,
			onActivation: () => {
				console.log('onActivation restartMission');
			},
		});

		gameMenus.stageButtons['mainMenu'] = new Button({
			coordsAndDimensions: {
				x: startX + 440,
				y: 48,
				width: 200,
				height: 32,
			},
			label: 'Main menu',
			isFocused: false,
			onActivation: () => {
				console.log('onActivation mainMenu');
			},
		});

		gameMenus.handlers.menuStage.addChild(gameMenus.stageButtons['resumeGame']);
		gameMenus.handlers.menuStage.addChild(
			gameMenus.stageButtons['restartMission']
		);
		gameMenus.handlers.menuStage.addChild(gameMenus.stageButtons['mainMenu']);
	},

	clearButtons() {
		for (const stageButtonId in gameMenus.stageButtons) {
			gameMenus.handlers.menuStage.removeChild(
				gameMenus.stageButtons[stageButtonId]
			);
			gameMenus.stageButtons[stageButtonId].destroy();
			delete gameMenus.stageButtons[stageButtonId];
		}
	},
};

export default gameMenus;
