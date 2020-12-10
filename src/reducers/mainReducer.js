import c from '../utils/constants';
import { calculateDistance } from '../utils/formulas';
import {
	isEmptyObject,
	getPosition,
	getVelocity,
	getStoreEntity,
} from '../utils/helpers';

function assignWPrototype(sourceObj, modifications = {}) {
	let re = Object.assign({}, sourceObj, modifications);
	re.__proto__ = sourceObj.__proto__;
	return re;
}

function nearEnoughToScan(playerId, targetId, positions) {
	const [playerX, playerY] = getPosition(playerId, positions);
	const [targetX, targetY] = getPosition(targetId, positions);

	const distance = calculateDistance(playerX, playerY, targetX, targetY);

	// console.log(distance);

	if (distance < 200) {
		return true;
	}

	return false;
}

function targetPointedOrNearest(from, entities, positions) {
	//pointed
	let current = null;

	const pointerY = from.y;
	const facing = from.facing;

	const candidates = entities.filter((entity) => {
		const rangeTop = pointerY - entity.immutable.width / 2;
		const rangeBottom = pointerY + entity.immutable.width / 2;
		const [entityX, entityY] = getPosition(entity.id, positions);
		if (entityY >= rangeTop && entityY <= rangeBottom) {
			if (
				(facing === 1 && from.x < entityX) ||
				(facing === -1 && from.x > entityX)
			)
				return true;
		}
	});

	let bestDistance = Infinity;
	candidates.forEach((entity) => {
		const entityId = entity.id;

		const [entityX2] = getPosition(entityId, positions);
		const currentDistance = Math.abs(from.x - entityX2);
		if (currentDistance < bestDistance) {
			bestDistance = currentDistance;
			current = entityId;
		}
	});

	if (current !== null) {
		// console.log(`Found pointed entity: ${current}`);
		return current;
	}

	// nearest
	let bestDistance2 = Infinity;
	entities.forEach((entity) => {
		const entityId2 = entity.id;
		const [entityX3, entityY3] = getPosition(entityId2, positions);
		const currentDistance2 = calculateDistance(
			from.x,
			from.y,
			entityX3,
			entityY3
		);

		if (currentDistance2 < bestDistance2) {
			bestDistance2 = currentDistance2;
			current = entityId2;
		}
	});

	return current;
}

function cycleTargets(current, direction, targetableStore) {
	if (!targetableStore[0]) {
		return null;
	}

	const relationPriorities = ['hostile', 'neutral', 'friendly'];

	let temp = targetableStore.map((el) => {
		const re = { id: el.id };
		re.rel = relationPriorities.findIndex(
			(rPItem) => rPItem === el.playerRelation
		);
		return re;
	});
	temp.sort((a, b) => {
		if (a.rel < b.rel) {
			return -1;
		} else if (a.rel > b.rel) {
			return 1;
		}

		if (a.id < b.id) {
			return -1;
		} else if (a.id > b.id) {
			return 1;
		}
		return 0;
	});

	// console.log(temp);

	let currentIdx = 0;
	let newIdx;
	if (current !== null) {
		currentIdx = temp.findIndex((el) => el.id === current);
		if (direction === 'next') {
			newIdx = currentIdx + 1;
			if (newIdx > temp.length - 1) newIdx = 0;
		} else if (direction === 'previous') {
			newIdx = currentIdx - 1;
			if (newIdx < 0) newIdx = temp.length - 1;
		}
	} else {
		if (direction === 'next') {
			newIdx = 0;
		} else if (direction === 'previous') {
			newIdx = temp.length - 1;
		}
	}
	return temp[newIdx].id;
}

export default function mainReducer(state, action) {
	switch (action.type) {
		case c.actions.CHANGE_ENTITY_VELOCITIES: {
			const [currentLatVel, currentLongVel] = getVelocity(
				action.id,
				state.velocities
			);

			if (
				action.latDirection === 0 &&
				action.longDirection === 0 &&
				currentLatVel === 0 &&
				currentLongVel === 0
			) {
				return null;
			}

			const storeEntity = getStoreEntity(action.id, state);

			if (!storeEntity) {
				return null;
			}

			let newLatVel =
				action.latDirection * storeEntity.immutable.thrusters.side;
			let newLongVel;
			const longDirection = action.longDirection;
			if (
				(storeEntity.facing === 1 && longDirection === 1) ||
				(storeEntity.facing === -1 && longDirection === -1)
			) {
				newLongVel = longDirection * storeEntity.immutable.thrusters.main;
			} else if (
				(storeEntity.facing === -1 && longDirection === 1) ||
				(storeEntity.facing === 1 && longDirection === -1)
			) {
				newLongVel = longDirection * storeEntity.immutable.thrusters.front;
			} else {
				newLongVel = 0;
			}

			if (newLatVel === currentLatVel && newLongVel === currentLongVel)
				return null;

			let newVelocities = {};
			if (newLatVel !== currentLatVel) {
				newVelocities[`${action.id}--latVelocity`] = newLatVel;
			}

			if (newLongVel !== currentLongVel) {
				newVelocities[`${action.id}--longVelocity`] = newLongVel;
			}

			return [
				() => action.callbackFn(newLatVel, newLongVel),
				{
					...state,
					velocities: { ...state.velocities, ...newVelocities },
				},
			];
		}
		case c.actions.UPDATE_ENTITY_COORDS: {
			const entitiesToUpdate = [];
			const currentCanMoveStore = state.positions.canMove;
			const currentVelocities = state.velocities;
			for (const prop in currentVelocities) {
				const [entId, property] = prop.split('--');
				if (
					(property == 'latVelocity' &&
						currentVelocities[`${entId}--latVelocity`] !== 0) ||
					(property == 'longVelocity' &&
						currentVelocities[`${entId}--longVelocity`] !== 0)
				)
					entitiesToUpdate.push(entId);
			}

			if (entitiesToUpdate.length === 0) return null;

			const newCanMoveStore = { ...currentCanMoveStore };
			entitiesToUpdate.forEach((entityId) => {
				let efficacy = 1;
				const latVelocity = currentVelocities[`${entityId}--latVelocity`];
				const longVelocity = currentVelocities[`${entityId}--longVelocity`];
				if (latVelocity !== 0 && longVelocity !== 0) efficacy = 0.5;
				let xChange = 0;
				let yChange = 0;

				if (latVelocity !== 0) {
					yChange = Math.round(latVelocity * efficacy);
					newCanMoveStore[`${entityId}--posY`] += yChange;
				}
				if (longVelocity !== 0) {
					xChange = Math.round(longVelocity * efficacy);
					newCanMoveStore[`${entityId}--posX`] += xChange;
				}

				// console.log(
				// 	`${entityId}: ${latVelocity} -> ${yChange}(${
				// 		newCanMoveStore[entityId + '--posY']
				// 	}); ${longVelocity} -> ${xChange}(${
				// 		newCanMoveStore[entityId + '--posX']
				// 	})`
				// );
			});

			return [
				() => action.callbackFn(entitiesToUpdate),
				{
					...state,
					positions: {
						canMove: newCanMoveStore,
						cantMove: state.positions.cantMove,
					},
				},
			];
		}
		case c.actions.BEHAVIOR_RELATED_UPDATES: {
			let newTargetableStore = state.entities.targetable;
			if (!isEmptyObject(action.entityStoreUpdates)) {
				newTargetableStore = [...state.entities.targetable];

				console.log('behavior update:', action.entityStoreUpdates);

				for (const entityId in action.entityStoreUpdates) {
					const entityIndex = newTargetableStore.findIndex(
						(ent) => ent.id === entityId
					);

					if (entityIndex !== -1)
						newTargetableStore[entityIndex] = assignWPrototype(
							newTargetableStore[entityIndex],
							action.entityStoreUpdates[entityId]
						);
				}
			}

			let newVelocities = state.velocities;
			if (!isEmptyObject(action.velocityUpdates)) {
				newVelocities = { ...state.velocities, ...action.velocityUpdates };
			}

			return [
				() => action.callbackFn(),
				{
					...state,
					entities: {
						...state.entities,
						targetable: newTargetableStore,
					},
					velocities: newVelocities,
				},
			];
		}
		case c.actions.FLIP: {
			const entityId = action.id;
			let storeEntity;
			if (action.store === 'player') {
				storeEntity = state.entities.player;
			} else {
				storeEntity = state.entities[action.store].find(
					(ent) => ent.id === entityId
				);
			}
			const newFacing = -storeEntity.facing;
			const modifiedEntity = assignWPrototype(storeEntity, {
				facing: newFacing,
			});

			if (action.store === 'player') {
				return {
					...state,
					entities: {
						...state.entities,
						player: modifiedEntity,
					},
				};
			} else {
				return {
					...state,
					entities: {
						...state.entities,
						[action.store]: [
							...state.entities[action.store].filter(
								(ent) => ent.id !== entityId
							),
							modifiedEntity,
						],
					},
				};
			}
		}
		case c.actions.ADD_ENTITY: {
			// position
			const entityId = action.newEntity.id;
			const storeIn = action.storeIn;
			let positionStoreName = action.positionStore;
			if (storeIn === 'other') positionStoreName = 'none';
			const [posX, posY, latVelocity, longVelocity] = action.positionArray;
			const newPosProps = {};
			newPosProps[`${entityId}--posX`] = posX;
			newPosProps[`${entityId}--posY`] = posY;

			let newPositionStore = {};
			if (positionStoreName === 'canMove') {
				newPositionStore = {
					canMove: { ...state.positions.canMove, ...newPosProps },
					cantMove: state.positions.cantMove,
				};
			} else if (positionStoreName === 'cantMove') {
				newPositionStore = {
					canMove: state.positions.canMove,
					cantMove: { ...state.positions.cantMove, ...newPosProps },
				};
			} else {
				newPositionStore = state.positions;
			}

			let newVelocities = state.velocities;
			if (positionStoreName === 'canMove') {
				const newVelocityProps = {};
				newVelocityProps[`${entityId}--latVelocity`] = latVelocity;
				newVelocityProps[`${entityId}--longVelocity`] = longVelocity;
				newVelocities = { ...state.velocities, ...newVelocityProps };
			}

			// other props

			switch (storeIn) {
				case 'player':
					return {
						...state,
						entities: {
							...state.entities,
							player: action.newEntity,
						},
						velocities: newVelocities,
						positions: newPositionStore,
					};
				case 'targetable':
					return {
						...state,
						entities: {
							...state.entities,
							targetable: [...state.entities.targetable, action.newEntity],
						},
						velocities: newVelocities,
						positions: newPositionStore,
					};
				case 'other':
					return {
						...state,
						entities: {
							...state.entities,
							other: [...state.entities.other, action.newEntity],
						},
						velocities: newVelocities,
						positions: newPositionStore,
					};
			}
			break;
		}
		case c.actions.REMOVE_ENTITY: {
			const entityId = action.id;
			const entityStore = action.store;
			let newTargeting = state.game.targeting;
			if (state.game.targeting === entityId) newTargeting = null;

			const entity = state.entities[entityStore].find(
				(en) => en.id === entityId
			);
			if (entity === undefined) {
				return null;
			}

			const newPositions = {
				canMove: { ...state.positions.canMove },
				cantMove: { ...state.positions.cantMove },
			};

			let posStore = 'canMove';
			if (!entity.immutable.canMove) posStore = 'cantMove';

			delete newPositions[posStore][`${entityId}--posX`];
			delete newPositions[posStore][`${entityId}--posY`];

			let newVelocities = state.velocities;
			if (posStore === 'canMove') {
				newVelocities = { ...state.velocities };
				delete newVelocities[`${entityId}--latVelocity`];
				delete newVelocities[`${entityId}--longVelocity`];
			}

			return {
				...state,
				game: {
					...state.game,
					targeting: newTargeting,
				},
				entities: {
					...state.entities,
					[entityStore]: [
						...state.entities[entityStore].filter((en) => en.id !== entityId),
					],
				},
				velocities: newVelocities,
				positions: newPositions,
			};
		}
		case c.actions.TARGET: {
			let newTarget;
			switch (action.do) {
				case 'clear':
					newTarget = null;
					break;
				case 'specified': {
					newTarget = action.targetId;
					break;
				}
				case 'pointed-nearest': {
					const playerId = state.entities.player.id;
					const [currentX, currentY] = getPosition(playerId, state.positions);
					newTarget = targetPointedOrNearest(
						{
							x: currentX,
							y: currentY,
							facing: state.entities.player.facing,
						},
						state.entities.targetable,
						state.positions
					);
					break;
				}
				case 'next':
					newTarget = cycleTargets(
						state.game.targeting,
						'next',
						state.entities.targetable
					);
					break;
				case 'previous':
					newTarget = cycleTargets(
						state.game.targeting,
						'previous',
						state.entities.targetable
					);
					break;
			}

			return [
				() => action.callbackFn(newTarget),
				{
					...state,
					game: {
						...state.game,
						targeting: newTarget,
						targetHasBeenScanned: false,
					},
				},
			];
		}
		case c.actions.CHANGE_PLAYER_RELATION: {
			const entityId = action.entityId;
			const newRelation = action.newRelation;
			const entityIndex = state.entities.targetable.findIndex(
				(entity) => entity.id === entityId
			);

			if (entityIndex === -1) return null;

			const modifiedEntity = assignWPrototype(
				state.entities.targetable[entityIndex],
				{ playerRelation: newRelation }
			);

			return [
				() => action.callbackFn(newRelation),
				{
					...state,
					entities: {
						...state.entities,
						targetable: [
							...state.entities.targetable.filter(
								(_, idx) => idx !== entityIndex
							),
							modifiedEntity,
						],
					},
				},
			];
		}
		case c.actions.SCAN: {
			const targetId = state.game.targeting;
			const targetIdx = state.entities.targetable.findIndex(
				(entity) => entity.id === targetId
			);

			if (targetIdx === -1) return null;

			if (
				nearEnoughToScan(state.entities.player.id, targetId, state.positions)
			) {
				// no update needed
				if (state.entities.targetable[targetIdx].hasBeenScanned) {
					return {
						...state,
						game: {
							...state.game,
							targetHasBeenScanned: true,
						},
					};
				}

				// really hasnt been scanned yet
				const newEntityObj = assignWPrototype(
					state.entities.targetable[targetIdx],
					{ hasBeenScanned: true }
				);
				return {
					...state,
					game: {
						...state.game,
						targetHasBeenScanned: true,
					},
					entities: {
						...state.entities,
						targetable: [
							...state.entities.targetable.filter(
								(_, idx) => idx !== targetIdx
							),
							newEntityObj,
						],
					},
				};
			} else {
				return null;
			}
		}
		case c.actions.ADD_SHOT: {
			const newId = action.id;
			const currentSightLine = state.shots.sightLines[action.sightLine];
			let updatedSightLine;
			if (currentSightLine) {
				updatedSightLine = [...currentSightLine, newId];
			} else {
				updatedSightLine = [newId];
			}

			return {
				...state,
				shots: {
					ids: [...state.shots.ids, newId],
					sightLines: {
						...state.shots.sightLines,
						[action.sightLine]: updatedSightLine,
					},
				},
			};
		}
		case c.actions.REMOVE_SHOT: {
			const removeId = action.id;
			let callbackFn = action.callbackFn;

			// console.log(`removing ${removeId} from ${action.sightLine}`);
			const updatedSightLine = state.shots.sightLines[action.sightLine].filter(
				(sl) => sl !== removeId
			);
			return [
				callbackFn,
				{
					...state,
					shots: {
						ids: [...state.shots.ids.filter((shotId) => shotId !== removeId)],
						sightLines: {
							...state.shots.sightLines,
							[action.sightLine]: updatedSightLine,
						},
					},
				},
			];
		}
		case c.actions.DAMAGE: {
			const entityId = action.entityId;
			const entityStore = action.entityStore;
			const shotDamage = action.shotDamage;
			const shotOrigin = action.origin;
			const oldEntity = getStoreEntity(entityId, state);

			// temporarily disabling player damage to test
			// behavior
			// if (entityId === state.entities.player.id) {
			// 	return null;
			// }

			if (!oldEntity) {
				return null;
			}

			let show = c.damageTypes.shieldDamage;
			let hullHealthPrc = null; // only relevant on hullDamage
			let fancyEffects = null; // relevant on hullDamage and explosion
			let currentShieldStrength = oldEntity.shieldStrength;
			if (currentShieldStrength === undefined) currentShieldStrength = 0;
			let newShieldStrength = currentShieldStrength - shotDamage;
			let newHullStrength = oldEntity.hullStrength;

			// hunting a bug here:
			if (oldEntity.immutable === undefined) console.log(oldEntity);

			if (newShieldStrength < 0) {
				newHullStrength += newShieldStrength;
				newShieldStrength = 0;
				show = c.damageTypes.hullDamage;
				hullHealthPrc = Math.trunc(
					(newHullStrength / oldEntity.immutable.maxHullStrength) * 100
				);
				fancyEffects = oldEntity.immutable.fancyEffects;
			}
			if (newHullStrength < 0) {
				show = c.damageTypes.destruction;
				fancyEffects = oldEntity.immutable.fancyEffects;
			}

			if (show !== c.damageTypes.destruction) {
				const modifiedEntity = assignWPrototype(oldEntity, {
					shieldStrength: newShieldStrength,
					hullStrength: newHullStrength,
				});

				if (modifiedEntity.immutable.hasBehavior) {
					modifiedEntity.behaviorHitsSuffered++;
					modifiedEntity.behaviorLastHitOrigin = shotOrigin;
				}

				let newEntities = {};
				if (entityId === state.entities.player.id) {
					newEntities = {
						...state.entities,
						player: modifiedEntity,
					};
				} else {
					newEntities = {
						...state.entities,
						[entityStore]: [
							...state.entities[entityStore].filter((en) => en.id !== entityId),
							modifiedEntity,
						],
					};
				}

				return [
					() => action.callbackFn(show, hullHealthPrc, fancyEffects),
					{ ...state, entities: newEntities },
				];
			} else {
				// REMOVE_ENTITY will be called in the callback function
				return [
					() => action.callbackFn(show, hullHealthPrc, fancyEffects),
					null,
				];
			}
		}
		case c.actions.SHIELD_REGEN: {
			const entityId = action.id;
			const entityStore = action.store;
			const amount = action.amount;
			const oldEntity = getStoreEntity(entityId, state);

			if (!oldEntity) {
				return null;
			}

			const newShieldStrength = Math.min(
				oldEntity.shieldStrength + amount,
				oldEntity.immutable.maxShieldStrength
			);

			const modifiedEntity = assignWPrototype(oldEntity, {
				shieldStrength: newShieldStrength,
			});

			let newEntities = {};
			if (entityId === state.entities.player.id) {
				newEntities = {
					...state.entities,
					player: modifiedEntity,
				};
			} else {
				newEntities = {
					...state.entities,
					[entityStore]: [
						...state.entities[entityStore].filter((en) => en.id !== entityId),
						modifiedEntity,
					],
				};
			}

			return {
				...state,
				entities: newEntities,
			};
		}
		default:
			console.error(`Failed to run action: ${action}`);
			return state;
	}
}
