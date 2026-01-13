import c from '../utils/constants';
import { randomNumber } from '../utils/formulas';
import idCreator from '../utils/idCreator';
import pieces from './pieces';
import models from './models';
import {
	getPosition,
	shields,
	makeName,
	gameLog,
	showContinueDialog,
} from '../utils/helpers';
import soundEffects from '../audio/soundEffects';
import formations from '../behavior/formations';
import timing from '../utils/timing';
import plates from '../plates';
import hud from '../hud';
import shots from '../shots';
import emp from '../emp';
import gameMenus from '../gameMenus';
import controlSchemes from '../controlSchemes';

const entities = {
	handlers: {
		dispatch: null,
		state: null,
		stage: null,
		pixiHUD: null,
		transitionsInProgress: null,
		entityWasDespawned: null,
		resetCameraAndMoveToPlayerXY: null,
	}, // gets its values in App.js
	types: {},
	stageEntities: {},
	backgroundEntityZIndexIterator: c.zIndices.background,
	foregroundEntityZIndexIterator: c.zIndices.foreground,

	init() {
		const functionSignature = 'entities.js@init()';
		this.assembleType(['container']);
		this.assembleType(['buoy']);
		this.assembleType(['fuel_depot']);
		this.assembleType(['shuttle', 'ship']);
		this.assembleType(['freighter_l1', 'ship']);
		this.assembleType(['freighter_l2', 'freighter_l1', 'ship']);
		this.assembleType([
			'freighter_l2a',
			'freighter_l2',
			'freighter_l1',
			'ship',
		]);
		this.assembleType(['freighter_l3', 'freighter_l1', 'ship']);
		this.assembleType(['zangari_shuttle', 'shuttle', 'ship']);
		this.assembleType(['fenrir', 'ship']);
		this.assembleType(['fenrir_dominator', 'fenrir', 'ship']);
		this.assembleType(['valkyrie', 'ship']);
		this.assembleType(['zangari_fighter_type_1', 'ship']);
		this.assembleType(['zangari_fighter_type_2', 'ship']);
		this.assembleType(['zangari_fighter_type_3', 'ship']);
		this.assembleType(['zangari_fighter_type_4', 'ship']);
		this.assembleType([
			'zangari_fighter_type_4a',
			'zangari_fighter_type_4',
			'ship',
		]);
		this.assembleType([
			'zangari_fighter_type_4b',
			'zangari_fighter_type_4',
			'ship',
		]);

		console.log(functionSignature, 'Entity types initialized:', this.types);
	},

	assembleType(fromPiecesReversed) {
		const fromPieces = fromPiecesReversed.reverse();
		let re = {
			immutable: { ...pieces.entity.immutable },
			mutable: { ...pieces.entity.mutable },
		};
		const entityTypeName = fromPieces[fromPieces.length - 1];
		re.immutable.entityType = makeName(entityTypeName);

		const hasMaxValue = [];

		fromPieces.forEach((piece) => {
			const currentPiece = pieces[piece];

			// composing entity with the required hasXY objects mentioned in this piece
			let doAppend = [];
			for (let prop in currentPiece.immutable) {
				if (prop.substr(0, 3) === 'has' && currentPiece.immutable[prop])
					doAppend.push(prop);
				if (prop.substr(0, 3) === 'max') hasMaxValue.push(prop);
			}

			doAppend.forEach((piece) => {
				const pieceToAppend = pieces[piece];

				Object.assign(re.immutable, pieceToAppend.immutable);
				Object.assign(re.mutable, pieceToAppend.mutable);
			});

			// composing entity with the current piece
			Object.assign(re.immutable, currentPiece.immutable);
			Object.assign(re.mutable, currentPiece.mutable);
		});

		let easyRe = {};
		let normalRe = {};

		let hasEasyVariant = false;

		if (pieces[entityTypeName + '__EASY'] instanceof Object) {
			hasEasyVariant = true;
			// console.log(
			// 	`Found EASY difficulty adjustments for entity type [${entityTypeName}]`
			// );
			const easyPiece = pieces[entityTypeName + '__EASY'];
			easyRe = {
				immutable: { ...re.immutable },
				mutable: { ...re.mutable },
			};
			Object.assign(easyRe.immutable, easyPiece.immutable);
			Object.assign(easyRe.mutable, easyPiece.mutable);
		}

		let hasNormalVariant = false;

		if (pieces[entityTypeName + '__NORMAL'] instanceof Object) {
			hasNormalVariant = true;
			// console.log(
			// 	`Found NORMAL difficulty adjustments for entity type [${entityTypeName}]`
			// );
			const normalPiece = pieces[entityTypeName + '__NORMAL'];
			normalRe = {
				immutable: { ...re.immutable },
				mutable: { ...re.mutable },
			};
			Object.assign(normalRe.immutable, normalPiece.immutable);
			Object.assign(normalRe.mutable, normalPiece.mutable);
		}

		// setting mutables to maximum where available
		hasMaxValue.forEach((el) => {
			const actualName = el.substr(3, 1).toLowerCase() + el.substr(4);
			if (re.mutable[actualName] !== 'undefined') {
				re.mutable[actualName] = re.immutable[el];
				if (hasEasyVariant) {
					easyRe.mutable[actualName] = easyRe.immutable[el];
				}
				if (hasNormalVariant) {
					normalRe.mutable[actualName] = normalRe.immutable[el];
				}
			}
		});

		re.immutable.colors = c.groups[re.immutable.colors];
		if (hasEasyVariant) {
			easyRe.immutable.colors = c.groups[easyRe.immutable.colors];
		}
		if (hasNormalVariant) {
			normalRe.immutable.colors = c.groups[normalRe.immutable.colors];
		}

		// emitting warning about immutables with a null value
		this.checkForNullValues(`Entity types - ${entityTypeName}`, re.immutable);

		// locking in object keys and values
		Object.freeze(re.immutable);
		Object.freeze(re.mutable);
		if (hasEasyVariant) {
			Object.freeze(easyRe.immutable);
			Object.freeze(easyRe.mutable);
		}
		if (hasNormalVariant) {
			Object.freeze(normalRe.immutable);
			Object.freeze(normalRe.mutable);
		}

		this.types[entityTypeName] = re;
		if (hasEasyVariant) {
			this.types[entityTypeName + '__EASY'] = easyRe;
		}
		if (hasNormalVariant) {
			this.types[entityTypeName + '__NORMAL'] = normalRe;
		}
	},

	checkForNullValues(identifier, object) {
		let nullWarnings = [];
		for (let prop in object) {
			if (object[prop] === null) nullWarnings.push(prop);
		}
		if (nullWarnings.length > 0)
			console.warn(
				`[${identifier}] The following properties have a null value: ${nullWarnings.join(
					', '
				)}`
			);
	},

	spawn(typeOrEntityObject, pos, incomingProps = {}, storeIn = 'targetable') {
		const functionSignature = 'entities.js@spawn()';
		console.log(
			functionSignature,
			typeOrEntityObject,
			pos,
			incomingProps,
			storeIn
		);

		if (typeOrEntityObject === undefined || pos === undefined) {
			console.error(
				functionSignature,
				'typeOrEntityObject and pos must not be undefined!',
				{
					typeOrEntityObject,
					pos,
					incomingProps,
					storeIn,
				}
			);
			return null;
		}

		let type, props;
		if (typeof typeOrEntityObject === 'object') {
			type = typeOrEntityObject.type;
			props = { ...typeOrEntityObject, ...incomingProps };
		} else {
			type = typeOrEntityObject;
			props = incomingProps;
			props.type = type;
		}
		if (!this.types[type]) {
			console.error(functionSignature, `Unable to find type [${type}].`, {
				typeOrEntityObject,
				pos,
				incomingProps,
				storeIn,
			});
			return null;
		}

		let entityTypeObj = this.types[type];

		// game difficulty adjustments
		if (storeIn !== 'player') {
			const currentState = entities.handlers.state();

			if (currentState.game.gameDifficulty !== c.gameDifficulty.HARD) {
				const entityTypeNameWDifficulty = `${type}__${currentState.game.gameDifficulty}`;
				console.log(
					functionSignature,
					'looking for entity difficulty variant in "types":',
					entityTypeNameWDifficulty
				);

				if (pieces[entityTypeNameWDifficulty] instanceof Object) {
					console.log(
						functionSignature,
						'difficulty variant object located',
						entityTypeNameWDifficulty
					);
					entityTypeObj = this.types[entityTypeNameWDifficulty];
				}
			}
		}

		// entity object creation
		const newEntity = { ...entityTypeObj.mutable, ...props };

		// facing
		let facing = 1;
		if (pos.facing !== undefined) facing = pos.facing;
		newEntity.facing = facing;

		// adding prototype
		newEntity.__proto__ = entityTypeObj;

		// assigning entity store
		let doStoreIn = storeIn;
		if (!newEntity.immutable.isTargetable) doStoreIn = 'other';

		newEntity.store = doStoreIn;

		// assigning entity id, creating display name
		if (newEntity.id !== null) {
			newEntity.displayId = makeName(newEntity.id);
		} else {
			newEntity.id = idCreator.create();
			newEntity.displayId = '-';
		}

		// emp-related stuff
		if (newEntity.isDisabled) {
			newEntity.systemStrength = 0;
			newEntity.shieldStrength = 0;
			newEntity.isDamaged = true;
		}
		if (newEntity.store === 'player') {
			emp.playerHasEMP = newEntity.immutable.hasEMP;
		}

		// behavior logic
		newEntity.assignedPlayerRelation = props.playerRelation;
		if (newEntity.immutable.hasBehavior) {
			newEntity.behaviorCurrentGoal = newEntity.behaviorAssignedGoal;
			if (newEntity.behaviorAssignedGoal === c.possibleGoals.maintainVelocity) {
				newEntity.behaviorAssignedDirection = facing;
				newEntity.behaviorAssignedLongVelocity = pos.longVelocity;
			}
			if (
				newEntity.behaviorAssignedGoal === c.possibleGoals.holdStation &&
				props.behaviorAssignedStationX === undefined
			) {
				newEntity.behaviorAssignedStationX = pos.posX;
				newEntity.behaviorAssignedStationY = pos.posY;
			}
			newEntity.behaviorHitsSuffered = 0;
			newEntity.behaviorLastHitOrigin = '';
			newEntity.behaviorPreferredAttackDistance = randomNumber(300, 600);
		}

		// null value warnings
		this.checkForNullValues(`${newEntity.id} (type ${type})`, newEntity);

		// position store
		let positionStore = 'canMove';
		if (!newEntity.immutable.canMove) positionStore = 'cantMove';
		if (positionStore === 'canMove') {
			if (pos.latVelocity === undefined) pos.latVelocity = 0;
			if (pos.longVelocity === undefined) pos.longVelocity = 0;
		}
		let positionArray = [pos.posX, pos.posY, pos.latVelocity, pos.longVelocity];

		// model availability
		if (!models[newEntity.immutable.model]) {
			console.error(
				functionSignature,
				`Unable to find model for [${type}]. (Have you updated /entities/models.js?)`
			);
			return null;
		}

		// initial props for the stage entity
		let stageEntityProps = {
			entityId: newEntity.id,
			entityStore: doStoreIn,
			facing: facing,
			isDisabled: newEntity.isDisabled,
			hasEMP: newEntity.immutable.hasEMP,
		};
		if (type === 'buoy') {
			stageEntityProps.coordX = pos.posX;
			stageEntityProps.coordY = pos.posY;
		}

		if (newEntity.immutable.thrusters !== undefined) {
			stageEntityProps.latVelocity = pos.latVelocity;
			stageEntityProps.longVelocity = pos.longVelocity;
		}

		// adding entity to stage
		const stageEntity = Reflect.construct(models[newEntity.immutable.model], [
			stageEntityProps,
		]);

		entities.handlers.stage.addChild(stageEntity);

		if (newEntity.immutable.isTargetable)
			stageEntity.reticuleRelation(newEntity.playerRelation);

		if (Number.isInteger(pos.posX) && Number.isInteger(pos.posY)) {
			stageEntity.position.set(pos.posX, pos.posY);
		} else {
			console.error(
				functionSignature,
				'function was called with a weird pos object:',
				pos
			);
		}

		if (doStoreIn === 'player') {
			stageEntity.zIndex = c.zIndices.playerCraft;
			// console.log(
			// 	functionSignature,
			// 	'Player detected, spawning with zIndex:',
			// 	c.zIndices.playerCraft
			// );
		} else {
			if (!newEntity.immutable.isBackgroundEntity) {
				stageEntity.zIndex = this.foregroundEntityZIndexIterator;
				// console.log(
				// 	functionSignature,
				// 	'Not a background entity, spawning with zIndex:',
				// 	this.foregroundEntityZIndexIterator
				// );
				this.foregroundEntityZIndexIterator++;
			} else {
				stageEntity.zIndex = this.backgroundEntityZIndexIterator;
				// console.log(
				// 	functionSignature,
				// 	'Background entity detected, spawning with zIndex:',
				// 	this.backgroundEntityZIndexIterator
				// );
				this.backgroundEntityZIndexIterator++;
			}
		}

		this.stageEntities[newEntity.id] = stageEntity;

		console.log(functionSignature, { positionStore, positionArray });

		// adding entity to state
		entities.handlers.dispatch({
			type: c.actions.ADD_ENTITY,
			storeIn: doStoreIn,
			newEntity: newEntity,
			positionStore: positionStore,
			positionArray: positionArray,
			callbackFn: () => {
				entities.shieldCallback(newEntity.immutable.hasShields, newEntity.id);
			},
		});

		// new craft alert
		if (doStoreIn !== 'player' && positionStore === 'canMove') {
			let updateColor = gameLog.ENTRY_COLORS.green;
			if (newEntity.playerRelation === 'neutral') {
				updateColor = gameLog.ENTRY_COLORS.yellow;
			} else if (newEntity.playerRelation === 'hostile') {
				updateColor = gameLog.ENTRY_COLORS.red;
			}

			gameLog.add(
				updateColor,
				`New craft alert: ${makeName(type)} at [${pos.posX}, ${pos.posY}]`,
				timing.times.play
			);
		}
	},

	shieldCallback(hasShields, entityId) {
		if (hasShields) {
			shields.addEntity(entityId);
		}
	},

	despawn(entityId, entityStore = null, removeFromState = true) {
		if (entities.stageEntities[entityId] === undefined) return;
		let currentState = entities.handlers.state();

		if (entityId !== currentState.entities.player.id) {
			if (!entities.stageEntities[entityId].despawnTriggered) {
				entities.stageEntities[entityId].despawnTriggered = true;
			}
		} else {
			// console.log('We are not despawning the player for the time being.');
			return;
		}

		shields.removeEntity(entityId);
		const partOfFormationId = formations.isInFormation(entityId);
		if (partOfFormationId) {
			formations.removeEntityFromFormation(partOfFormationId, entityId);
		}
		soundEffects.removeAllSoundInstancesForEntity(entityId);

		console.info(`removing ${entityId} from stage`);
		const stageEntity = entities.stageEntities[entityId];
		if (entityStore === null) {
			entityStore = entities.stageEntities[entityId].entityStore;
		}
		entities.handlers.stage.removeChild(stageEntity);
		stageEntity.destroy();
		delete entities.stageEntities[entityId];

		hud.removeEntity(entityId);

		if (removeFromState) {
			// blown up entities dont execute this part,
			// but entities that leave the playable volume do
			console.info(`removing ${entityId} from state`);
			entities.handlers.dispatch({
				type: c.actions.REMOVE_ENTITY,
				id: entityId,
				store: entityStore,
				callbackFn: entities.playerShipDestruction,
			});

			if (typeof entities.handlers.entityWasDespawned === 'function') {
				entities.handlers.entityWasDespawned(entityId);
			}
		}
	},

	playerShipDestruction() {
		const functionSignature = 'entities.js@playerShipDestruction()';
		console.log(functionSignature);

		if (
			entities.handlers.transitionsInProgress.functions.getIsATransitionAlreadyInProgress()
		) {
			console.warn(
				functionSignature,
				'Another tracked transition is already in progress, returning early...'
			);
			return;
		}

		// when playerShipDestruction runs, the mainReducer REMOVE_ENTITY action has already
		// taken care of updating the players hangar and assigning the next fighter to the player
		// if one was available

		let currentState = entities.handlers.state();
		const shipsInHangar = currentState.game.playerShips.hangarContents.length;

		const nextShip = currentState.game.playerShips.current;
		const nextSuffix = currentState.game.playerShips.currentIdSuffix;

		if (shipsInHangar < 1 && nextShip === null) {
			console.log(functionSignature, '%c Game over', 'color: red');

			entities.handlers.transitionsInProgress.functions.registerTransition(
				c.TRACKED_TRANSITION_TYPES.playerShipDestroyedGameOver
			);

			plates.fadeInMatte(25, 0);
			timing.toggleEntityMovement(false, `${functionSignature} 1`, 1000);
			timing.setTimeout(
				() => {
					soundEffects.muteUnmuteAllLoops(`${functionSignature} 2`, true);
				},
				timing.modes.play,
				1000
			);
			plates.loadPlate('game_over');
			plates.fadeInPlate(25, 2000);
			plates.fadeOutPlate(25, 7000);
			timing.setTimeout(
				() => {
					gameMenus.showMissionFailedButtonSet();
				},
				timing.modes.play,
				8500
			);
		} else {
			console.log(
				functionSignature,
				'%c Spawn player with their next ship',
				'color: green'
			);

			entities.handlers.transitionsInProgress.functions.registerTransition(
				c.TRACKED_TRANSITION_TYPES.playerShipDestroyedRespawning
			);

			const newPlayerId = c.playerIdPartial + nextSuffix;
			const newPlayerShipType = nextShip;

			let newPlayerShipX = null;
			let newPlayerShipY = null;

			if (
				currentState.game.currentScenePlayerStartingPositionX !== null &&
				currentState.game.currentScenePlayerStartingPositionY !== null
			) {
				// if the current scene has a player starting position, use it
				newPlayerShipX = currentState.game.currentScenePlayerStartingPositionX;
				newPlayerShipY = currentState.game.currentScenePlayerStartingPositionY;

				console.log(
					functionSignature,
					'Using current scene starting position:',
					newPlayerShipX,
					newPlayerShipY
				);
			} else {
				const destroyedPlayerPosition = getPosition(
					'destroyed_player',
					currentState.positions
				);
				newPlayerShipX = destroyedPlayerPosition[0];
				newPlayerShipY = destroyedPlayerPosition[1];

				console.log(
					functionSignature,
					'Using destroyed player last position:',
					newPlayerShipX,
					newPlayerShipY
				);
			}

			plates.fadeInMatte(25, 0);
			timing.toggleEntityMovement(false, `${functionSignature} 3`, 1000);
			timing.setTimeout(
				() => {
					soundEffects.muteUnmuteAllLoops(`${functionSignature} 4`, true);
					if (nextShip === c.playableFighterTypeIds.fenrir_dominator) {
						showContinueDialog(
							'<p>Spacecraft in this game work similarly to EVE Online: pilots sit within a capsule that auto-ejects when a surrounding craft is destroyed, saving the pilot.</p><p>You can keep fighting, using <b>progressively stronger</b> fighter craft from your mobile hangar until it runs out of ships. (Usable craft in your mobile hangar are represented by <b>white</b> rockets on the top left of the game screen).</p><img class="mobile-hangar-diagram" alt="Mobile hangar diagram" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZQAAACbCAMAAAByOp3zAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxNkM0QjcwQjhGRjBGMDExODI2M0FFNUYyQzA2QTdBRiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozODE0MTI2MEYwOTMxMUYwQjNBMEI3MTZBOTAxQURDQSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozODE0MTI1RkYwOTMxMUYwQjNBMEI3MTZBOTAxQURDQSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFEQzRCNzBCOEZGMEYwMTE4MjYzQUU1RjJDMDZBN0FGIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjE2QzRCNzBCOEZGMEYwMTE4MjYzQUU1RjJDMDZBN0FGIi8+IDwvcmRmOkRlc2NyaXB0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"><p>Some of the replayability of Sublight Patrol comes from the fact that you can complete all missions in the game using three or fewer of your fighter craft if you play well enough. (The "Final Fighter" section of the plaque you earn on game completion will show how economical you were with your armament.)</p>',
							'green',
							() => {
								entities.playerShipDestruction2(
									nextShip,
									newPlayerId,
									newPlayerShipType,
									newPlayerShipX,
									newPlayerShipY
								);
							},
							controlSchemes
						);
					} else {
						entities.playerShipDestruction2(
							nextShip,
							newPlayerId,
							newPlayerShipType,
							newPlayerShipX,
							newPlayerShipY
						);
					}
				},
				timing.modes.play,
				1000
			);
			// plates.loadPlate('respawning', nextShip);
			// plates.fadeInPlate(25, 1500);
			// timing.setTrigger(
			// 	'spawn in player with a new ship',
			// 	() => {
			// 		const functionSignature =
			// 			'entities.js@playerShipDestruction()@setTrigger()';
			// 		entities.spawn(
			// 			newPlayerShipType,
			// 			{
			// 				posX: newPlayerShipX,
			// 				posY: newPlayerShipY,
			// 				latVelocity: 0,
			// 				longVelocity: 0,
			// 			},
			// 			{
			// 				playerRelation: 'self',
			// 				behaviorAssignedGoal: c.possibleGoals.playerDetermined,
			// 				id: newPlayerId,
			// 			},
			// 			'player'
			// 		);

			// 		// camera needs to be repositioned to the new player craft

			// 		// const cameraTL = getCameraTLBasedOnPlayerPosition(
			// 		// 	newPlayerShipX,
			// 		// 	newPlayerShipY,
			// 		// 	1
			// 		// );

			// 		// console.log(functionSignature, 'cameraTL:', cameraTL);

			// 		// entities.handlers.refocusCameraOnTL(
			// 		// 	cameraTL[0],
			// 		// 	cameraTL[1],
			// 		// 	0,
			// 		// 	false
			// 		// );

			// 		// entities.handlers.resetCameraCurrentShift();

			// 		entities.handlers.resetCameraAndMoveToPlayerXY(
			// 			newPlayerShipX,
			// 			newPlayerShipY,
			// 			functionSignature
			// 		);
			// 	},
			// 	timing.modes.play,
			// 	1100,
			// 	true
			// );

			// plates.fadeOutMatte(25, 5000);
			// timing.toggleEntityMovement(true, `${functionSignature} 5`, 4300);
			// timing.setTimeout(
			// 	() => {
			// 		soundEffects.muteUnmuteAllLoops(`${functionSignature} 6`, false);
			// 	},
			// 	timing.modes.play,
			// 	4300
			// );
			// timing.setTrigger(
			// 	'reinitiating stuff after player ship respawn',
			// 	() => {
			// 		shots.registerEntityCannons(newPlayerId);
			// 		hud.reInitPixiHUD(newPlayerId);

			// 		entities.handlers.transitionsInProgress.functions.transitionComplete(
			// 			c.TRACKED_TRANSITION_TYPES.playerShipDestroyedRespawning
			// 		);
			// 	},
			// 	timing.modes.play,
			// 	3000,
			// 	true
			// );
			// plates.fadeOutPlate(25, 7000);
		}
	},

	playerShipDestruction2(
		nextShip,
		newPlayerId,
		newPlayerShipType,
		newPlayerShipX,
		newPlayerShipY
	) {
		const functionSignature = 'entities.js@playerShipDestruction2()';
		console.log(functionSignature);

		plates.loadPlate('respawning', nextShip);
		plates.fadeInPlate(25, 1500);
		timing.setTrigger(
			'spawn in player with a new ship',
			() => {
				const functionSignature =
					'entities.js@playerShipDestruction()@setTrigger()';
				entities.spawn(
					newPlayerShipType,
					{
						posX: newPlayerShipX,
						posY: newPlayerShipY,
						latVelocity: 0,
						longVelocity: 0,
					},
					{
						playerRelation: 'self',
						behaviorAssignedGoal: c.possibleGoals.playerDetermined,
						id: newPlayerId,
					},
					'player'
				);

				// camera needs to be repositioned to the new player craft

				// const cameraTL = getCameraTLBasedOnPlayerPosition(
				// 	newPlayerShipX,
				// 	newPlayerShipY,
				// 	1
				// );

				// console.log(functionSignature, 'cameraTL:', cameraTL);

				// entities.handlers.refocusCameraOnTL(
				// 	cameraTL[0],
				// 	cameraTL[1],
				// 	0,
				// 	false
				// );

				// entities.handlers.resetCameraCurrentShift();

				entities.handlers.resetCameraAndMoveToPlayerXY(
					newPlayerShipX,
					newPlayerShipY,
					functionSignature
				);
			},
			timing.modes.play,
			1100,
			true
		);

		plates.fadeOutMatte(25, 5000);
		timing.toggleEntityMovement(true, `${functionSignature} 5`, 4300);
		timing.setTimeout(
			() => {
				soundEffects.muteUnmuteAllLoops(`${functionSignature} 6`, false);
			},
			timing.modes.play,
			4300
		);
		timing.setTrigger(
			'reinitiating stuff after player ship respawn',
			() => {
				shots.registerEntityCannons(newPlayerId);
				hud.reInitPixiHUD(newPlayerId);

				entities.handlers.transitionsInProgress.functions.transitionComplete(
					c.TRACKED_TRANSITION_TYPES.playerShipDestroyedRespawning
				);
			},
			timing.modes.play,
			3000,
			true
		);
		plates.fadeOutPlate(25, 7000);
	},

	cleanUp() {
		for (const entityId in entities.stageEntities) {
			const stageEntity = entities.stageEntities[entityId];
			entities.handlers.stage.removeChild(stageEntity);
			stageEntity.destroy();
		}

		entities.stageEntities = {};
		entities.foregroundEntityZIndexIterator = c.zIndices.foreground;
		entities.backgroundEntityZIndexIterator = c.zIndices.background;
	},
};

export default entities;
