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
	dialog,
	alertsAndWarnings,
	status,
	spawnBuoys,
	hello,
	getPosition,
} from './utils/helpers';
import hud from './hud';
import initialGameState from './initialGameState';
import mainReducer from './reducers/mainReducer';
import useReducer from './utils/useReducer';
import Keyboard from 'pixi.js-keyboard';
import StarScapeLayer from './components/StarscapeLayer';
import entities from './entities/entities';
import shots from './shots';
import emp from './emp';
import behavior from './behavior/behavior';
// import story from './story/story';
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
		this.showingCoordAlert = false;
		this.camera = {
			currentShift: 100,
			isFlipping: false,
			newFacing: 1,
			flipTimer: 0,
			maxFlipTimer: 50,
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
		behavior.init();

		this.loader.add('spriteSheet', './assets/sprite_sheet_v10.png');

		for (let soundName in soundEffects.manifest) {
			this.loader.add(
				soundName,
				'./assets/sound_effects/' + soundEffects.manifest[soundName]
			);
		}

		this.softBoundaries = {};

		for (const side in c.playVolume) {
			if (side === 'softBoundary') continue;
			this.softBoundaries[side] = decreaseNumberBy(
				c.playVolume[side],
				c.playVolume.softBoundary
			);
		}

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

		entities.handlers = {
			dispatch: this.dispatch,
			state: this.gameState,
			stage: this.mainStage,
			pixiHUD: this.pixiHUD,
			stagePointers: hud.stagePointers,
		};

		behavior.handlers = {
			dispatch: this.dispatch,
			state: this.gameState,
			stageEntities: entities.stageEntities,
		};

		shots.handlers = {
			dispatch: this.dispatch,
			state: this.gameState,
			stage: this.mainStage,
			stageEntities: entities.stageEntities,
		};

		emp.handlers = {
			dispatch: this.dispatch,
			state: this.gameState,
			stageEntities: entities.stageEntities,
		};

		shields.handlers = {
			dispatch: this.dispatch,
			state: this.gameState,
		};

		hud.handlers = {
			pixiHUD: this.pixiHUD,
			stage: this.mainStage,
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
				behaviorAssignedGoal: behavior.possibleGoals.playerDetermined,
				id: 'red_1a',
			},
			'player'
		);

		entities.spawn(
			'valkyrie',
			{
				posX: 100,
				posY: 350,
				latVelocity: 0,
				longVelocity: 0,
				facing: -1,
			},
			{
				playerRelation: 'friendly',
				behaviorAssignedGoal: behavior.possibleGoals.holdStation,
				behaviorAssignedStationX: 800,
				behaviorAssignedStationY: 175,
				id: 'alpha_1',
			}
		);

		entities.spawn(
			'shuttle',
			{
				posX: 800,
				posY: 250,
				latVelocity: 0,
				longVelocity: 0,
				facing: -1,
			},
			{
				isDisabled: true,
				playerRelation: 'friendly',
				behaviorAssignedGoal: behavior.possibleGoals.holdStation,
				id: '1730_to_harpax',
			}
		);

		entities.spawn(
			'zangari_shuttle',
			{
				posX: 100,
				posY: 0,
				latVelocity: 0,
				longVelocity: 0,
				facing: -1,
			},
			{
				playerRelation: 'neutral',
				behaviorAssignedGoal: behavior.possibleGoals.holdStation,
				behaviorAssignedStationX: 800,
				behaviorAssignedStationY: 400,
				id: 'c_15_a10',
				contents: 'Zangari leaders',
			}
		);

		entities.spawn(
			'freighter_l1',
			{
				posX: 830,
				posY: 500,
				latVelocity: 0,
				longVelocity: 0,
			},
			{
				playerRelation: 'friendly',
				behaviorAssignedGoal: behavior.possibleGoals.holdStation,
				id: 'b6748_2',
				contents: 'Food',
			}
		);

		entities.spawn(
			'freighter_l2',
			{
				posX: 830,
				posY: 600,
				latVelocity: 0,
				longVelocity: 0,
			},
			{
				playerRelation: 'friendly',
				behaviorAssignedGoal: behavior.possibleGoals.holdStation,
				id: 'b6748_1',
				contents: 'Food',
			}
		);

		entities.spawn(
			'freighter_l3',
			{
				posX: 830,
				posY: 700,
				latVelocity: 0,
				longVelocity: 0,
			},
			{
				playerRelation: 'friendly',
				behaviorAssignedGoal: behavior.possibleGoals.holdStation,
				id: 'b6748_3',
				contents: 'Food',
			}
		);

		entities.spawn(
			'zangari_fighter_type_1',
			{
				posX: 700,
				posY: 225,
				latVelocity: 0,
				longVelocity: 0,
			},
			{
				playerRelation: 'neutral',
				behaviorAssignedGoal: behavior.possibleGoals.holdStation,
				id: 'z_1',
			}
		);

		entities.spawn(
			'zangari_fighter_type_2',
			{
				posX: 650,
				posY: 150,
				latVelocity: 0,
				longVelocity: -6,
				facing: -1,
			},
			{
				playerRelation: 'neutral',
				behaviorAssignedGoal: behavior.possibleGoals.maintainVelocity,
				id: 'z_2',
			}
		);

		entities.spawn(
			'zangari_fighter_type_3',
			{
				posX: 440,
				posY: 225,
				latVelocity: 0,
				longVelocity: 0,
			},
			{
				playerRelation: 'neutral',
				behaviorAssignedGoal: behavior.possibleGoals.holdStation,
				id: 'z_3',
			}
		);

		entities.spawn(
			'zangari_fighter_type_4',
			{
				posX: 440,
				posY: 300,
				latVelocity: 0,
				longVelocity: 0,
			},
			{
				playerRelation: 'neutral',
				behaviorAssignedGoal: behavior.possibleGoals.holdStation,
				id: 'z_4',
			}
		);

		// entities.spawn(
		// 	'valkyrie',
		// 	{
		// 		posX: 800,
		// 		posY: 275,
		// 		latVelocity: 0,
		// 		longVelocity: 8,
		// 		facing: 1,
		// 	},
		// 	{
		// 		playerRelation: 'friendly',
		// 		behaviorAssignedGoal: behavior.possibleGoals.maintainVelocity,
		// 		id: 'alpha_3',
		// 	}
		// );

		// entities.spawn(
		// 	'fenrir',
		// 	{
		// 		posX: 600,
		// 		posY: 240,
		// 		latVelocity: 0,
		// 		longVelocity: 0,
		// 	},
		// 	{
		// 		playerRelation: 'neutral',
		// 		behaviorAssignedGoal: behavior.possibleGoals.holdStation,
		// 		id: 'beta_1',
		// 		hasBeenScanned: true,
		// 	}
		// );

		// entities.spawn(
		// 	'fenrir',
		// 	{
		// 		posX: 2000,
		// 		posY: 1200,
		// 		latVelocity: 0,
		// 		longVelocity: -8,
		// 		facing: -1,
		// 	},
		// 	{
		// 		playerRelation: 'hostile',
		// 		behaviorAssignedGoal: behavior.possibleGoals.maintainVelocity,
		// 		id: 'delta_1',
		// 		hasBeenScanned: true,
		// 	}
		// );

		// entities.spawn(
		// 	'fenrir',
		// 	{
		// 		posX: 1970,
		// 		posY: 1200,
		// 		latVelocity: 0,
		// 		longVelocity: -8,
		// 		facing: -1,
		// 	},
		// 	{
		// 		playerRelation: 'hostile',
		// 		behaviorAssignedGoal: behavior.possibleGoals.maintainVelocity,
		// 		id: 'delta_2',
		// 		hasBeenScanned: true,
		// 	}
		// );

		// entities.spawn(
		// 	'fenrir',
		// 	{
		// 		posX: 1940,
		// 		posY: 1200,
		// 		latVelocity: 0,
		// 		longVelocity: -8,
		// 		facing: -1,
		// 	},
		// 	{
		// 		playerRelation: 'hostile',
		// 		behaviorAssignedGoal: behavior.possibleGoals.maintainVelocity,
		// 		id: 'delta_3',
		// 		hasBeenScanned: true,
		// 	}
		// );

		// entities.spawn(
		// 	'fenrir',
		// 	{
		// 		posX: 1910,
		// 		posY: 1200,
		// 		latVelocity: 0,
		// 		longVelocity: -8,
		// 		facing: -1,
		// 	},
		// 	{
		// 		playerRelation: 'hostile',
		// 		behaviorAssignedGoal: behavior.possibleGoals.maintainVelocity,
		// 		id: 'delta_4',
		// 		hasBeenScanned: true,
		// 	}
		// );

		// entities.spawn(
		// 	'fenrir',
		// 	{
		// 		posX: 2030,
		// 		posY: 1200,
		// 		latVelocity: 0,
		// 		longVelocity: -8,
		// 		facing: -1,
		// 	},
		// 	{
		// 		playerRelation: 'hostile',
		// 		behaviorAssignedGoal: behavior.possibleGoals.maintainVelocity,
		// 		id: 'delta_5',
		// 		hasBeenScanned: true,
		// 	}
		// );

		// entities.spawn(
		// 	'fenrir',
		// 	{
		// 		posX: 2060,
		// 		posY: 1200,
		// 		latVelocity: 0,
		// 		longVelocity: -8,
		// 		facing: -1,
		// 	},
		// 	{
		// 		playerRelation: 'hostile',
		// 		behaviorAssignedGoal: behavior.possibleGoals.maintainVelocity,
		// 		id: 'delta_6',
		// 		hasBeenScanned: true,
		// 	}
		// );

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

		timing.currentMode = timing.modes.play;
		this.pixiState = this.play;

		// Create an update loop
		this.ticker.add(this.gameLoop.bind(this));

		// triggers
		timing.setTrigger(
			'appjs-1st-trigger',
			() => {
				// dialog(
				// 	'Commander Shepherd',
				// 	"Since our time together is coming to a close, I'd like to tell you on behalf of the team that we really loved having you with us, getting clear-eyed feedback on the Valkyrie's control scheme and calibration from a fresh graduate's perspective turned out to be a huge help."
				// );
				// alertsAndWarnings.add(c.alertsAndWarnings.warnings.collision);
				// alertsAndWarnings.add(c.alertsAndWarnings.warnings.otherWarning);
				status.add('aqua', 'Aqua test. #1', timing.times.play);
				status.add('yellow', 'Yellow test. #2', timing.times.play);
				hud.toggle(true);

				// this.dispatch({
				// 	type: c.actions.FLIP,
				// 	id: 'alpha_1',
				// 	store: 'targetable',
				// });
				// flipStageEntity('alpha_1', entities.stageEntities, 1);
				// shots.startShooting('alpha_1');

				// entities.stageEntities.beta_1.blowUp();
				// shots.showDamage(
				// 	'beta_1',
				// 	'targetable',
				// 	'destruction',
				// 	entities.stageEntities
				// );
			},
			timing.modes.play,
			2000
		);

		timing.setTrigger(
			'appjs-2nd-trigger',
			() => {
				// dialog('Love Eternal', 'Prepare to be assimilated.');
				// alertsAndWarnings.add(c.alertsAndWarnings.alerts.systemsOffline);
				status.add('green', 'Green test. #3', timing.times.play);

				// this.dispatch({
				// 	type: c.actions.FLIP,
				// 	id: 'alpha_1',
				// 	store: 'targetable',
				// });
				// flipStageEntity('alpha_1', entities.stageEntities, -1);

				// this.dispatch({
				// 	type: c.actions.CHANGE_PLAYER_RELATION,
				// 	entityId: 'beta_1',
				// 	newRelation: 'hostile',
				// 	callbackFn: (newRelation) => {
				// 		entities.stageEntities['beta_1'].reticuleRelation(newRelation);
				// 		status.add(
				// 			'red',
				// 			'[Beta 1] relation switched to hostile.',
				// 			timing.times.play
				// 		);
				// 	},
				// });
				// hud.toggle(false);
				shots.stopShooting('alpha_1');
			},
			timing.modes.play,
			8000
		);

		const clearTriggerTest = timing.setTrigger(
			'appjs-3rd-trigger',
			() => {
				dialog('Death Herself', 'Resistance is futile.');
				// alertsAndWarnings.remove(c.alertsAndWarnings.alerts.systemsOffline);
			},
			timing.modes.play,
			16000
		);

		timing.clearTrigger(clearTriggerTest);

		timing.setTrigger(
			'appjs-4th-trigger',
			() => {
				dialog('', '', true);
				// alertsAndWarnings.remove(c.alertsAndWarnings.warnings.collision);
				// alertsAndWarnings.remove(c.alertsAndWarnings.warnings.otherWarning);
				status.add('red', 'Red test. #4', timing.times.play);
				status.add('aqua', 'Aqua test. #5', timing.times.play);
				status.add('yellow', 'Yellow test. #6', timing.times.play);
			},
			timing.modes.play,
			20000
		);
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

		// hud updates
		hud.update(
			currentState.game.targeting,
			currentState.game.playerShips,
			currentState.entities,
			currentState.positions,
			playerId
		);

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
					playerId
				);
			}

			const [playerX, playerY] = getPosition(playerId, currentState.positions);

			// out of bounds warning/alert
			if (
				playerX < this.softBoundaries.minX ||
				playerX > this.softBoundaries.maxX ||
				playerY < this.softBoundaries.minY ||
				playerY > this.softBoundaries.maxY
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
				playerX < c.playVolume.minX ||
				playerX > c.playVolume.maxX ||
				playerY < c.playVolume.minY ||
				playerY > c.playVolume.maxY
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

		// scanning
		if (
			!currentState.game.targetHasBeenScanned &&
			currentState.game.targeting
		) {
			this.dispatch({ type: c.actions.SCAN });
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
