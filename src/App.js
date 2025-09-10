import * as PIXI from './pixi';
import controlSchemes from './controlSchemes';
import audio from './audio/audio';
import soundEffects from './audio/soundEffects';
import music from './audio/music';
import c from './utils/constants';
import overlays from './overlays';
import timing from './utils/timing';
// import { decreaseNumberBy } from './utils/formulas';
import {
	recalculateSoftBoundaries,
	fromSpriteSheet,
	repositionMovedEntities,
	shields,
	alertsAndWarnings,
	gameLog,
	hello,
	getPosition,
	getCameraTLBasedOnPlayerPosition,
} from './utils/helpers';
import hud from './hud';
import initialGameState from './initialGameState';
import mainReducer from './reducers/mainReducer';
import useReducer from './utils/useReducer';
import keyboard from './Keyboard';
import StarscapeLayer from './components/StarscapeLayer';
import PlayVolumeBoundaries from './components/PlayVolumeBoundaries';
import entities from './entities/entities';
import behavior from './behavior/behavior';
import formations from './behavior/formations';
import shots from './shots';
import story from './story/story';
import emp from './emp';
import HUD from './components/HUD';
import Matte from './components/Matte';
import gameMenus from './gameMenus';
import plates from './plates';
import audioLibrary from './audio/audioLibrary';
import finishers from './finishers';

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
		};

		this.playVolume.recalculateSoftBoundaries = recalculateSoftBoundaries.bind(
			this.playVolume
		);

		this.transitionsInProgress = {
			states: {
				scene: false,
				missionFailed: false,
				playerShipDestroyedRespawning: false,
				playerShipDestroyedGameOver: false,
			},
			functions: {
				registerTransition: (type) => {
					const functionSignature =
						'App.js@transitionsInProgress.registerTransition()';

					console.log(functionSignature, 'type:', type);

					if (this.transitionsInProgress.states[type] === undefined) {
						console.error(
							functionSignature,
							'Cannot register transition, type not recognized:',
							type
						);
						return;
					}

					if (this.transitionsInProgress.states[type] === true) {
						console.warn(
							functionSignature,
							`Transition of type "${type}" is already in progress, returning early...`
						);
						return;
					}

					this.transitionsInProgress.states[type] = true;

					console.log(
						functionSignature,
						'states:',
						this.transitionsInProgress.states
					);
				},
				transitionComplete: (type) => {
					const functionSignature =
						'App.js@transitionsInProgress.transitionComplete()';

					console.log(functionSignature, 'type:', type);

					if (this.transitionsInProgress.states[type] === undefined) {
						console.error(
							functionSignature,
							'Cannot complete transition, type not recognized:',
							type
						);
						return;
					}
					this.transitionsInProgress.states[type] = false;

					console.log(
						functionSignature,
						'states:',
						this.transitionsInProgress.states
					);
				},
				getIsATransitionAlreadyInProgress: () => {
					const functionSignature =
						'App.js@transitionsInProgress.getIsATransitionAlreadyInProgress()';

					console.log(
						functionSignature,
						'states:',
						this.transitionsInProgress.states
					);

					const returnValue = Object.values(
						this.transitionsInProgress.states
					).includes(true);
					console.log(functionSignature, { returnValue });
					return returnValue;
				},
			},
		};

		const [state, dispatch] = useReducer(
			mainReducer,
			JSON.parse(JSON.stringify(initialGameState))
		);
		this.gameState = state;
		this.dispatch = dispatch;

		timing.startTime = new Date().getTime();

		console.log(entities.types);
		// console.log(story);

		this.shownStateOnPause = false;

		this.frameZero = {
			actual: true,
		};

		this.showingMissionMenu = {
			actual: false,
		};

		this.matteIsBeingUsedByPlates = {
			actual: false,
		};

		this.hudShouldBeShowing = {
			actual: false,
		};

		this.pairedTrack = {
			actual: audioLibrary.library.music.sublight_patrol_theme.id,
		};

		this.activeKeyboardLayout = {
			current: null,
			currentStoryBeatLayout: null,
		};

		this.currentPlayerId = null;

		this.init();
	}

	init() {
		keyboard.addEventListeners();
		controlSchemes.init();

		entities.init();
		c.init();
		gameLog.init();
		shields.init();

		this.loader.add('spriteSheet', './assets/sprite_sheet_v13.png');

		for (let trackName in music.manifest) {
			this.loader.add(trackName, './assets/music/' + music.manifest[trackName]);
		}

		for (let soundName in soundEffects.manifest) {
			this.loader.add(
				soundName,
				'./assets/sound_effects/' + soundEffects.manifest[soundName]
			);
		}

		this.loader.load(this.loading_complete.bind(this));
	}

	loading_complete() {
		document
			.getElementById('game__loading')
			.classList.add('game__loading--hidden');
		document
			.getElementById('game__loading_done')
			.classList.add('game__loading_done--shown');
		setTimeout(() => {
			document
				.getElementById('game__loading_done__callout--audio')
				.classList.add('game__loading_done__callout--shown');
			document
				.getElementById('game__loading_done__callout--keyboard')
				.classList.add('game__loading_done__callout--shown');
		}, 500);
		document.getElementById('footer__controls').innerHTML =
			'<div class="footer__controls__control"><span class="footer__controls__key">enter</span><span class="footer__controls__function">Launch the game</span></div>';
		this.gameLaunched = false;

		const launchFn = (event) => {
			if (
				(event.code === 'Enter' || event.code === 'NumpadEnter') &&
				!this.gameLaunched
			) {
				this.gameLaunched = true;
				soundEffects.playOnce(
					null,
					audioLibrary.library.soundEffects.menu_cycle.id,
					1
				);
				this.init_pt2();
			}
		};

		this.launchListener = window.addEventListener('keydown', launchFn, false);
	}

	init_pt2() {
		const functionSignature = 'App.js@init_pt2()';
		window.removeEventListener('keydown', this.launchListener);
		document
			.getElementById('game__loading_done')
			.classList.remove('game__loading_done--shown');
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
		this.menuStage = new PIXI.Container();
		this.Matte = new Matte();
		this.Matte.alpha = 0;
		// this.menuStage.addChild(this.Matte);
		this.menuStage.alpha = 0;

		this.mainStage.sortableChildren = true;
		this.mainStage.addChild(this.playVolumeBoundaries);
		this.stage.addChild(this.starScapeStage);
		this.stage.addChild(this.mainStage);
		this.stage.addChild(this.hudStage);
		this.stage.addChild(this.Matte);
		this.stage.addChild(this.menuStage);

		finishers.handlers.state = this.gameState;
		finishers.init();

		plates.handlers = {
			Matte: this.Matte,
			matteIsBeingUsedByPlates: this.matteIsBeingUsedByPlates,
			hudShouldBeShowing: this.hudShouldBeShowing,
		};

		gameMenus.handlers = {
			menuStage: this.menuStage,
			Matte: this.Matte,
			pixiHUD: this.pixiHUD,
			showingMissionMenu: this.showingMissionMenu,
			matteIsBeingUsedByPlates: this.matteIsBeingUsedByPlates,
			hudShouldBeShowing: this.hudShouldBeShowing,
		};

		story.handlers = {
			dispatch: this.dispatch,
			state: this.gameState,
			stage: this.mainStage,
			playVolume: this.playVolume,
			playVolumeBoundaries: this.playVolumeBoundaries,
			frameZero: this.frameZero,
			transitionsInProgress: this.transitionsInProgress,
			hudShouldBeShowing: this.hudShouldBeShowing,
			activeKeyboardLayout: this.activeKeyboardLayout,
			hud: this.hud,
			pairedTrack: this.pairedTrack,
			resetCameraAndMoveToPlayerXY:
				this.resetCameraAndMoveToPlayerXY.bind(this),
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

		music.handlers = {
			resources: this.loader.resources,
			PIXI_sound: PIXI.sound,
			pairedTrack: this.pairedTrack,
		};
		music.init();

		this.entityWasDespawned = story.entityWasDespawned;

		entities.handlers = {
			dispatch: this.dispatch,
			state: this.gameState,
			stage: this.mainStage,
			pixiHUD: this.pixiHUD,
			transitionsInProgress: this.transitionsInProgress,
			entityWasDespawned: this.entityWasDespawned,
			resetCameraAndMoveToPlayerXY:
				this.resetCameraAndMoveToPlayerXY.bind(this),
		};

		this.checkAgainstCurrentObjectives = story.checkAgainstCurrentObjectives;

		behavior.handlers = {
			dispatch: this.dispatch,
			state: this.gameState,
			checkAgainstCurrentObjectives: this.checkAgainstCurrentObjectives,
			// playVolume: this.playVolume,
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

		story.init();
		story.advance(functionSignature);

		console.log(this.gameState());

		timing.currentMode = timing.modes.play;
		this.pixiState = this.play;

		// Create an update loop
		this.ticker.add(this.gameLoop.bind(this));
	}

	gameLoop(delta) {
		this.pixiState(delta);
		if (controlSchemes.suspendedLayout === null) {
			keyboard.update();
		}
	}

	play(delta) {
		const functionSignature = 'App.js@play()';
		if (timing.isEntityMovementEnabled()) {
			// behavior tick
			behavior.tick();

			// stage entity updates (ship explosions, thruster plume
			// visibility, damage tints, etc.)
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
		}

		// current state
		let currentState = this.gameState();

		const playerId = currentState.entities.player.id;

		if (this.currentPlayerId !== playerId) {
			if (typeof playerId !== 'string' || playerId.length === 0) {
				console.warn(functionSignature, 'playerId is not valid:', playerId);
			}

			console.log(
				functionSignature,
				'playerId changed from',
				this.currentPlayerId,
				'to',
				playerId
			);
			this.currentPlayerId = playerId;
		}

		// console.log('playerId:', playerId);

		// loop volumes
		soundEffects.adjustLoopVolumes(playerId, currentState.positions);

		// keyboard input
		let currentKeyboardLayout = null;
		if (this.activeKeyboardLayout.current !== null)
			currentKeyboardLayout = this.activeKeyboardLayout.current;
		if (this.showingMissionMenu.actual)
			currentKeyboardLayout = controlSchemes.gameMenus.id;

		const skipToMainMenu = () => {
			const functionSignature = 'App.js@skipToMainMenu()';
			timing.clearAllScheduledEvents();
			// music.stopPlaying();
			// music.playTrack(
			// 	audioLibrary.library.music.sublight_patrol_theme.id,
			// 	25.0395
			// );
			story.advance(functionSignature, 'mainMenu');
		};

		// console.log({ currentKeyboardLayout });
		if (controlSchemes.suspendedLayout === null) {
			controlSchemes[currentKeyboardLayout].execute(
				playerId,
				currentState,
				this.dispatch,
				this.camera,
				skipToMainMenu
			);
		}

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
					this.playVolume.current
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
					alertsAndWarnings.add(c.alertsAndWarnings.warnings.closeToVolumeEdge);
					this.showingCoordWarning = true;
				}
			} else {
				if (this.showingCoordWarning) {
					alertsAndWarnings.remove(
						c.alertsAndWarnings.warnings.closeToVolumeEdge
					);
					this.showingCoordWarning = false;
				}
			}

			if (
				playerX <
					this.playVolume.current.minX +
						c.showAlertWhenThisCloseToTheBoundary ||
				playerX >
					this.playVolume.current.maxX -
						c.showAlertWhenThisCloseToTheBoundary ||
				playerY <
					this.playVolume.current.minY +
						c.showAlertWhenThisCloseToTheBoundary ||
				playerY >
					this.playVolume.current.maxY - c.showAlertWhenThisCloseToTheBoundary
			) {
				if (!this.showingCoordAlert) {
					if (this.showingCoordWarning) {
						alertsAndWarnings.remove(
							c.alertsAndWarnings.warnings.closeToVolumeEdge
						);
						this.showingCoordWarning = false;
					}
					alertsAndWarnings.add(c.alertsAndWarnings.alerts.onVolumeEdge);
					this.showingCoordAlert = true;
				}
			} else {
				if (this.showingCoordAlert) {
					alertsAndWarnings.remove(c.alertsAndWarnings.alerts.onVolumeEdge);
					this.showingCoordAlert = false;
				}
			}

			// camera position

			const cameraTL = getCameraTLBasedOnPlayerPosition(
				playerX,
				playerY,
				currentState.entities.player.facing
			);

			let cameraTLX;
			if (!this.camera.isFlipping) {
				// static camera
				cameraTLX = cameraTL[0];
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

			const cameraTLY = cameraTL[1];

			this.refocusCameraOnTL(cameraTLX, cameraTLY, delta, this.inSlipStream);

			repositionHasRun = true;
		};

		if (timing.isEntityMovementEnabled()) {
			this.dispatch({
				type: c.actions.UPDATE_ENTITY_COORDS,
				payload: {
					currentPlayVolume: this.playVolume.current,
				},
				callbackFn: reposition,
			});

			if (
				!repositionHasRun &&
				(this.frameZero.actual || this.camera.isFlipping)
			) {
				reposition();
				this.frameZero.actual = false;
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
		}

		// timing tick
		timing.tick(timing.modes.play, this.ticker.deltaMS);
	}

	refocusCameraOnTL(cameraTLX, cameraTLY, delta, inSlipStream) {
		// const functionSignature = 'App.js@refocusCameraOnTL()';

		// console.log(functionSignature, {
		// 	cameraTLX,
		// 	cameraTLY,
		// 	delta,
		// 	inSlipStream,
		// });

		this.mainStage.position.set(cameraTLX, cameraTLY);

		// starscape movement
		this.starScapeLayers.forEach((el) =>
			el.onUpdate(delta, inSlipStream, cameraTLX, cameraTLY)
		);
	}

	resetCameraAndMoveToPlayerXY(playerX, playerY, calledBy) {
		const functionSignature = 'App.js@resetCameraAndMoveToPlayerXY()';
		console.log(
			functionSignature,
			"Repositioning camera to the player's craft",
			'calledBy:',
			calledBy,
			'playerX:',
			playerX,
			'playerY:',
			playerY
		);

		const cameraTL = getCameraTLBasedOnPlayerPosition(playerX, playerY, 1);

		console.log(functionSignature, { cameraTL });

		this.refocusCameraOnTL(cameraTL[0], cameraTL[1], 0, false);

		this.camera.currentShift = 100;
		this.camera.isFlipping = false;
		this.camera.newFacing = 1;
		this.camera.flipTimer = 0;
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
			console.info('currentFormations:', formations.currentFormations);
			console.info('stageEntities:', entities.stageEntities);
			console.info('stageShots:', shots.stageShots);
			console.info('timing:', timing);
			console.info('transitionsInProgress:', this.transitionsInProgress);
			// console.info('playVolume:', this.playVolume);
			this.shownStateOnPause = true;
		}

		// keyboard input
		controlSchemes.pause.execute();

		// timing tick
		timing.tick(timing.modes.pause, this.ticker.deltaMS);
	}

	togglePause(dontFadeMatte = '') {
		const functionSignature = 'App.js@togglePause()';

		const pauseDiv = document.getElementById('game__pause');
		if (!timing.isPaused()) {
			gameLog.toggleStatusExpansion.bind(gameLog, '', 'show')();
			pauseDiv.classList.add('game__pause--show');
			timing.currentMode = timing.modes.pause;
			soundEffects.muteUnmuteAllLoops(`${functionSignature} - 1`, true);
			this.pixiState = this.pause;
			if (dontFadeMatte === '')
				gameMenus.fadeInMatte(`${functionSignature} - 2`);
			gameMenus.showPauseButtonSet();
		} else {
			gameLog.toggleStatusExpansion.bind(gameLog, '', 'hide')();
			pauseDiv.classList.remove('game__pause--show');
			timing.currentMode = timing.modes.play;
			soundEffects.muteUnmuteAllLoops(`${functionSignature} - 3`, false);
			this.pixiState = this.play;
			this.shownStateOnPause = false;
			gameMenus.clearButtons();
			if (dontFadeMatte === '') {
				gameMenus.fadeOutMatte(`${functionSignature} - 4`);
			} else {
				document.getElementById('game__plates').style.opacity = 1;
			}
		}
	}

	pauseForFinisherForm() {
		const functionSignature = 'App.js@pauseForFinisherForm()';
		if (timing.isPaused()) {
			console.warn(
				functionSignature,
				'Cannot pause for finisher form, game is already paused.'
			);
			return;
		}

		timing.currentMode = timing.modes.pause;
		soundEffects.muteUnmuteAllLoops(`${functionSignature} - 1`, true);
		this.pixiState = this.pause;
		this.shownStateOnPause = true;
	}

	unpauseAfterFinisherForm() {
		const functionSignature = 'App.js@unpauseAfterFinisherForm()';
		if (!timing.isPaused()) {
			console.warn(
				functionSignature,
				'Cannot unpause after finisher form, game is currently unpaused.'
			);
			return;
		}

		timing.currentMode = timing.modes.play;
		this.pixiState = this.play;
	}
}
