import * as PIXI from './pixi';
import c from './utils/constants';
import overlays from './overlays';
import {
	timing,
	repositionMovedEntities,
	updateStageEntityVelocities,
	fromSpriteSheet,
	shields,
	dialog,
	alertsAndWarnings,
	status,
	moveTargetingReticule,
	spawnBuoys,
	hello,
} from './utils/helpers';
import hud from './hud';
import initialGameState from './initialGameState';
import mainReducer from './reducers/mainReducer';
import useReducer from './utils/useReducer';
import Keyboard from 'pixi.js-keyboard';
import StarScapeLayer from './components/StarscapeLayer';
import entities from './entities/entities';
import shots from './shots';
import story from './story/story';
import HUD from './components/HUD';

export default class App extends PIXI.Application {
	constructor() {
		super({
			width: c.gameCanvas.width,
			height: c.gameCanvas.height,
			antialias: true,
		});

		// https://pixijs.download/dev/docs/PIXI.settings.html
		// PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

		hello();

		// this.stage.sortableChildren = true;

		this.view.id = 'pixicanvas';

		document.getElementById('game').innerHTML = overlays();
		document.getElementById('game').appendChild(this.view); // Create Canvas tag in the body
		document.getElementById('pixicanvas').tabIndex = 0;
		document.getElementById('pixicanvas').focus();

		this.init();

		this.inSlipStream = false;
		this.showingCoordWarning = false;
		this.camera = {
			currentShift: 100,
			isFlipping: false,
			newFacing: 1,
			flipTimer: 0,
			maxFlipTimer: 50,
		};

		this.triggered0 = false;
		this.triggered1 = false;
		this.triggered2 = false;
		this.triggered3 = false;
		this.triggered4 = false;

		const [state, dispatch] = useReducer(mainReducer, initialGameState);
		this.gameState = state;
		this.dispatch = dispatch;

		// timing.currentMode = timing.timingModes.play;
		// this.pixiState = this.play;

		timing.startTime = new Date().getTime();

		console.log(entities.types);
		console.log(story);

		this.shownStateOnPause = false;
	}

	init() {
		entities.init();
		c.init();
		status.init();
		shields.init();

		this.loader.add('spriteSheet', './assets/sprite_sheet_v4.png');

		this.loader.load(this.draw.bind(this));
	}

	draw() {
		this.spriteSheet = PIXI.Texture.from('spriteSheet');
		fromSpriteSheet.defaultSpriteSheet = this.spriteSheet;

		this.starScapeStage = new PIXI.Container();
		this.mainStage = new PIXI.Container();
		this.hudStage = new PIXI.Container();
		this.pixiHUD = new HUD();
		this.pixiHUD.alpha = 0;
		this.hudStage.addChild(this.pixiHUD);

		this.mainStage.sortableChildren = true;
		this.stage.addChild(this.starScapeStage);
		this.stage.addChild(this.mainStage);
		this.stage.addChild(this.hudStage);

		entities.handlers = {
			dispatch: this.dispatch,
			state: this.gameState,
			stage: this.mainStage,
			pixiHUD: this.pixiHUD,
			stagePointers: hud.stagePointers,
		};

		shots.handlers = {
			dispatch: this.dispatch,
			state: this.gameState,
			timing: timing,
			stage: this.mainStage,
			stageEntities: entities.stageEntities,
		};

		shields.handlers = {
			dispatch: this.dispatch,
			state: this.gameState,
			timing: timing,
			stageEntities: entities.stageEntities,
		};

		hud.handlers = {
			pixiHUD: this.pixiHUD,
			cannonStates: shots.cannonStates,
			camera: this.camera,
		};

		this.starScapeLayers = c.starScapeLayers.map(
			(el) => new StarScapeLayer(el)
		);

		this.starScapeLayers.forEach((el) => this.starScapeStage.addChild(el));

		spawnBuoys(entities);

		entities.spawn(
			'fenrir',
			{
				posX: 100,
				posY: 225,
				latVelocity: 0,
				longVelocity: 0,
			},
			{
				playerRelation: 'self',
				id: 'beta_2',
			},
			'player'
		);

		entities.spawn(
			'valkyrie',
			{
				posX: 800,
				posY: 175,
				latVelocity: 0,
				longVelocity: 0,
				facing: -1,
			},
			{
				playerRelation: 'friendly',
				id: 'alpha_1',
			}
		);

		entities.spawn(
			'valkyrie',
			{
				posX: 700,
				posY: 225,
				latVelocity: 0,
				longVelocity: 0,
			},
			{
				playerRelation: 'friendly',
				id: 'alpha_2',
				shieldStrength: 75,
				systemStrength: 0,
				isDisabled: true,
			}
		);

		entities.spawn(
			'valkyrie',
			{
				posX: 800,
				posY: 275,
				latVelocity: 0,
				longVelocity: 8,
				facing: 1,
			},
			{
				playerRelation: 'friendly',
				id: 'alpha_3',
			}
		);

		entities.spawn(
			'fenrir',
			{
				posX: 600,
				posY: 240,
				latVelocity: 0,
				longVelocity: 0,
			},
			{
				playerRelation: 'neutral',
				id: 'beta_1',
				hasBeenScanned: true,
			}
		);

		entities.spawn(
			'container',
			{
				posX: 900,
				posY: 350,
			},
			{
				id: 'b2508-012',
				contents: 'Food rations',
			}
		);

		entities.spawn(
			'container',
			{
				posX: 1800,
				posY: 350,
			},
			{
				id: 'b2508-013',
				contents: 'Medicine',
			}
		);

		entities.spawn(
			'container',
			{
				posX: 900,
				posY: -200,
			},
			{
				id: 'b2508-014',
				contents: 'Smithing tools',
			}
		);

		entities.spawn(
			'container',
			{
				posX: 900,
				posY: 1200,
			},
			{
				id: 'b2508-015',
				contents: 'Farming equipment',
			}
		);

		entities.spawn(
			'container',
			{
				posX: -600,
				posY: 350,
			},
			{
				id: 'b2508-016',
				contents: 'Fertilizer',
			}
		);

		console.log(this.gameState());

		timing.currentMode = timing.timingModes.play;
		this.pixiState = this.play;

		// Create an update loop
		this.ticker.add(this.gameLoop.bind(this));

		// setTimout tests
		const testTimer = timing.setTimeout(
			() => {
				console.log('hello timer');
			},
			timing.timingModes.play,
			2000
		);

		console.log(testTimer);
		const testTimer2 = timing.setTimeout(
			() => {
				timing.clearTimeout(testTimer);
			},
			timing.timingModes.play,
			1000
		);
		console.log(testTimer2);
		const testTimer3 = timing.setTimeout(
			() => {
				console.log('hello from timer 3', entities.stageEntities['b2508-016']);
			},
			timing.timingModes.play,
			4000
		);
		console.log(testTimer3);
	}

	gameLoop(delta) {
		this.pixiState(delta);
		Keyboard.update();
	}

	play(delta) {
		// stage entity updates
		for (const sEK in entities.stageEntities) {
			if (entities.stageEntities[sEK].hasUpdateMethod)
				entities.stageEntities[sEK].onUpdate(delta);
		}

		// shot updates
		for (const shotK in shots.stageShots) {
			if (!shots.stageShots[shotK].hasBeenDestroyed)
				shots.stageShots[shotK].onUpdate(delta);
		}

		// collision detection
		shots.detectCollisions();

		// current state
		let currentState = this.gameState();

		const playerId = currentState.entities.player.id;

		// hud updates
		hud.update(
			currentState.game.targeting,
			currentState.game.lives,
			currentState.entities,
			currentState.positions
		);

		// Keyboard
		// https://www.npmjs.com/package/pixi.js-keyboard
		let latDirection = 0;
		let longDirection = 0;
		if (Keyboard.isKeyDown('ArrowUp')) {
			latDirection = -1;
		} else if (Keyboard.isKeyDown('ArrowDown')) {
			latDirection = 1;
		}

		if (Keyboard.isKeyDown('ArrowLeft')) {
			longDirection = -1;
		} else if (Keyboard.isKeyDown('ArrowRight')) {
			longDirection = 1;
		}

		function playerStageEntityVelocity(newLatVelocity, newLongVelocity) {
			updateStageEntityVelocities(
				playerId,
				entities.stageEntities,
				newLatVelocity,
				newLongVelocity
			);
		}

		this.dispatch({
			type: c.actions.CHANGE_ENTITY_VELOCITIES,
			id: playerId,
			latDirection: latDirection,
			longDirection: longDirection,
			callbackFn: playerStageEntityVelocity,
		});

		if (Keyboard.isKeyPressed('Space')) {
			shots.startShooting(playerId);
		}

		if (Keyboard.isKeyReleased('Space')) {
			shots.stopShooting(playerId);
		}

		function targetingCallback(newTargetId) {
			if (newTargetId === null) return;
			moveTargetingReticule(newTargetId, entities.stageEntities);
		}

		if (Keyboard.isKeyPressed('KeyE')) {
			this.dispatch({
				type: c.actions.TARGET,
				do: 'pointed-nearest',
				stageEntities: entities.stageEntities,
				callbackFn: targetingCallback,
			});
		}

		if (Keyboard.isKeyPressed('KeyS')) {
			this.dispatch({
				type: c.actions.TARGET,
				do: 'next',
				stageEntities: entities.stageEntities,
				callbackFn: targetingCallback,
			});
		}

		if (Keyboard.isKeyPressed('KeyA')) {
			this.dispatch({
				type: c.actions.TARGET,
				do: 'previous',
				stageEntities: entities.stageEntities,
				callbackFn: targetingCallback,
			});
		}

		if (Keyboard.isKeyPressed('KeyF')) {
			if (!this.camera.isFlipping) {
				if (currentState.entities.player.facing === 1) {
					entities.stageEntities[playerId].targetRotation = Math.PI;
					entities.stageEntities[playerId].facing = -1;
					this.camera.newFacing = -1;
				} else {
					entities.stageEntities[playerId].targetRotation = 0;
					entities.stageEntities[playerId].facing = 1;
					this.camera.newFacing = 1;
				}

				this.dispatch({
					type: c.actions.FLIP,
					id: playerId,
					store: 'player',
				});

				this.camera.isFlipping = true;
				this.camera.flipTimer = this.camera.maxFlipTimer;
			}
		}

		if (Keyboard.isKeyPressed('Escape')) {
			this.togglePause();
		}

		// update entity positions based on their velocities
		let repositionHasRun = false;
		const reposition = (movedEntities = []) => {
			currentState = this.gameState();

			if (movedEntities.length > 0) {
				repositionMovedEntities(
					movedEntities,
					entities.stageEntities,
					currentState.positions.canMove
				);
			}

			const playerX = currentState.positions.canMove[`${playerId}--posX`];
			const playerY = currentState.positions.canMove[`${playerId}--posY`];

			// out of bounds warning
			let showCoordWarning = false;

			if (
				playerX < c.playVolume.minX ||
				playerX > c.playVolume.maxX ||
				playerY < c.playVolume.minY ||
				playerY > c.playVolume.maxY
			) {
				showCoordWarning = true;
			}

			if (showCoordWarning && !this.showingCoordWarning) {
				this.showingCoordWarning = true;
				alertsAndWarnings.add(c.alertsAndWarnings.warnings.leavingVolume);
			}

			if (!showCoordWarning && this.showingCoordWarning) {
				this.showingCoordWarning = false;
				alertsAndWarnings.remove(c.alertsAndWarnings.warnings.leavingVolume);
			}

			// camera position
			let cameraTLX;
			if (!this.camera.isFlipping) {
				// static camera
				cameraTLX = 0 - playerX + 100;
				if (currentState.entities.player.facing === -1) {
					cameraTLX = 0 - playerX + (c.gameCanvas.width - 100);
				}
			} else {
				// animated camera
				const cFMultiplier = this.camera.flipTimer / this.camera.maxFlipTimer;
				const cFDistance = c.gameCanvas.width - 200;
				const cFShift = (1 - cFMultiplier) * cFDistance;

				if (this.camera.newFacing === -1) {
					this.camera.currentShift = 100 + cFShift;
					cameraTLX = 0 - playerX + this.camera.currentShift;
				} else {
					this.camera.currentShift = c.gameCanvas.width - 100 - cFShift;
					cameraTLX = 0 - playerX + this.camera.currentShift;
				}

				this.camera.flipTimer = this.camera.flipTimer - 1;
				if (this.camera.flipTimer < 0) {
					this.camera.isFlipping = false;
					this.camera.flipTimer = 0;
				}
			}

			const cameraTLY = 0 - playerY + 225;
			this.mainStage.position.set(cameraTLX, cameraTLY);

			// starscape movement
			this.starScapeLayers.forEach((el) =>
				el.onUpdate(delta, this.inSlipStream, cameraTLX, cameraTLY)
			);

			repositionHasRun = true;
		};

		this.dispatch({
			type: c.actions.UPDATE_ENTITY_COORDS,
			callbackFn: reposition,
		});

		if (!repositionHasRun && (!this.triggered0 || this.camera.isFlipping)) {
			reposition();
			this.triggered0 = true;
		}

		// scanning
		if (
			!currentState.game.targetHasBeenScanned &&
			currentState.game.targeting
		) {
			this.dispatch({ type: c.actions.SCAN });
		}

		// timing tick
		timing.tick('play', this.ticker.deltaMS);

		if (!this.triggered1 && timing.times.play > 2000) {
			/*dialog(
				'Commander Shepherd',
				"Since our time together is coming to a close, I'd like to tell you on behalf of the team that we really loved having you with us, getting clear-eyed feedback on the Valkyrie's control scheme and calibration from a fresh graduate's perspective turned out to be a huge help."
			);*/
			// alertsAndWarnings.add(c.alertsAndWarnings.warnings.collision);
			// alertsAndWarnings.add(c.alertsAndWarnings.warnings.otherWarning);
			status.add('aqua', 'Aqua test. #1', timing.times.play);
			status.add('yellow', 'Yellow test. #2', timing.times.play);
			hud.toggle(true);
			this.dispatch({
				type: c.actions.FLIP,
				id: 'alpha_1',
				store: 'targetable',
			});
			entities.stageEntities['alpha_1'].targetRotation = 0;
			// shots.startShooting('alpha_1');
			// this.removeShot('bla');
			// entities.stageEntities.beta_1.blowUp();
			// shots.showDamage(
			// 	'beta_1',
			// 	'targetable',
			// 	'destruction',
			// 	entities.stageEntities
			// );
			// console.log(currentState);
			this.triggered1 = true;
		}

		if (!this.triggered2 && timing.times.play > 8000) {
			// dialog('Love Eternal', 'Prepare to be assimilated.');
			// alertsAndWarnings.remove(c.alertsAndWarnings.warnings.collision);
			// alertsAndWarnings.add(c.alertsAndWarnings.alerts.systemsOffline);
			status.add('green', 'Green test. #3', timing.times.play);
			this.dispatch({
				type: c.actions.FLIP,
				id: 'alpha_1',
				store: 'targetable',
			});
			entities.stageEntities['alpha_1'].targetRotation = Math.PI;
			this.dispatch({
				type: c.actions.CHANGE_PLAYER_RELATION,
				entityId: 'beta_1',
				newRelation: 'hostile',
				callbackFn: (newRelation) => {
					entities.stageEntities['beta_1'].reticuleRelation(newRelation);
					status.add(
						'red',
						'[Beta 1] relation switched to hostile.',
						timing.times.play
					);
				},
			});
			// hud.toggle(false);
			// shots.stopShooting('alpha_1');
			// console.log(currentState);
			this.triggered2 = true;
		}

		if (!this.triggered3 && timing.times.play > 16000) {
			// dialog('Death Herself', 'Resistance is futile.');
			// alertsAndWarnings.remove(c.alertsAndWarnings.alerts.systemsOffline);
			// console.log(currentState);
			this.triggered3 = true;
		}

		if (!this.triggered4 && timing.times.play > 20000) {
			// dialog('', '', true);
			// alertsAndWarnings.remove(c.alertsAndWarnings.warnings.otherWarning);
			status.add('red', 'Red test. #4', timing.times.play);
			status.add('aqua', 'Aqua test. #5', timing.times.play);
			status.add('yellow', 'Yellow test. #6', timing.times.play);
			// console.log(currentState);
			// hud.toggle(false);
			this.triggered4 = true;
		}
	}

	pause() {
		// timing tick
		timing.tick('pause', this.ticker.deltaMS);

		if (!this.shownStateOnPause) {
			console.info(
				'%c Game paused, logging state:',
				'padding-top: 10px; color: yellow'
			);
			console.info(this.gameState());
			console.info('stageEntities:', entities.stageEntities);
			console.info('stageShots:', shots.stageShots);
			console.info('timing:', timing.times, timing.tickers);
			this.shownStateOnPause = true;
		}
		if (Keyboard.isKeyPressed('Escape')) {
			this.togglePause();
		}

		const statusProperDiv = document.getElementById('game__status-proper');

		if (status.store.length > 4) {
			if (Keyboard.isKeyDown('ArrowUp')) {
				statusProperDiv.scrollBy(0, -4);
			}
			if (Keyboard.isKeyDown('ArrowDown')) {
				statusProperDiv.scrollBy(0, 4);
			}
		}
	}

	togglePause() {
		const pauseDiv = document.getElementById('game__pause');
		if (!timing.isPaused) {
			status.toggleStatusExpansion.bind(status, '', 'show')();
			pauseDiv.classList.add('game__pause--show');
			timing.isPaused = true;
			timing.currentMode = timing.timingModes.pause;
			this.pixiState = this.pause;
		} else {
			status.toggleStatusExpansion.bind(status, '', 'hide')();
			pauseDiv.classList.remove('game__pause--show');
			timing.isPaused = false;
			timing.currentMode = timing.timingModes.play;
			this.pixiState = this.play;
			this.shownStateOnPause = false;
		}
	}
}
