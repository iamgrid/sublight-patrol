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
	getCameraTLBasedOnPlayerPosition,
} from '../utils/helpers';
import soundEffects from '../audio/soundEffects';
import formations from '../behavior/formations';
import timing from '../utils/timing';
import plates from '../plates';
import hud from '../hud';
import shots from '../shots';
import emp from '../emp';
import gameMenus from '../gameMenus';

const entities = {
	handlers: {
		dispatch: null,
		state: null,
		stage: null,
		pixiHUD: null,
		entityWasDespawned: null,
		refocusCameraOnTL: null,
	}, // gets its values in App.js
	types: {},
	stageEntities: {},
	backgroundEntityZIndexIterator: c.zIndices.background,
	foregroundEntityZIndexIterator: c.zIndices.foreground,

	init() {
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
	},

	assembleType(fromPiecesReversed) {
		const fromPieces = fromPiecesReversed.reverse();
		let re = {
			immutable: { ...pieces.entity.immutable },
			mutable: { ...pieces.entity.mutable },
		};
		const entityType = fromPieces[fromPieces.length - 1];
		re.immutable.entityType = makeName(entityType);

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

		// setting mutables to maximum where available
		hasMaxValue.forEach((el) => {
			const actualName = el.substr(3, 1).toLowerCase() + el.substr(4);
			if (re.mutable[actualName] !== 'undefined')
				re.mutable[actualName] = re.immutable[el];
		});

		re.immutable.colors = c.groups[re.immutable.colors];

		// emitting warning about immutables with a null value
		this.checkForNullValues(`Entity types - ${entityType}`, re.immutable);

		// locking in object keys and values
		Object.freeze(re.immutable);
		Object.freeze(re.mutable);

		this.types[entityType] = re;
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
		// console.log(functionSignature, typeOrEntityObject, pos, incomingProps, storeIn);

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

		// entity object creation
		const newEntity = { ...this.types[type].mutable, ...props };

		// facing
		let facing = 1;
		if (pos.facing !== undefined) facing = pos.facing;
		newEntity.facing = facing;

		// adding prototype
		newEntity.__proto__ = this.types[type];

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
		let currentState = entities.handlers.state();
		const shipsInHangar = currentState.game.playerShips.hangarContents.length;

		// when playerShipDestruction runs, the mainReducer REMOVE_ENTITY action has already
		// taken care of updating the players hangar and assigning the next fighter to the player
		// if one was available
		const nextShip = currentState.game.playerShips.current;
		const nextSuffix = currentState.game.playerShips.currentIdSuffix;

		if (shipsInHangar < 1 && nextShip === null) {
			console.log('Game over');

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
			console.log(functionSignature, 'Spawn player with their next ship');

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
			} else {
				const destroyedPlayerPosition = getPosition(
					'destroyed_player',
					currentState.positions
				);
				newPlayerShipX = destroyedPlayerPosition[0];
				newPlayerShipY = destroyedPlayerPosition[1];
			}
			3;

			plates.fadeInMatte(25, 0);
			timing.toggleEntityMovement(false, `${functionSignature} 3`, 1000);
			timing.setTimeout(
				() => {
					soundEffects.muteUnmuteAllLoops(`${functionSignature} 4`, true);
				},
				timing.modes.play,
				1000
			);
			plates.loadPlate('respawning', nextShip);
			plates.fadeInPlate(25, 1500);
			timing.setTrigger(
				'spawn in player with a new ship',
				() => {
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
				},
				timing.modes.play,
				1100,
				true
			);

			// camera needs to be repositioned to the new player craft

			console.log(
				functionSignature,
				"Repositioning camera to the player's new craft"
			);

			const cameraTL = getCameraTLBasedOnPlayerPosition(
				newPlayerShipX,
				newPlayerShipY,
				1
			);

			console.log(functionSignature, 'cameraTL:', cameraTL);

			entities.handlers.refocusCameraOnTL(cameraTL[0], cameraTL[1], 0, false);

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
				},
				timing.modes.play,
				3000,
				true
			);
			plates.fadeOutPlate(25, 7000);
		}
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
