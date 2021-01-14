import c from '../utils/constants';
// import sc from './storyConstants';
import intro from './scenes/intro';
import mainMenu from './scenes/mainMenu';
import scene001 from './scenes/scene001';
import scene002 from './scenes/scene002';
import plates from '../plates';
import timing from '../utils/timing';
import hud from '../hud';
import entities from '../entities/entities';
import soundEffects from '../audio/soundEffects';
import {
	shields,
	status,
	makeName,
	storePlayerProgress,
	readPlayerProgress,
	hasThePlayerMadeProgress,
	alertsAndWarnings,
} from '../utils/helpers';
import formations from '../behavior/formations';
import shots from '../shots';
import gameMenus from '../gameMenus';
import initialGameState from '../initialGameState';
import controlSchemes from '../controlSchemes';

const story = {
	handlers: {
		dispatch: null,
		state: null,
		stage: null,
		playVolume: null,
		playVolumeBoundaries: null,
		frameZero: null,
		hudShouldBeShowing: null,
		activeKeyboardLayout: null,
	}, // gets its values in App.js
	sceneList: [
		{
			id: 'intro',
			sceneObject: intro,
			hasTitlePlate: false,
			hasEntities: false,
			hasGameplay: false,
			showStatusBar: false,
		},
		{
			id: 'mainMenu',
			sceneObject: mainMenu,
			hasTitlePlate: false,
			hasEntities: false,
			hasGameplay: false,
			showStatusBar: false,
		},
		{
			id: '001',
			sceneObject: scene001,
			hasTitlePlate: true,
			hasEntities: true,
			hasGameplay: true,
			showStatusBar: true,
		},
		{
			id: '002',
			sceneObject: scene002,
			hasTitlePlate: true,
			hasEntities: true,
			hasGameplay: true,
			showStatusBar: true,
		},
	],
	currentScene: null,
	currentSceneBeat: null,
	missionFailureWasTriggered: false,
	noOfTimesHitEscMessageWasAppended: 0,
	escAddendum:
		'&nbsp;&nbsp;&nbsp;&lt;&nbsp;&nbsp;&nbsp;Hit [ESC] to see your current objectives',
	currentObjectives: {
		show: [],
		advanceWhen: [],
	},
	currentStoryEntities: {},
	noProgressYetMessage:
		"According to your browser's storage, you haven't made any progress in this game yet, please choose 'New game' instead!",

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

	advance(playScene = null, playSceneBeat = 0, hurryUp = false) {
		// call with playScene = null to auto-advance
		// to the next scene
		if (c.debug.sequentialEvents)
			console.log('advance()', playScene, playSceneBeat);
		const currentState = story.handlers.state();

		let cleanUpNeeded = false;

		const playerId =
			c.playerIdPartial + currentState.game.playerShips.currentIdSuffix;
		const playerShipType = currentState.game.playerShips.current;

		if (story.currentScene === null) {
			story.currentScene = story.sceneList[0].id;
		} else {
			if (playSceneBeat === 0) cleanUpNeeded = true;
			if (playScene !== null) {
				story.currentScene = playScene;
			} else {
				let index = story.sceneList.findIndex(
					(el) => el.id === story.currentScene
				);
				index++;
				if (story.sceneList[index] !== undefined) {
					// more scenes exist
					story.currentScene = story.sceneList[index].id;
				} else {
					// no more scenes, end of the game
					if (c.debug.sequentialEvents)
						console.log('THIS IS THE END OF THE GAME');
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

					plates.fadeOutPlate(25, 7000);
					timing.setTimeout(
						() => {
							story.advance('mainMenu', 0);
						},
						timing.modes.play,
						8200
					);

					return;
				}
			}
		}

		if (c.debug.sequentialEvents)
			console.log('story.currentScene:', story.currentScene);

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
			story.missionFailureWasTriggered = false;

			if (currentSceneListObject.id !== 'mainMenu') {
				const localStoragePlayerProgress = readPlayerProgress();
				if (currentSceneListObject.id === 'intro') {
					if (localStoragePlayerProgress === null) {
						// this player is a first time visitor
						if (c.debug.localStorage)
							console.log(
								'no localStorage string found, populating with the defaults from initialGameState.js'
							);
						storePlayerProgress(
							story.handlers.state,
							currentSceneListObject.id
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
					const playersBestSceneId = localStoragePlayerProgress.bestSceneId;
					const playersBestSceneIndex = story.sceneList.findIndex(
						(sc) => sc.id === playersBestSceneId
					);
					const currentSceneIndex = story.sceneList.findIndex(
						(sc2) => sc2.id === currentSceneListObject.id
					);

					let writeBestSceneId = playersBestSceneId;
					if (currentSceneIndex > playersBestSceneIndex)
						writeBestSceneId = currentSceneListObject.id;

					storePlayerProgress(story.handlers.state, writeBestSceneId);
				}
			}
		}

		let currentStateScene = currentState.game.currentScene;
		if (currentStateScene !== story.currentScene) {
			story.handlers.dispatch({
				type: c.actions.SET_CURRENT_SCENE,
				newCurrentScene: story.currentScene,
			});
		}

		story.currentSceneBeat = playSceneBeat;

		if (c.debug.sequentialEvents)
			console.log('story.currentSceneBeat:', story.currentSceneBeat);

		const currentSceneBeatObj =
			currentSceneObject.storyBeats[story.currentSceneBeat];

		if (c.debug.sequentialEvents) console.log(currentSceneObject);

		if (cleanUpNeeded) {
			story.cleanUp();
		}

		if (currentSceneListObject.hasTitlePlate && playSceneBeat === 0) {
			currentSceneObject.handlers.checkBeatCompletion =
				story.checkBeatCompletion;
			status.add(
				'aqua',
				`---&nbsp;&nbsp;&nbsp;${currentSceneObject.titlePlate.mainText}&nbsp;&nbsp;&nbsp;---`,
				timing.times.play
			);
			plates.fullMatte();
			plates.loadPlate(
				'mission_title',
				-1,
				currentSceneObject.titlePlate.mainText,
				currentSceneObject.titlePlate.wittyText
			);
			timing.toggleEntityMovement(false, 'story.js@advance() 3');
			soundEffects.muteUnmuteAllLoops('story.js@advance() 4', true);
			plates.fadeInPlate(25);
			plates.fadeOutMatte(50, 4000);
			timing.toggleEntityMovement(true, 'story.js@advance() 5', 4000);
			timing.setTimeout(
				() => {
					soundEffects.muteUnmuteAllLoops('story.js@advance() 6', false);
				},
				timing.modes.play,
				4000
			);
			plates.fadeOutPlate(25, 6000);
		}

		if (!currentSceneListObject.hasEntities) {
			timing.toggleEntityMovement(false, 'story.js@advance() 7');
		}

		if (currentSceneListObject.showStatusBar) {
			document.getElementById('game__status').style.display = 'flex';
		} else {
			document.getElementById('game__status').style.display = 'none';
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
		gameMenus.clearButtons();
		alertsAndWarnings.clear();
		alertsAndWarnings.hide();
		plates.clearAll();
		timing.clearAllScheduledEvents();
		status.add('aqua', 'Mission restarted...', timing.times.play);
		story.handlers.dispatch({ type: c.actions.RESTART_MISSION });
		story.advance(story.currentScene, 0);
		story.handlers.frameZero.actual = true;
	},

	mainMenu(askForConfirmation = true, hurryUp = false) {
		function mainMenuProper() {
			alertsAndWarnings.clear();
			alertsAndWarnings.hide();
			plates.clearAll();
			timing.clearAllScheduledEvents();
			if (timing.isPaused()) window.pixiapp.togglePause('dontFadeMatte');
			gameMenus.clearButtons();
			story.advance('mainMenu', 0, hurryUp);
		}

		if (askForConfirmation) {
			if (
				confirm(
					'Returning to the main menu will reset your progress on the current mission. Continue anyway?'
				)
			) {
				mainMenuProper();
			}
		} else {
			mainMenuProper();
		}
	},

	replayScene() {
		const localStoragePlayerProgress = readPlayerProgress();

		let goAhead = false;

		if (localStoragePlayerProgress === null) {
			goAhead = true;
		} else {
			if (!hasThePlayerMadeProgress(localStoragePlayerProgress)) {
				alert(story.noProgressYetMessage);
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

	replaySceneActual(sceneId, sceneIndex) {
		const localStoragePlayerProgress = readPlayerProgress();
		if (c.debug.sequentialEvents)
			console.log('story.js@replaySceneActual', sceneId, sceneIndex);

		let goAhead = false;
		if (localStoragePlayerProgress === null) {
			goAhead = true;
		} else {
			const bestSceneId = localStoragePlayerProgress.bestSceneId;
			const bestSceneIndex = story.sceneList.findIndex(
				(sc) => sc.id === bestSceneId
			);

			if (bestSceneIndex < sceneIndex) {
				alert("I'm sorry, you haven't unlocked that scene yet.");
			} else {
				goAhead = true;
			}
		}

		if (c.debug.sequentialEvents) console.log({ goAhead });

		if (goAhead) {
			gameMenus.clearButtons();
			story.advance(sceneId, 0);
		}
	},

	newGame() {
		const localStoragePlayerProgress = readPlayerProgress();

		function newGameProper() {
			gameMenus.clearButtons();
			story.removeMainMenuTopPortion();
			story.advance();
		}

		if (!hasThePlayerMadeProgress(localStoragePlayerProgress)) {
			newGameProper();
		} else {
			if (
				confirm(
					'Starting a new game will revert your previous progress. Continue anyway?'
				)
			) {
				story.handlers.dispatch({
					type: c.actions.REVERT_PLAYER_PROGRESS_TO_DEFAULTS,
					defaultPlayerProgress: initialGameState.game.playerShips,
					callbackFn: newGameProper,
				});
			}
		}
	},

	continueGame() {
		const localStoragePlayerProgress = readPlayerProgress();

		if (!hasThePlayerMadeProgress(localStoragePlayerProgress)) {
			alert(story.noProgressYetMessage);
		} else {
			gameMenus.clearButtons();
			story.removeMainMenuTopPortion();
			story.advance(localStoragePlayerProgress.bestSceneId, 0);
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
		gameMenus.buttonFunctions.replayScene = story.replayScene;
		gameMenus.buttonFunctions.replaySceneActual = story.replaySceneActual;
	},

	updateCurrentObjectives(updates) {
		if (c.debug.objectives) console.log('updateCurrentObjectives()', updates);
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
		});

		if (updates.show.length > 0) {
			let escAddendum = '';
			if (story.noOfTimesHitEscMessageWasAppended < 4) {
				escAddendum = story.escAddendum;
				story.noOfTimesHitEscMessageWasAppended++;
			}
			status.add(
				'yellow',
				'Mission objectives updated.' + escAddendum,
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
		if (c.debug.objectives)
			console.log(
				'checkAgainstCurrentObjectives',
				entityId,
				eventId,
				wasPreviouslyInspected
			);

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

					if (remainingPercentage < el.objectiveObj.requiredPercentage) {
						failState = true;
						el.objectiveObj.failed = true;
						hasUpdated = true;
					}
				}
			} else {
				if (eventId === objectiveType) {
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
				let escAddendum = '';
				if (story.noOfTimesHitEscMessageWasAppended < 4) {
					escAddendum = story.escAddendum;
					story.noOfTimesHitEscMessageWasAppended++;
				}
				updatedObjectiveMessages.push({
					color: itemColor,
					message: 'Objectives: ' + objectiveText + escAddendum,
				});
			}
		});

		story.updateObjectiveDisplay();

		if (updatedObjectiveMessages.length < 1) {
			// this event didnt cause any progress with the objectives
			// so we'll print a yellow status message
			let printStatus = true;
			let statusColor = 'yellow';
			let statusMessage = `${entityClassification}[${makeName(entityId)}] ${
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
				status.add(statusColor, statusMessage, timing.times.play);
			}
		} else {
			updatedObjectiveMessages.forEach((el) => {
				let printThisStatus = true;

				if (eventId === c.objectiveTypes.hasDespawned.id && !failState) {
					printThisStatus = false;
				}

				if (printThisStatus) {
					status.add(el.color, el.message, timing.times.play);
				}
			});
		}

		story.checkBeatCompletion();

		if (failState && !story.missionFailureWasTriggered) {
			story.missionFailureWasTriggered = true;
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
				status.add(el.color, el.message, timing.times.play);
			});
		}

		// if all needed objectives are done, we can advance to the
		// next story beat
		let allComplete = true;
		story.currentObjectives.advanceWhen.forEach((obj) => {
			if (obj.currentPercentage < obj.requiredPercentage || obj.failed)
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
				story.advance(story.currentScene, story.currentSceneBeat + 1);
			} else {
				// advance to the next scene
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
						story.advance(null, 0);
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
		let itemColor = 'yellow';
		if (meansProgress) itemColor = 'dark_green';
		let objectiveText = '';
		let completed = false;

		if (
			objectiveObj.requiredPercentage <=
			Math.ceil(objectiveObj.currentPercentage)
		) {
			itemColor = 'green';
			completed = true;
		}

		if (objectiveObj.failed) itemColor = 'red';
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
};

export default story;
