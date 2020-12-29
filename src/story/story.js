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

		let entityType = story.assertType(entityId);

		let entityInvolvedIn = [];

		// look through all incomplete objectives in both stores
		// to see if the entity is involved
		for (const objectiveStore in story.currentObjectives) {
			story.currentObjectives[objectiveStore].forEach((obj) => {
				if (obj.currentPercentage !== obj.requiredPercentage) {
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
			if (c.objectiveTypes[objectiveType].failsIfEventIs.includes(eventId)) {
				// the entity should have been inspected/disabled, it was forced to flee or destroyed instead
				failState = true;
				el.objectiveObj.failed = true;
				hasUpdated = true;
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
					el.objectiveObj
				);
				updatedObjectiveMessages.push({
					color: itemColor,
					message: 'Objectives: ' + objectiveText,
				});
			}
		});

		story.updateObjectiveDisplay();

		// if all 'advanceWhen' objectives are done, we can advance to the
		// next story beat
		let allComplete = true;
		story.currentObjectives.advanceWhen.forEach((obj) => {
			if (obj.currentPercentage < obj.requiredPercentage) allComplete = false;
		});

		if (updatedObjectiveMessages.length < 1) {
			let printStatus = true;
			let statusColor = 'yellow';
			let statusMessage = `${entityType}[${makeName(entityId)}] ${
				c.objectiveTypes[eventId].completed_desc
			}`;

			if (eventId === c.objectiveTypes.inspected.id && !meansProgress) {
				printStatus = false;
			}

			if (printStatus) {
				status.add(statusColor, statusMessage, timing.times.play);
			}
		} else {
			updatedObjectiveMessages.forEach((el) => {
				status.add(el.color, el.message, timing.times.play);
			});
		}

		if (allComplete) {
			console.log(
				'ALLCOMPLETE IS TRUE, ADVANCE TO THE NEXT STORY BEAT!',
				entityId,
				eventId,
				story.currentObjectives
			);
		}

		if (failState) {
			console.log('MISSION FAILED!', story.currentObjectives);
		}
	},

	entityWasDespawned(entityId) {
		console.log('entityWasDespawned:', entityId);
		if (story.currentStoryEntities[entityId] === undefined) return;
		story.currentStoryEntities[entityId].wasDespawned = true;

		// see if this makes an objective fail / impossible to complete
	},

	updateObjectiveDisplay() {
		console.log('updateObjectiveDisplay() called');
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

	returnObjectiveText(objectiveObj) {
		let itemColor = 'yellow';
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
			let entityType = story.assertType(objectiveObj.entityId);
			let parensText = 'incomplete';
			if (completed) parensText = 'completed';
			if (objectiveObj.failed) parensText = 'failed';
			objectiveText = `${entityType}${makeName(objectiveObj.entityId)} ${
				completed
					? c.objectiveTypes[objectiveObj.type].completed_desc
					: c.objectiveTypes[objectiveObj.type].desc
			} (${parensText})`;
		} else {
			let groupType = '';
			let firstInGroup = Object.values(story.currentStoryEntities).find(
				(en) => en.groupId === objectiveObj.groupId
			);
			if (firstInGroup !== undefined)
				groupType = story.assertType(firstInGroup.id);
			if (groupType !== '') groupType = groupType.toLowerCase();
			if (story.assertType) {
				let parensText = completed
					? ''
					: Math.ceil(objectiveObj.currentPercentage) + '% ';
				parensText = parensText + 'complete';
				if (objectiveObj.failed) parensText = 'failed';
				objectiveText = `${
					objectiveObj.requiredPercentage
				}% of ${groupType}group ${objectiveObj.groupId} ${
					completed
						? c.objectiveTypes[objectiveObj.type].completed_desc
						: c.objectiveTypes[objectiveObj.type].desc
				} (${parensText})`;
			}
		}

		return [itemColor, objectiveText];
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
