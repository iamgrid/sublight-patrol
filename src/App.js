import * as PIXI from './pixi';
import keyboardLayouts from './keyboardLayouts';
import audio from './audio/audio';
import soundEffects from './audio/soundEffects';
import c from './utils/constants';
import overlays from './overlays';
import timing from './utils/timing';
import { decreaseNumberBy } from './utils/formulas';
import {
	repositionMovedEntities,
	fromSpriteSheet,
	shields,
	alertsAndWarnings,
	status,
	hello,
	getPosition,
} from './utils/helpers';
import hud from './hud';
import initialGameState from './initialGameState';
import mainReducer from './reducers/mainReducer';
import useReducer from './utils/useReducer';
import Keyboard from 'pixi.js-keyboard';
import StarscapeLayer from './components/StarscapeLayer';
import PlayVolumeBoundaries from './components/PlayVolumeBoundaries';
import entities from './entities/entities';
import behavior from './behavior/behavior';
import shots from './shots';
import story from './story/story';
import emp from './emp';
import HUD from './components/HUD';
// import plates from './plates';

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
		this.showingCoordAlert = false;
		this.camera = {
			currentShift: 100,
			isFlipping: false,
			newFacing: 1,
			flipTimer: 0,
			maxFlipTimer: 50,
		};

		this.playVolume = {
			current: {},
			softBoundaries: {},

			recalculateSoftBoundaries() {
				for (const side in this.current) {
					if (side === 'softBoundary') continue;
					this.softBoundaries[side] = decreaseNumberBy(
						this.current[side],
						this.current.softBoundary
					);
				}
			},
		};

		this.triggered0 = false;

		const [state, dispatch] = useReducer(mainReducer, initialGameState);
		this.gameState = state;
		this.dispatch = dispatch;

		timing.startTime = new Date().getTime();

		console.log(entities.types);
		// console.log(story);

		this.shownStateOnPause = false;
	}

	init() {
		entities.init();
		c.init();
		status.init();
		shields.init();

		this.loader.add('spriteSheet', './assets/sprite_sheet_v10.png');

		for (let soundName in soundEffects.manifest) {
			this.loader.add(
				soundName,
				'./assets/sound_effects/' + soundEffects.manifest[soundName]
			);
		}

		this.loader.load(this.init_pt2.bind(this));
	}

	init_pt2() {
		// plates.fullMatte();

		this.spriteSheet = PIXI.Texture.from('spriteSheet');
		fromSpriteSheet.defaultSpriteSheet = this.spriteSheet;

		this.starScapeStage = new PIXI.Container();
		this.mainStage = new PIXI.Container();
		this.playVolumeBoundaries = new PlayVolumeBoundaries();
		this.hudStage = new PIXI.Container();
		this.pixiHUD = new HUD();
		this.pixiHUD.alpha = 0;
		this.hudStage.addChild(this.pixiHUD);

		this.mainStage.sortableChildren = true;
		this.mainStage.addChild(this.playVolumeBoundaries);
		this.stage.addChild(this.starScapeStage);
		this.stage.addChild(this.mainStage);
		this.stage.addChild(this.hudStage);

		story.handlers = {
			dispatch: this.dispatch,
			state: this.gameState,
			stage: this.mainStage,
			playVolume: this.playVolume,
			playVolumeBoundaries: this.playVolumeBoundaries,
		};

		audio.handlers = {
			PIXI_sound: PIXI.sound,
		};
		audio.init();

		soundEffects.handlers = {
			state: this.gameState,
			resources: this.loader.resources,
			PIXI_sound: PIXI.sound,
		};
		soundEffects.init();

		this.entityWasDespawned = story.entityWasDespawned;

		entities.handlers = {
			dispatch: this.dispatch,
			state: this.gameState,
			stage: this.mainStage,
			pixiHUD: this.pixiHUD,
			entityWasDespawned: this.entityWasDespawned,
		};

		this.checkAgainstCurrentObjectives = story.checkAgainstCurrentObjectives;

		behavior.handlers = {
			dispatch: this.dispatch,
			state: this.gameState,
			checkAgainstCurrentObjectives: this.checkAgainstCurrentObjectives,
			playVolume: this.playVolume,
		};

		shots.handlers = {
			dispatch: this.dispatch,
			state: this.gameState,
			stage: this.mainStage,
			checkAgainstCurrentObjectives: this.checkAgainstCurrentObjectives,
		};

		emp.handlers = {
			dispatch: this.dispatch,
			state: this.gameState,
			checkAgainstCurrentObjectives: this.checkAgainstCurrentObjectives,
		};

		shields.handlers = {
			dispatch: this.dispatch,
			state: this.gameState,
		};

		hud.handlers = {
			pixiHUD: this.pixiHUD,
			stage: this.mainStage,
			camera: this.camera,
			playVolume: this.playVolume,
		};

		this.starScapeLayers = c.starScapeLayers.map(
			(el) => new StarscapeLayer(el)
		);

		this.starScapeLayers.forEach((el) => this.starScapeStage.addChild(el));

		story.advance();

		// behavior.init();

		console.log(this.gameState());

		timing.currentMode = timing.modes.play;
		this.pixiState = this.play;

		// Create an update loop
		this.ticker.add(this.gameLoop.bind(this));
	}

	gameLoop(delta) {
		this.pixiState(delta);
		Keyboard.update();
	}

	play(delta) {
		// behavior tick
		behavior.tick();

		// stage entity updates (thruster plume visibility, damage tints, etc.)
		for (const sEK in entities.stageEntities) {
			if (entities.stageEntities[sEK].hasUpdateMethod)
				entities.stageEntities[sEK].onUpdate(delta);
		}

		// stage shot updates
		for (const shotK in shots.stageShots) {
			if (!shots.stageShots[shotK].hasBeenDestroyed)
				shots.stageShots[shotK].onUpdate(delta);
		}

		// apply shot and EMP damage
		shots.detectCollisions();
		emp.handleEMPDamage();

		// current state
		let currentState = this.gameState();

		const playerId = currentState.entities.player.id;

		// loop volumes
		soundEffects.adjustLoopVolumes(playerId, currentState.positions);

		// keyboard input
		keyboardLayouts.play.execute(
			playerId,
			currentState,
			this.dispatch,
			this.camera
		);

		// update entity positions based on their velocities
		let repositionHasRun = false;
		const reposition = (movedEntities = []) => {
			currentState = this.gameState();

			if (movedEntities.length > 0) {
				repositionMovedEntities(
					movedEntities,
					entities.stageEntities,
					currentState.positions.canMove,
					playerId,
					this.playVolume
				);
			}

			const [playerX, playerY] = getPosition(playerId, currentState.positions);

			// out of bounds warning/alert
			if (
				playerX < this.playVolume.softBoundaries.minX ||
				playerX > this.playVolume.softBoundaries.maxX ||
				playerY < this.playVolume.softBoundaries.minY ||
				playerY > this.playVolume.softBoundaries.maxY
			) {
				if (!this.showingCoordWarning && !this.showingCoordAlert) {
					alertsAndWarnings.add(c.alertsAndWarnings.warnings.leavingVolume);
					this.showingCoordWarning = true;
				}
			} else {
				if (this.showingCoordWarning) {
					alertsAndWarnings.remove(c.alertsAndWarnings.warnings.leavingVolume);
					this.showingCoordWarning = false;
				}
			}

			if (
				playerX < this.playVolume.current.minX ||
				playerX > this.playVolume.current.maxX ||
				playerY < this.playVolume.current.minY ||
				playerY > this.playVolume.current.maxY
			) {
				if (!this.showingCoordAlert) {
					if (this.showingCoordWarning) {
						alertsAndWarnings.remove(
							c.alertsAndWarnings.warnings.leavingVolume
						);
						this.showingCoordWarning = false;
					}
					alertsAndWarnings.add(c.alertsAndWarnings.alerts.leftVolume);
					this.showingCoordAlert = true;
				}
			} else {
				if (this.showingCoordAlert) {
					alertsAndWarnings.remove(c.alertsAndWarnings.alerts.leftVolume);
					this.showingCoordAlert = false;
				}
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

		// hud updates
		hud.update(
			currentState.game.targeting,
			currentState.game.playerShips,
			currentState.entities,
			currentState.positions,
			playerId
		);

		// scanning
		if (
			!currentState.game.targetHasBeenScanned &&
			currentState.game.targeting
		) {
			this.dispatch({
				type: c.actions.SCAN,
				callbackFn: story.checkAgainstCurrentObjectives,
			});
		}

		// timing tick
		timing.tick(timing.modes.play, this.ticker.deltaMS);
	}

	pause() {
		if (!this.shownStateOnPause) {
			const currentState = this.gameState();
			const playerId = currentState.entities.player.id;
			shots.stopShooting(playerId);

			console.info(
				'%c Game paused, logging state:',
				'padding-top: 10px; color: yellow'
			);
			console.info(currentState);
			console.info('currentFormations:', behavior.currentFormations);
			console.info('stageEntities:', entities.stageEntities);
			console.info('stageShots:', shots.stageShots);
			console.info('timing:', timing);
			this.shownStateOnPause = true;
		}

		// keyboard input
		keyboardLayouts.pause.execute();

		// timing tick
		timing.tick(timing.modes.pause, this.ticker.deltaMS);
	}

	togglePause() {
		const pauseDiv = document.getElementById('game__pause');
		if (!timing.isPaused()) {
			status.toggleStatusExpansion.bind(status, '', 'show')();
			pauseDiv.classList.add('game__pause--show');
			timing.currentMode = timing.modes.pause;
			soundEffects.muteUnmuteAllLoops(true);
			this.pixiState = this.pause;
		} else {
			status.toggleStatusExpansion.bind(status, '', 'hide')();
			pauseDiv.classList.remove('game__pause--show');
			timing.currentMode = timing.modes.play;
			soundEffects.muteUnmuteAllLoops(false);
			this.pixiState = this.play;
			this.shownStateOnPause = false;
		}
	}
}
