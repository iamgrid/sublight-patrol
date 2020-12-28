import c from '../utils/constants';
// import sc from './storyConstants';
import scene001 from './scenes/scene001';
import plates from '../plates';
import timing from '../utils/timing';
import hud from '../hud';
import entities from '../entities/entities';
import soundEffects from '../audio/soundEffects';
import { shields, status, makeName } from '../utils/helpers';
import formations from '../behavior/formations';
import shots from '../shots';

const story = {
	handlers: { dispatch: null, state: null, stage: null }, // gets its values in App.js
	sceneList: [{ id: '001', sceneObject: scene001 }],
	playerShipId: 'red_1',
	playerShipSuffixes: ['a', 'b', 'c', 'd'],
	currentScene: null,
	currentSceneBeat: null,
	currentObjectives: {
		show: [],
		advanceWhen: [],
	},
	currentStoryEntities: {},

	assertType(entityId) {
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

	advance(nextScene = null, nextSceneBeat = 0) {
		console.log('advance()', nextScene, nextSceneBeat);
		const currentState = story.handlers.state();

		let cleanUpNeeded = false;

		let nextPlayerShip = currentState.game.playerShips.next;
		if (nextPlayerShip === null) nextPlayerShip = 0;
		const playerId =
			story.playerShipId + story.playerShipSuffixes[nextPlayerShip];
		const playerShipType =
			currentState.game.playerShips.orderedHangar[nextPlayerShip];

		if (story.currentScene === null) {
			story.currentScene = story.sceneList[0].id;
		} else {
			if (nextSceneBeat === 0) cleanUpNeeded = true;
			if (nextScene !== null) {
				story.currentScene = nextScene;
			} else {
				let oldIndex = story.sceneList.findIndex(
					(el) => el.id === story.currentScene
				);
				story.currentScene = story.sceneList[oldIndex + 1];
			}
		}

		const currentSceneObject = story.sceneList.find(
			(el) => el.id === story.currentScene
		).sceneObject;

		if (nextSceneBeat === 0)
			story.currentStoryEntities = currentSceneObject.entities;

		let currentStateScene = currentState.game.currentScene;
		if (currentStateScene !== story.currentScene) {
			story.handlers.dispatch({
				type: c.actions.SET_CURRENT_SCENE,
				newCurrentScene: story.currentScene,
			});
		}

		story.currentSceneBeat = nextSceneBeat;

		const currentSceneBeatObj =
			currentSceneObject.storyBeats[story.currentSceneBeat];

		console.log(
			'currentScene:',
			story.currentScene,
			currentSceneObject,
			'currentSceneBeat:',
			story.currentSceneBeat
		);

		if (cleanUpNeeded) {
			story.cleanUp();
		}

		plates.fullMatte();

		//register new objectives
		const objectiveUpdates = currentSceneBeatObj.registerObjectives();
		story.updateCurrentObjectives(objectiveUpdates);

		// scene object execution
		currentSceneBeatObj.execute(playerId, playerShipType);

		if (currentSceneBeatObj.cameraMode === c.cameraModes.gameplay) {
			// toggle HUD
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
					hud.toggle(true);
				},
				timing.modes.play,
				2000
			);
		} else {
			hud.toggle(false);
		}

		plates.fadeOutMatte(50);
	},

	updateCurrentObjectives(updates) {
		console.log('updateCurrentObjectives()', updates);
		story.currentObjectives.show = [
			...story.currentObjectives.show,
			...updates.show,
		];
		story.currentObjectives.show.forEach((sitem) => {
			sitem.currentPercentage = 0;
			sitem.failed = false;
		});
		story.currentObjectives.advanceWhen = updates.advanceWhen;
		story.currentObjectives.advanceWhen.forEach((awitem) => {
			awitem.currentPercentage = 0;
			awitem.failed = false;
		});

		story.updateObjectiveDisplay();
	},

	checkAgainstCurrentObjectives(entityId, eventId) {
		console.log('checkAgainstCurrentObjectives', entityId, eventId);
		let missionFailed = false;
		let meansProgress = false;

		let entityGroup = null;
		let entitiesInGroup = 0;
		const currentStoryEntity = story.currentStoryEntities[entityId];
		if (currentStoryEntity !== undefined) {
			if (currentStoryEntity.groupId !== undefined) {
				entityGroup = currentStoryEntity.groupId;
				// entitiesInGroup = story.currentStoryEntities.reduce((acc, el) => {
				// 	if (el.groupId === entityGroup) return acc + 1;
				// }, 0);
				for (const storyEntityId in story.currentStoryEntities) {
					if (story.currentStoryEntities[storyEntityId].groupId === entityGroup)
						entitiesInGroup++;
				}
			}
		}

		// checking against showing objectives
		story.currentObjectives.show.forEach((obj) => {
			if (obj.currentPercentage !== obj.requiredPercentage) {
				if (obj.groupId === undefined) {
					if (entityId === obj.entityId) {
						if (eventId === obj.type) {
							obj.currentPercentage = 100;
							meansProgress = true;
						} else {
							// check if this event fails this objective
							if (
								c.objectiveTypes[obj.type].meansFailureIfObjectiveWas.includes(
									eventId
								)
							) {
								obj.failed = true;
								missionFailed = true;
							}
						}
					}
				} else {
					if (entityGroup === null) return;
					if (entityGroup === obj.groupId) {
						if (eventId === obj.type) {
							obj.currentPercentage += (1 / entitiesInGroup) * 100;
							meansProgress = true;
						} else {
							// check if this event fails this objective
							if (
								c.objectiveTypes[obj.type].meansFailureIfObjectiveWas.includes(
									eventId
								)
							) {
								obj.failed = true;
								missionFailed = true;
							}
						}
					}
				}
			}
		});

		story.updateObjectiveDisplay();

		// checking against 'advanceWhen' objectives
		let allComplete = true;

		story.currentObjectives.advanceWhen.forEach((obj) => {
			if (obj.currentPercentage !== obj.requiredPercentage) {
				if (obj.groupId === undefined) {
					if (entityId === obj.entityId) {
						if (eventId === obj.type) {
							obj.currentPercentage = 100;
							// meansProgress = true;
						} else {
							allComplete = false;
							// check if this event fails this objective
							if (
								c.objectiveTypes[obj.type].meansFailureIfObjectiveWas.includes(
									eventId
								)
							) {
								obj.failed = true;
								missionFailed = true;
							}
						}
					} else {
						allComplete = false;
					}
				} else {
					if (entityGroup === null) return;
					if (entityGroup === obj.groupId) {
						if (eventId === obj.type) {
							obj.currentPercentage += (1 / entitiesInGroup) * 100;
							// meansProgress = true;
							if (obj.currentPercentage < obj.requiredPercentage)
								allComplete = false;
						} else {
							allComplete = false;
							// check if this event fails this objective
							if (
								c.objectiveTypes[obj.type].meansFailureIfObjectiveWas.includes(
									eventId
								)
							) {
								obj.failed = true;
								missionFailed = true;
							}
						}
					} else {
						allComplete = false;
					}
				}
			}
		});

		let printStatus = true;
		let statusColor = 'yellow';
		if (meansProgress) statusColor = 'green';
		if (missionFailed) statusColor = 'red';

		if (eventId === c.objectiveTypes.inspected.id && !meansProgress) {
			printStatus = false;
		}

		let entityType = story.assertType(entityId);

		if (printStatus) {
			status.add(
				statusColor,
				`${entityType}[${makeName(entityId)}] ${
					c.objectiveTypes[eventId].completed_desc
				}`,
				timing.times.play
			);
		}

		if (allComplete) {
			console.log(
				'ALLCOMPLETE IS TRUE, ADVANCE TO THE NEXT STORY BEAT!',
				entityId,
				eventId,
				story.currentObjectives
			);
		}

		if (missionFailed) {
			console.log('MISSION FAILED!', story.currentObjectives);
		}
	},

	updateObjectiveDisplay() {
		console.log('updateObjectiveDisplay() called');
		const re = [];
		re.push(
			"<div class='game__pause-objectives-title'>Current objectives:</div>\n<ul class='game__pause-objectives-list'>"
		);

		const objectiveLis = story.currentObjectives.show.map((obj) => {
			let completed = false;
			let itemColor = 'yellow';
			if (obj.requiredPercentage <= Math.ceil(obj.currentPercentage)) {
				itemColor = 'green';
				completed = true;
			}
			if (obj.failed) itemColor = 'red';
			let objectiveText;
			if (obj.groupId === undefined) {
				let entityType = story.assertType(obj.entityId);
				objectiveText = `${entityType}${makeName(obj.entityId)} ${
					completed
						? c.objectiveTypes[obj.type].completed_desc
						: c.objectiveTypes[obj.type].desc
				} (${completed ? 'completed' : 'incomplete'})`;
			} else {
				let groupType = '';
				let firstInGroup = Object.values(story.currentStoryEntities).find(
					(en) => en.groupId === obj.groupId
				);
				if (firstInGroup !== undefined)
					groupType = story.assertType(firstInGroup.id);
				if (groupType !== '') groupType = groupType.toLowerCase();
				if (story.assertType)
					objectiveText = `${obj.requiredPercentage}% of ${groupType}group ${
						obj.groupId
					} ${
						completed
							? c.objectiveTypes[obj.type].completed_desc
							: c.objectiveTypes[obj.type].desc
					} (${
						completed ? '' : Math.ceil(obj.currentPercentage) + '% '
					}complete)`;
			}

			return `<li class='game__pause-objective game__pause-objective--${itemColor}'>${objectiveText}</li>`;
		});

		re.push(objectiveLis.join(''));

		re.push('</ul>');
		document.getElementById('game__pause-objectives').innerHTML = re.join('');
	},

	cleanUp() {
		console.log('story.cleanUp() called');

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
