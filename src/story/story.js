import c from '../utils/constants';
import storyConstants from './storyConstants';
import intro from './scenes/intro';
import mainMenu from './scenes/mainMenu';
import scene001 from './scenes/scene001';
import scene002 from './scenes/scene002';
import scene003 from './scenes/scene003';
import scene004 from './scenes/scene004';
import plates from '../plates';
import timing from '../utils/timing';
import hud from '../hud';
import entities from '../entities/entities';
import soundEffects from '../audio/soundEffects';
import music from '../audio/music';
import {
	shields,
	gameLog,
	makeName,
	storePlayerProgress,
	readPlayerProgress,
	getHasThePlayerMadeProgress,
	alertsAndWarnings,
	messageLayer,
	getHasThePlayerCompletedTheGame,
	showConfirmationDialog,
	showContinueDialog,
} from '../utils/helpers';
import formations from '../behavior/formations';
import shots from '../shots';
import gameMenus from '../gameMenus';
import controlSchemes from '../controlSchemes';
import audioLibrary from '../audio/audioLibrary';
import finishers from '../finishers';

const story = {
	handlers: {
		dispatch: null,
		state: null,
		stage: null,
		playVolume: null,
		playVolumeBoundaries: null,
		frameZero: null,
		transitionsInProgress: null,
		hudShouldBeShowing: null,
		activeKeyboardLayout: null,
		hud: null,
		pairedTrack: null,
		resetCameraCurrentShift: null,
	}, // gets its values in App.js
	themeMusicInterval: null,
	sceneList: [
		{
			id: storyConstants.scenes.intro,
			sceneObject: intro,
			hasTitlePlate: false,
			hasEntities: false,
			hasGameplay: false,
			showStatusBar: false,
		},
		{
			id: storyConstants.scenes.mainMenu,
			sceneObject: mainMenu,
			hasTitlePlate: false,
			hasEntities: false,
			hasGameplay: false,
			showStatusBar: false,
		},
		{
			id: storyConstants.scenes.scene001,
			sceneObject: scene001,
			hasTitlePlate: true,
			hasEntities: true,
			hasGameplay: true,
			showStatusBar: true,
		},
		{
			id: storyConstants.scenes.scene002,
			sceneObject: scene002,
			hasTitlePlate: true,
			hasEntities: true,
			hasGameplay: true,
			showStatusBar: true,
		},
		{
			id: storyConstants.scenes.scene003,
			sceneObject: scene003,
			hasTitlePlate: true,
			hasEntities: true,
			hasGameplay: true,
			showStatusBar: true,
		},
		{
			id: storyConstants.scenes.scene004,
			sceneObject: scene004,
			hasTitlePlate: true,
			hasEntities: true,
			hasGameplay: true,
			showStatusBar: true,
		},
	],
	currentScene: null,
	currentSceneBeat: null,
	// sceneTransitionIsInProgress: false,
	// missionFailureWasTriggered: false,
	playerIsReplayingScenes: false,
	playerReachedTheFinalStoryBeatOfTheFinalGameplayScene: false,
	currentObjectives: {
		show: [],
		advanceWhen: [],
	},
	currentStoryEntities: {},
	noProgressYetMessage:
		"According to your browser's storage, you haven't made any progress in this game yet, please choose 'New game' instead.",
	playerAlreadyCompletedGameMessage:
		"You have already completed the game, please choose 'New game' to start over or 'Replay Scene' to replay a particular level.",

	assertClassification(entityId) {
		const storyEntity = story.currentStoryEntities[entityId];
		if (storyEntity === undefined) {
			return '';
		} else {
			const fullTypeName = storyEntity.type;

			if (
				fullTypeName.includes('fighter') ||
				fullTypeName.includes('fenrir') ||
				fullTypeName.includes('valkyrie')
			) {
				return 'Fighter ';
			} else if (fullTypeName.includes('shuttle')) {
				return 'Shuttle ';
			} else if (fullTypeName.includes('freighter')) {
				return 'Freighter ';
			} else if (fullTypeName.includes('container')) {
				return 'Container ';
			}
		}
	},
	storyStateFns: {
		addFighterToPlayerHangar(fighterTypeId, preventDuplicates) {
			const currentState = story.handlers.state();

			story.handlers.dispatch({
				type: c.actions.ADD_FIGHTER_TO_PLAYER_HANGAR,
				fighterTypeId,
				preventDuplicates,
				callbackFn: () => {
					const functionSignature =
						'story.js@addFighterToPlayerHangar() -> callbackFn()';
					console.log(functionSignature);
					hud.requestFullReRender = true;
					storePlayerProgress(
						`${functionSignature} - add fighter to player hangar`,
						story.handlers.state,
						currentState.game.currentScene
					);
				},
			});
		},
		getMomentaryEntityPosition(entityId) {
			const currentState = story.handlers.state();
			let posX = null;
			let posY = null;
			if ('positions' in currentState && 'canMove' in currentState.positions) {
				if (`${entityId}--posX` in currentState.positions.canMove) {
					posX = currentState.positions.canMove[`${entityId}--posX`];
				}
				if (`${entityId}--posY` in currentState.positions.canMove) {
					posY = currentState.positions.canMove[`${entityId}--posY`];
				}
			}
			return { posX, posY };
		},
	},

	/**
	 *
	 * Call with playScene = null to auto-advance to the next scene
	 */

	advance(calledBy, playScene = null, playSceneBeat = 0, hurryUp = false) {
		const functionSignature = 'story.js@advance()';

		if (c.debug.sequentialEvents || c.debug.objectives)
			console.log(functionSignature, {
				calledBy,
				playScene,
				playSceneBeat,
				hurryUp,
			});

		const currentState = story.handlers.state();

		if (story.currentScene !== null && story.currentScene.startsWith('scene')) {
			console.log(functionSignature, 'Current scene is a gameplay scene.');

			if (
				currentState.game.playerShips.current === null &&
				playScene !== 'mainMenu' &&
				playScene !== story.currentScene
			) {
				console.log(
					functionSignature,
					"The player has no fighters left, so the story shouldn't be advancing, returning early..."
				);
				return;
			}
		}

		let cleanUpNeeded = false;

		const playerId =
			c.playerIdPartial + currentState.game.playerShips.currentIdSuffix;
		const playerShipType = currentState.game.playerShips.current;

		if (story.currentScene === null) {
			story.currentScene = story.sceneList[0].id; // set scene to the intro
		} else {
			if (playSceneBeat === 0) cleanUpNeeded = true;
			if (playScene !== null) {
				// playScene attribute is not null, so we need to set the current scene
				story.currentScene = playScene;
			} else {
				// playScene attribute is null, so we need to advance to the next scene
				let index = story.sceneList.findIndex(
					(el) => el.id === story.currentScene
				);
				index++;
				if (story.sceneList[index] !== undefined) {
					// more scenes exist
					story.currentScene = story.sceneList[index].id;
				} else {
					// no more scenes exist

					if (story.playerIsReplayingScenes) {
						// player is replaying scenes, so we just return to the main menu
						if (c.debug.sequentialEvents)
							console.log(
								functionSignature,
								'player is replaying scenes, returning to the main menu'
							);
						story.mainMenu(false, false, false);
						return;
					}

					// player has completed all levels of the game
					if (c.debug.sequentialEvents)
						console.log(
							functionSignature,
							'PLAYER HAS COMPLETED ALL LEVELS OF THE GAME'
						);
					plates.fullMatte();
					plates.loadPlate('the_end');
					plates.fadeInPlate(25);
					timing.toggleEntityMovement(false, 'story.js@advance() 1', 1000);
					timing.setTimeout(
						() => {
							soundEffects.muteUnmuteAllLoops('story.js@advance() 2', true);
						},
						timing.modes.play,
						1000
					);

					timing.setTimeout(
						() => {
							finishers.show();
						},
						timing.modes.play,
						6000
					);

					plates.fadeOutPlate(25, 8000);
					timing.setTimeout(
						() => {
							const functionSignature =
								'story.js@advance() -> GAME_COMPLETED setTimeoutFn()';
							story.advance(functionSignature, 'mainMenu', 0);
						},
						timing.modes.play,
						8200
					);
					story.handlers.dispatch({
						type: c.actions.GAME_COMPLETED,
						callbackFn: () => {
							const functionSignature =
								'story.js@advance() -> GAME_COMPLETED callbackFn()';
							console.log(functionSignature);
							storePlayerProgress(
								`${functionSignature} - player has completed all levels of the game`,
								story.handlers.state,
								currentState.game.currentScene
							);
						},
					});

					return;
				}
			}
		}

		if (c.debug.sequentialEvents)
			console.log(functionSignature, 'story.currentScene:', story.currentScene);

		const currentSceneListObject = story.sceneList.find(
			(el) => el.id === story.currentScene
		);
		const currentSceneObject = currentSceneListObject.sceneObject;

		if (playSceneBeat === 0) {
			if (currentSceneListObject.hasEntities) {
				story.currentStoryEntities = currentSceneObject.entities;
			}
			story.handlers.playVolume.current = currentSceneObject.playVolume;
			story.handlers.playVolume.recalculateSoftBoundaries();
			story.handlers.playVolumeBoundaries.reDraw(currentSceneObject.playVolume);
			story.handlers.pairedTrack.actual = currentSceneObject.pairedTrack;
			console.log(
				functionSignature,
				'pairedTrack set to:',
				story.handlers.pairedTrack.actual
			);
			// story.sceneTransitionIsInProgress = false;
			story.handlers.transitionsInProgress.functions.transitionComplete(
				c.TRACKED_TRANSITION_TYPES.scene
			);
			story.handlers.transitionsInProgress.functions.transitionComplete(
				c.TRACKED_TRANSITION_TYPES.missionFailed
			);
			story.handlers.transitionsInProgress.functions.transitionComplete(
				c.TRACKED_TRANSITION_TYPES.playerShipDestroyedRespawning
			);
			story.handlers.transitionsInProgress.functions.transitionComplete(
				c.TRACKED_TRANSITION_TYPES.playerShipDestroyedGameOver
			);
			story.handlers.resetCameraCurrentShift();

			if (currentSceneListObject.id !== storyConstants.scenes.mainMenu) {
				const localStoragePlayerProgress = readPlayerProgress(true);
				if (currentSceneListObject.id === storyConstants.scenes.intro) {
					// intro scene
					if (localStoragePlayerProgress === null) {
						// this player is a first time visitor
						if (c.debug.localStorage)
							console.log(
								functionSignature,
								'localStorage value is either missing or invalid, populating with the defaults from initialGameState.js'
							);
						storePlayerProgress(
							`${functionSignature} - intro scene, first time visitor`,
							story.handlers.state,
							storyConstants.scenes.intro
						);
					} else {
						if (c.debug.localStorage)
							console.log(
								'updating player progress from localStorage:',
								localStoragePlayerProgress
							);
						story.handlers.dispatch({
							type: c.actions.UPDATE_PLAYER_PROGRESS_BASED_ON_LOCAL_STORAGE,
							localStoragePlayerProgress: localStoragePlayerProgress,
						});
					}
				} else {
					// gameplay scenes
					const playersBestSceneId = localStoragePlayerProgress.bestSceneId;
					const playersBestSceneIndex = story.sceneList.findIndex(
						(sc) => sc.id === playersBestSceneId
					);
					const currentSceneIndex = story.sceneList.findIndex(
						(sc2) => sc2.id === currentSceneListObject.id
					);

					let writeBestSceneId = playersBestSceneId;
					if (currentSceneIndex > playersBestSceneIndex) {
						writeBestSceneId = currentSceneListObject.id;
					}

					storePlayerProgress(
						`${functionSignature} - gameplay scene`,
						story.handlers.state,
						writeBestSceneId
					);
				}
			}
		}

		let currentStateScene = currentState.game.currentScene;
		if (currentStateScene !== story.currentScene) {
			let newCurrentScenePlayerStartingPositionX = null;
			let newCurrentScenePlayerStartingPositionY = null;

			if (
				'playerStartingPosition' in currentSceneObject &&
				'posX' in currentSceneObject.playerStartingPosition &&
				'posY' in currentSceneObject.playerStartingPosition
			) {
				newCurrentScenePlayerStartingPositionX =
					currentSceneObject.playerStartingPosition.posX;
				newCurrentScenePlayerStartingPositionY =
					currentSceneObject.playerStartingPosition.posY;
			}

			story.handlers.dispatch({
				type: c.actions.SET_CURRENT_SCENE,
				newCurrentScene: story.currentScene,
				newCurrentScenePlayerStartingPositionX,
				newCurrentScenePlayerStartingPositionY,
			});
		}

		story.currentSceneBeat = playSceneBeat;

		if (c.debug.sequentialEvents)
			console.log('story.currentSceneBeat:', story.currentSceneBeat);

		const currentSceneBeatObj =
			currentSceneObject.storyBeats[story.currentSceneBeat];

		if (c.debug.sequentialEvents) console.log(currentSceneObject);

		if (!currentSceneBeatObj.isTheFinalGameplayBeat) {
			story.handlers.transitionsInProgress.functions.transitionComplete(
				c.TRACKED_TRANSITION_TYPES.scene
			);
		}

		if (cleanUpNeeded) {
			story.cleanUp();
		}

		if (currentSceneListObject.hasTitlePlate && playSceneBeat === 0) {
			currentSceneObject.handlers.checkBeatCompletion =
				story.checkBeatCompletion;
			currentSceneObject.handlers.storyStateFns = story.storyStateFns;

			gameLog.add(
				gameLog.ENTRY_COLORS.white,
				`---&nbsp;&nbsp;&nbsp;${currentSceneObject.titlePlate.title}&nbsp;&nbsp;&nbsp;---`,
				timing.times.play
			);
			plates.fullMatte();
			plates.loadPlate(
				'mission_title',
				-1,
				currentSceneObject.titlePlate.title,
				currentSceneObject.titlePlate.subTitle
			);
			timing.toggleEntityMovement(false, 'story.js@advance() 3');
			soundEffects.muteUnmuteAllLoops('story.js@advance() 4', true);
			plates.fadeInPlate(25);
			plates.fadeOutMatte(50, 6000);
			timing.toggleEntityMovement(true, 'story.js@advance() 5', 6000);
			timing.setTimeout(
				() => {
					soundEffects.muteUnmuteAllLoops('story.js@advance() 6', false);
				},
				timing.modes.play,
				6000
			);
			plates.fadeOutPlate(25, 9000);
		}

		if (!currentSceneListObject.hasEntities) {
			timing.toggleEntityMovement(false, 'story.js@advance() 7');
		}

		if (currentSceneListObject.showStatusBar) {
			document.getElementById('game__log').style.display = 'flex';
		} else {
			document.getElementById('game__log').style.display = 'none';
		}

		//register new objectives
		if (currentSceneListObject.hasGameplay) {
			const objectiveUpdates = currentSceneBeatObj.registerObjectives();
			story.updateCurrentObjectives(objectiveUpdates);
		}

		// set the keyboard layout
		story.handlers.activeKeyboardLayout.current =
			currentSceneBeatObj.keyboardLayout;
		story.handlers.activeKeyboardLayout.currentStoryBeatLayout =
			currentSceneBeatObj.keyboardLayout;

		if (currentSceneListObject.id === storyConstants.scenes.mainMenu) {
			if (
				music.playingTrack !==
				audioLibrary.library.music.sublight_patrol_theme.id
			) {
				music.stopPlaying();
			}
			setTimeout(() => {
				if (story.currentScene === storyConstants.scenes.mainMenu) {
					console.log(
						'story.js@advance timeout fn() -> mainMenu scene, playing theme music'
					);
					music.playTrack(audioLibrary.library.music.sublight_patrol_theme.id);
				}
			}, 5000);
			story.registerThemeMusicInterval();
		} else {
			if (story.themeMusicInterval !== null) {
				story.clearThemeMusicInterval();
			}
		}

		// scene object execution
		currentSceneBeatObj.execute({ playerId, playerShipType, hurryUp });

		if (currentSceneBeatObj.cameraMode === c.cameraModes.gameplay) {
			story.handlers.hudShouldBeShowing.actual = true;
			timing.setTrigger(
				'story-hud-trigger1',
				() => {
					shots.registerEntityCannons(playerId);
				},
				timing.modes.play,
				1500
			);
			timing.setTrigger(
				'story-hud-trigger2',
				() => {
					hud.reInitPixiHUD(playerId);

					// hud.toggle('story.js@advance() 4', true);
				},
				timing.modes.play,
				6000
			);
		} else {
			story.handlers.hudShouldBeShowing.actual = false;
			// hud.toggle('story.js@advance() 4', false);
		}
	},

	restartMission() {
		const functionSignature = 'story.js@restartMission()';
		gameMenus.clearButtons();
		alertsAndWarnings.clear();
		alertsAndWarnings.hide();
		messageLayer.hide();
		plates.clearAll();
		timing.clearAllScheduledEvents();
		gameLog.add(
			gameLog.ENTRY_COLORS.white,
			'Mission restarted...',
			timing.times.play
		);
		story.handlers.dispatch({
			type: c.actions.RESTORE_PLAYER_SHIPS_LOST_ON_THIS_MISSION,
		});
		story.advance(functionSignature, story.currentScene, 0);
		story.handlers.frameZero.actual = true;
	},

	mainMenu(
		askForConfirmation = true,
		hurryUp = false,
		restorePlayerShipsLostOnThisMission = false
	) {
		function mainMenuProper() {
			const functionSignature = 'story.js@mainMenu() -> mainMenuProper()';
			if (restorePlayerShipsLostOnThisMission) {
				story.handlers.dispatch({
					type: c.actions.RESTORE_PLAYER_SHIPS_LOST_ON_THIS_MISSION,
				});
			}

			alertsAndWarnings.clear();
			alertsAndWarnings.hide();
			messageLayer.hide();
			plates.clearAll();
			timing.clearAllScheduledEvents();
			if (timing.isPaused()) window.pixiapp.togglePause('dontFadeMatte');
			gameMenus.clearButtons();
			story.advance(functionSignature, 'mainMenu', 0, hurryUp);
		}

		if (askForConfirmation) {
			// if (
			// 	confirm(
			// 		'Returning to the main menu will reset your progress on the current mission. Continue anyway?'
			// 	)
			// ) {
			// 	mainMenuProper();
			// }

			showConfirmationDialog(
				'Returning to the main menu will reset your progress on the current mission. Continue anyway?',
				() => {
					mainMenuProper();
				},
				null,
				controlSchemes
			);
		} else {
			mainMenuProper();
		}
	},

	replaySceneMenu() {
		const localStoragePlayerProgress = readPlayerProgress();

		let goAhead = false;

		if (localStoragePlayerProgress === null) {
			goAhead = true;
		} else {
			if (!getHasThePlayerMadeProgress(localStoragePlayerProgress)) {
				// alert(story.noProgressYetMessage);
				showContinueDialog(
					story.noProgressYetMessage,
					'yellow',
					null,
					controlSchemes
				);
			} else {
				goAhead = true;
			}
		}

		if (goAhead) {
			story.handlers.activeKeyboardLayout.current =
				controlSchemes.replaySceneMenu.id;
			story.removeMainMenuTopPortion();
			gameMenus.clearButtons();
			gameMenus.showReplaySceneButtonSet(story.sceneList);
		}
	},

	replaySceneActual(sceneId, sceneIndex, replayDisabled) {
		const functionSignature = 'story.js@replaySceneActual()';
		const localStoragePlayerProgress = readPlayerProgress();

		if (c.debug.sequentialEvents || c.debug.menuButtons) {
			console.log(
				functionSignature,
				`called with sceneId: ${sceneId}, sceneIndex: ${sceneIndex}, replayDisabled: ${replayDisabled}`
			);
			console.log(functionSignature, {
				localStoragePlayerProgress,
			});
		}

		let goAhead = false;
		if (localStoragePlayerProgress === null) {
			goAhead = true;
		} else {
			if (replayDisabled) {
				// alert("I'm sorry, you haven't unlocked that scene yet.");
				showContinueDialog(
					"I'm sorry, you haven't unlocked that scene yet.",
					'yellow',
					null,
					controlSchemes
				);
			} else {
				goAhead = true;
			}
		}

		if (c.debug.sequentialEvents || c.debug.menuButtons)
			console.log(functionSignature, { goAhead });

		if (goAhead) {
			story.playerIsReplayingScenes = true;
			music.stopPlaying();
			gameMenus.clearButtons();
			hud.requestFullReRender = true;
			gameLog.clear();
			story.advance(functionSignature, sceneId, 0);
		}
	},

	newGame() {
		const functionSignature = 'story.js@newGame()';
		console.log(functionSignature, 'called');

		const localStoragePlayerProgress = readPlayerProgress();

		function newGameProper() {
			const functionSignature = 'story.js@newGameProper()';

			console.log(functionSignature);

			story.handlers.dispatch({
				type: c.actions.REVERT_PLAYER_PROGRESS_TO_DEFAULTS,
			});

			story.playerIsReplayingScenes = false;

			music.stopPlaying();
			gameMenus.clearButtons();
			story.removeMainMenuTopPortion();

			storePlayerProgress(
				`${functionSignature}`,
				story.handlers.state,
				storyConstants.scenes.scene001
			);

			hud.requestFullReRender = true;

			gameLog.clear();

			story.advance(functionSignature);
		}

		if (!getHasThePlayerMadeProgress(localStoragePlayerProgress)) {
			newGameProper();
		} else {
			// if (
			// 	confirm(
			// 		'Starting a new game will erase your previous progress. Continue anyway?'
			// 	)
			// ) {
			// 	newGameProper();
			// }

			showConfirmationDialog(
				'Starting a new game will erase your previous progress. Continue anyway?',
				() => {
					newGameProper();
				},
				null,
				controlSchemes
			);
		}
	},

	continueGame() {
		const functionSignature = 'story.js@continueGame()';
		const localStoragePlayerProgress = readPlayerProgress();

		const relevantPlayerProgress = getHasThePlayerMadeProgress(
			localStoragePlayerProgress
		);
		const hasThePlayerCompletedTheGame = getHasThePlayerCompletedTheGame(
			localStoragePlayerProgress
		);

		if (!relevantPlayerProgress && !hasThePlayerCompletedTheGame) {
			// alert(story.noProgressYetMessage);
			showContinueDialog(
				story.noProgressYetMessage,
				'yellow',
				null,
				controlSchemes
			);
		} else if (hasThePlayerCompletedTheGame) {
			// alert(story.playerAlreadyCompletedGameMessage);
			showContinueDialog(
				story.playerAlreadyCompletedGameMessage,
				'yellow',
				null,
				controlSchemes
			);
		} else {
			story.playerIsReplayingScenes = false;

			music.stopPlaying();
			gameMenus.clearButtons();
			hud.requestFullReRender = true;
			story.removeMainMenuTopPortion();
			story.advance(
				functionSignature,
				localStoragePlayerProgress.bestSceneId,
				0
			);
		}
	},

	removeMainMenuTopPortion() {
		document
			.getElementById('game__main_menu')
			.classList.remove('game__main_menu--shown', 'game__main_menu--quickshow');
		document
			.getElementById('header__title')
			.classList.remove('header__title--hidden');
	},

	init() {
		gameMenus.buttonFunctions.restartMission = story.restartMission;
		gameMenus.buttonFunctions.mainMenu = story.mainMenu;
		gameMenus.buttonFunctions.newGame = story.newGame;
		gameMenus.buttonFunctions.continueGame = story.continueGame;
		gameMenus.buttonFunctions.replaySceneMenu = story.replaySceneMenu;
		gameMenus.buttonFunctions.replaySceneActual = story.replaySceneActual;
	},

	updateCurrentObjectives(updates) {
		const functionSignature = 'story.js@updateCurrentObjectives()';
		if (c.debug.objectives) console.log(functionSignature, updates);
		story.currentObjectives.show = [
			...story.currentObjectives.show,
			...updates.show,
		];
		story.currentObjectives.show.forEach((sitem) => {
			if (sitem.currentPercentage === undefined) {
				sitem.currentPercentage = 0;
				sitem.failed = false;
			}
		});
		story.currentObjectives.advanceWhen = updates.advanceWhen;
		story.currentObjectives.advanceWhen.forEach((awitem) => {
			if (awitem.currentPercentage === undefined) {
				awitem.currentPercentage = 0;
				awitem.failed = false;
			}

			if (awitem.type === c.objectiveTypes.disabled.id) {
				const equivalentShowObjectiveIdx =
					story.currentObjectives.show.findIndex(
						(el) =>
							el.type === c.objectiveTypes.disabled.id &&
							el.entityId === awitem.entityId
					);

				if (equivalentShowObjectiveIdx === -1) {
					console.error(
						functionSignature,
						'the "advanceWhen" in the update has a disabled-type objective but no equivalent "show" objective could be located:',
						{ updates, 'story.currentObjectives': story.currentObjectives }
					);
				}

				if (
					story.currentObjectives.show[equivalentShowObjectiveIdx]
						.currentPercentage > 0
				) {
					awitem.currentPercentage =
						story.currentObjectives.show[
							equivalentShowObjectiveIdx
						].currentPercentage;
				}
			}
		});

		if (updates.show.length > 0) {
			gameLog.add(
				gameLog.ENTRY_COLORS.yellow,
				'Mission objectives updated.',
				timing.times.play
			);
		}

		story.updateObjectiveDisplay();
	},

	checkAgainstCurrentObjectives(
		entityId,
		eventId,
		wasPreviouslyInspected = false
	) {
		const functionSignature = 'story.js@checkAgainstCurrentObjectives()';
		if (c.debug.objectives)
			console.log(functionSignature, entityId, eventId, wasPreviouslyInspected);

		if (typeof eventId !== 'string') {
			console.error(
				'eventId must be a string, this was received instead:',
				eventId
			);
		}

		if (eventId === c.objectiveTypes.destroyed.id) {
			story.currentStoryEntities[entityId].wasDespawned = true;
		}

		let entityGroup = null;
		let entitiesInGroup = 0;
		const currentStoryEntity = story.currentStoryEntities[entityId];
		if (currentStoryEntity !== undefined) {
			if (currentStoryEntity.groupId !== undefined) {
				entityGroup = currentStoryEntity.groupId;
				for (const storyEntityId in story.currentStoryEntities) {
					if (story.currentStoryEntities[storyEntityId].groupId === entityGroup)
						entitiesInGroup++;
				}
			}
		}

		if (c.debug.objectives)
			console.log(functionSignature, {
				currentStoryEntities: story.currentStoryEntities,
				entityId,
				entityGroup,
				entitiesInGroup,
			});

		let entityClassification = story.assertClassification(entityId);

		let entityInvolvedIn = [];

		// look through all objectives in both stores
		// to see if the entity is involved
		for (const objectiveStore in story.currentObjectives) {
			story.currentObjectives[objectiveStore].forEach((obj) => {
				if (obj.groupId === undefined) {
					if (entityId === obj.entityId) {
						entityInvolvedIn.push({
							store: objectiveStore,
							objectiveObj: obj,
						});
					}
				} else {
					if (entityGroup === null) return;
					if (entityGroup === obj.groupId) {
						entityInvolvedIn.push({
							store: objectiveStore,
							objectiveObj: obj,
						});
					}
				}
			});
		}

		if (c.debug.objectives)
			console.log(functionSignature, { entityInvolvedIn });

		// walk through the collected objectives and update them
		// based on this event
		let failState = false;
		let meansProgress = false;
		let updatedObjectiveMessages = [];

		entityInvolvedIn.forEach((el) => {
			const objectiveType = el.objectiveObj.type;
			let hasUpdated = false;
			if (
				c.objectiveTypes[objectiveType].failsIfEventIs.includes(eventId) ||
				(eventId === c.objectiveTypes.destroyed.id &&
					!wasPreviouslyInspected &&
					objectiveType === c.objectiveTypes.inspected.id)
			) {
				// example: the entity should have been disabled,
				// but it was destroyed instead
				if (
					el.objectiveObj.groupId === undefined ||
					el.objectiveObj.requiredPercentage === 100
				) {
					failState = true;
					el.objectiveObj.failed = true;
					hasUpdated = true;
				} else {
					// determine if the objective can still be completed
					// after this change
					let remainingPercentage = 0;
					for (const cseid in story.currentStoryEntities) {
						if (
							story.currentStoryEntities[cseid].groupId === entityGroup &&
							!story.currentStoryEntities[cseid].wasDespawned
						) {
							remainingPercentage += (1 / entitiesInGroup) * 100;
						}
					}

					if (c.debug.objectives)
						console.log(functionSignature, {
							remainingPercentage,
							requiredPercentage: el.objectiveObj.requiredPercentage,
						});

					if (remainingPercentage < el.objectiveObj.requiredPercentage) {
						if (c.debug.objectives)
							console.log(
								functionSignature,
								'remainingPercentage < requiredPercentage, setting objective to failed'
							);
						failState = true;
						el.objectiveObj.failed = true;
						hasUpdated = true;
					}
				}
			} else {
				if (
					eventId === objectiveType ||
					(objectiveType === c.objectiveTypes.forcedToFleeOrDestroyed.id &&
						(eventId === c.objectiveTypes.forcedToFlee.id ||
							eventId === c.objectiveTypes.destroyed.id))
				) {
					meansProgress = true;
					hasUpdated = true;
					if (el.objectiveObj.groupId === undefined) {
						// this objective only involves a single entity
						el.objectiveObj.currentPercentage = 100;
					} else {
						el.objectiveObj.currentPercentage += (1 / entitiesInGroup) * 100;
					}
				}
			}

			if (hasUpdated && el.store !== 'advanceWhen') {
				const [itemColor, objectiveText] = story.returnObjectiveText(
					el.objectiveObj,
					meansProgress
				);
				updatedObjectiveMessages.push({
					color: itemColor,
					message: 'Objectives: ' + objectiveText,
				});
			}
		});

		story.updateObjectiveDisplay();

		if (updatedObjectiveMessages.length < 1) {
			// this event didnt cause any progress with the objectives
			// so we'll print a yellow gameLog message
			let printStatus = true;
			let gameLogColor = gameLog.ENTRY_COLORS.yellow;
			let gameLogMessage = `${entityClassification}[${makeName(entityId)}] ${
				c.objectiveTypes[eventId].completed_desc
			}`;

			if (
				(eventId === c.objectiveTypes.inspected.id && !meansProgress) ||
				(eventId === c.objectiveTypes.hasDespawned.id && !failState) ||
				eventId === c.objectiveTypes.mustHaveArrived.id
			) {
				printStatus = false;
			}

			if (printStatus) {
				gameLog.add(gameLogColor, gameLogMessage, timing.times.play);
			}
		} else {
			updatedObjectiveMessages.forEach((el) => {
				let printThisStatus = true;

				if (eventId === c.objectiveTypes.hasDespawned.id && !failState) {
					printThisStatus = false;
				}

				if (printThisStatus) {
					gameLog.add(el.color, el.message, timing.times.play);
				}
			});
		}

		story.checkBeatCompletion();

		if (failState) {
			if (
				story.handlers.transitionsInProgress.functions.getIsATransitionAlreadyInProgress()
			) {
				console.warn(
					functionSignature,
					'Failstate is true, but a tracked transition is already in progress, returning early...'
				);
				return;
			}

			// story.missionFailureWasTriggered = true;
			story.handlers.transitionsInProgress.functions.registerTransition(
				c.TRACKED_TRANSITION_TYPES.missionFailed
			);
			music.fadeOutPlayingTrack();
			if (c.debug.objectives)
				console.log('MISSION FAILED!', story.currentObjectives);
			plates.loadPlate('mission_failed', -1, 'Mission failed');
			plates.fadeInPlate(25);
			plates.fadeInMatte(50, 1000);
			timing.toggleEntityMovement(
				false,
				'story.js@checkAgainstCurrentObjectives() 1',
				3000
			);
			timing.setTimeout(
				() => {
					soundEffects.muteUnmuteAllLoops(
						'story.js@checkAgainstCurrentObjectives() 2',
						true
					);
				},
				timing.modes.play,
				3000
			);
			plates.fadeOutPlate(25, 4000);
			timing.setTimeout(
				() => {
					gameMenus.showMissionFailedButtonSet();
				},
				timing.modes.play,
				5100
			);
		}
	},

	checkBeatCompletion() {
		const functionSignature = 'story.js@checkBeatCompletion()';
		console.log(functionSignature);
		let updatedObjectiveMessages = [];

		const currentSceneObject = story.sceneList.find(
			(el) => el.id === story.currentScene
		).sceneObject;
		const isTheFinalGameplayBeat =
			currentSceneObject.storyBeats[story.currentSceneBeat]
				.isTheFinalGameplayBeat;

		// if this is the final gameplay beat, all other objectives
		// are complete, and the designated entities survived
		// then set the mustHaveSurvived objectives to 100%
		if (isTheFinalGameplayBeat) {
			let allOthersComplete = true;
			story.currentObjectives.show.forEach((obj) => {
				if (
					obj.type !== c.objectiveTypes.mustHaveSurvived.id &&
					Math.ceil(obj.currentPercentage) < obj.requiredPercentage
				) {
					allOthersComplete = false;
				}
			});

			if (allOthersComplete) {
				story.currentObjectives.show.forEach((obj2) => {
					if (
						obj2.type === c.objectiveTypes.mustHaveSurvived.id &&
						obj2.failed === false
					) {
						obj2.currentPercentage = 100;
						const [itemColor, objectiveText] = story.returnObjectiveText(
							obj2,
							true
						);
						updatedObjectiveMessages.push({
							color: itemColor,
							message: 'Objectives: ' + objectiveText,
						});
					}
				});
			}
		}

		story.updateObjectiveDisplay();

		if (updatedObjectiveMessages.length > 0) {
			updatedObjectiveMessages.forEach((el) => {
				gameLog.add(el.color, el.message, timing.times.play);
			});
		}

		// if all needed objectives are done, we can advance to the
		// next story beat
		let allComplete = true;
		story.currentObjectives.advanceWhen.forEach((obj) => {
			if (
				Math.ceil(obj.currentPercentage) < obj.requiredPercentage ||
				obj.failed
			)
				allComplete = false;
		});

		if (isTheFinalGameplayBeat) {
			story.currentObjectives.show.forEach((obj) => {
				if (
					Math.ceil(obj.currentPercentage) < obj.requiredPercentage ||
					obj.failed
				)
					allComplete = false;
			});

			if (c.debug.objectives) console.log('isTheFinalGameplayBeat');
		}
		if (c.debug.objectives)
			console.log('allComplete:', allComplete, story.currentObjectives);

		if (allComplete) {
			if (c.debug.objectives)
				console.log(
					'ALLCOMPLETE IS TRUE, ADVANCE TO THE NEXT STORY BEAT!',
					story.currentObjectives
				);

			if (story.currentSceneBeat < currentSceneObject.storyBeats.length - 1) {
				// there are more beats in this scene
				story.advance(
					functionSignature,
					story.currentScene,
					story.currentSceneBeat + 1
				);
			} else {
				// advance to the next scene

				// if (story.sceneTransitionIsInProgress) {
				if (
					story.handlers.transitionsInProgress.functions.getIsATransitionAlreadyInProgress()
				) {
					console.warn(
						functionSignature,
						'A tracked transition is already in progress, returning early...'
					);
					return;
				}

				// story.sceneTransitionIsInProgress = true;
				story.handlers.transitionsInProgress.functions.registerTransition(
					c.TRACKED_TRANSITION_TYPES.scene
				);

				music.fadeOutPlayingTrack();

				plates.loadPlate('mission_success', 1000);
				plates.fadeInPlate(25, 1000);
				timing.toggleEntityMovement(
					false,
					'story.js@checkBeatCompletion() 1',
					2000
				);
				timing.setTimeout(
					() => {
						soundEffects.muteUnmuteAllLoops(
							'story.js@checkBeatCompletion() 2',
							true
						);
					},
					timing.modes.play,
					2000
				);
				plates.fadeInMatte(50, 1000);
				plates.fadeOutPlate(50, 5000);
				timing.setTimeout(
					() => {
						const functionSignature =
							'story.js@checkBeatCompletion() -> setTimeoutFn()';
						if (story.playerIsReplayingScenes) {
							story.advance(functionSignature, 'mainMenu', 0, true);
						} else {
							story.advance(functionSignature, null, 0);
						}
					},
					timing.modes.play,
					8500
				);
			}
		}
	},

	entityWasDespawned(entityId) {
		if (c.debug.objectives) console.log('entityWasDespawned:', entityId);
		if (story.currentStoryEntities[entityId] === undefined) return;
		story.currentStoryEntities[entityId].wasDespawned = true;

		story.checkAgainstCurrentObjectives(
			entityId,
			c.objectiveTypes.hasDespawned.id
		);
	},

	updateObjectiveDisplay() {
		// console.log('updateObjectiveDisplay() called');
		const re = [];
		re.push(
			"<div class='game__pause-objectives-title'>Current objectives:</div>\n<ul class='game__pause-objectives-list'>"
		);

		const objectiveLis = story.currentObjectives.show.map((obj) => {
			const [itemColor, objectiveText] = story.returnObjectiveText(obj);
			return `<li class='game__pause-objective game__pause-objective--${itemColor}'>${objectiveText}</li>`;
		});

		re.push(objectiveLis.join(''));

		re.push('</ul>');
		document.getElementById('game__pause-objectives').innerHTML = re.join('');
	},

	returnObjectiveText(objectiveObj, meansProgress = false) {
		let itemColor = gameLog.ENTRY_COLORS.yellow;
		if (meansProgress) itemColor = gameLog.ENTRY_COLORS.dark_green;
		let objectiveText = '';
		let completed = false;

		if (
			objectiveObj.requiredPercentage <=
			Math.ceil(objectiveObj.currentPercentage)
		) {
			itemColor = gameLog.ENTRY_COLORS.green;
			completed = true;
		}

		if (objectiveObj.failed) itemColor = gameLog.ENTRY_COLORS.red;
		if (objectiveObj.groupId === undefined) {
			let entityClassification = story.assertClassification(
				objectiveObj.entityId
			);
			let mainText = c.objectiveTypes[objectiveObj.type].desc;
			let parensText = 'incomplete';
			if (completed) {
				parensText = 'complete';
				mainText = c.objectiveTypes[objectiveObj.type].completed_desc;
			}
			if (objectiveObj.failed) {
				parensText = 'failed';
				mainText = c.objectiveTypes[objectiveObj.type].desc;
			}
			objectiveText = `${entityClassification}${makeName(
				objectiveObj.entityId
			)} ${mainText} (${parensText})`;
		} else {
			let groupClassification = '';
			let firstInGroup = Object.values(story.currentStoryEntities).find(
				(en) => en.groupId === objectiveObj.groupId
			);
			if (firstInGroup !== undefined)
				groupClassification = story.assertClassification(firstInGroup.id);
			if (groupClassification !== '')
				groupClassification = groupClassification.toLowerCase();

			let mainText = c.objectiveTypes[objectiveObj.type].desc;
			let parensText = Math.ceil(objectiveObj.currentPercentage) + '% complete';
			if (completed) {
				parensText = 'complete';
				mainText = c.objectiveTypes[objectiveObj.type].completed_desc;
			}
			if (objectiveObj.failed) {
				parensText = 'failed';
				mainText = c.objectiveTypes[objectiveObj.type].desc;
			}
			objectiveText = `${
				objectiveObj.requiredPercentage
			}% of ${groupClassification}group ${
				objectiveObj.groupId.charAt(0).toUpperCase() +
				objectiveObj.groupId.slice(1)
			} ${mainText} (${parensText})`;
		}

		return [itemColor, objectiveText];
	},

	cleanUp() {
		if (c.debug.objectives) console.log('story.cleanUp() called');

		story.currentObjectives = {
			show: [],
			advanceWhen: [],
		};

		story.handlers.dispatch({ type: c.actions.CLEANUP });

		entities.cleanUp();
		shots.cleanUp();
		soundEffects.cleanUp();
		shields.cleanUp();
		formations.cleanUp();
		hud.cleanUp();
	},

	registerThemeMusicInterval() {
		if (c.debug.sequentialEvents)
			console.log('story.js@registerThemeMusicInterval() called');
		if (story.themeMusicInterval !== null) {
			clearInterval(story.themeMusicInterval);
		}
		story.themeMusicInterval = setInterval(() => {
			const functionSignature =
				'story.js@registerThemeMusicInterval() - intervalFn()';
			if (c.debug.sequentialEvents)
				if (music.playingTrack !== null) {
					console.log(
						functionSignature,
						'music.playingTrack is not null, returning'
					);
				} else {
					console.log(functionSignature, 'playing theme music');
					music.playTrack(audioLibrary.library.music.sublight_patrol_theme.id);
				}
		}, c.repeatMainMenuMusicEveryXSecs * 1000);
	},

	clearThemeMusicInterval() {
		if (c.debug.sequentialEvents)
			console.log('story.js@clearThemeMusicInterval() called');

		clearInterval(story.themeMusicInterval);
		story.themeMusicInterval = null;
	},
};

export default story;
