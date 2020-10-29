import c from '../utils/constants';
import { calculateDistance } from '../utils/formulas';
import { getPosition } from '../utils/helpers';

function assignWPrototype(sourceObj, modifications = {}) {
	let re = Object.assign({}, sourceObj, modifications);
	re.__proto__ = sourceObj.__proto__;
	return re;
}

function move(mode = 'relative', initial, newValue) {
	if (mode === 'relative') {
		return initial + newValue;
	} else {
		return newValue;
	}
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

function cycleTargets(current, direction, entities) {
	if (current === null) {
		if (entities[0]) {
			return entities[0].id;
		} else {
			return null;
		}
	}

	const currentIdx = entities.findIndex((entity) => entity.id === current);

	let newIdx;
	if (direction === 'next') {
		newIdx = currentIdx + 1;
		if (newIdx > entities.length - 1) newIdx = 0;
	} else if (direction === 'previous') {
		newIdx = currentIdx - 1;
		if (newIdx < 0) newIdx = entities.length - 1;
	}

	return entities[newIdx].id;
}

export default function mainReducer(state, action) {
	switch (action.type) {
		case c.actions.MOVE_PLAYER: {
			const playerId = state.entities.player.id;
			const [currentX, currentY] = getPosition(playerId, state.positions);
			let newX = currentX;
			let newY = currentY;

			if (action.axis === 'x') {
				newX = move(action.mode, currentX, action.value);
			} else if (action.axis === 'y') {
				newY = move(action.mode, currentY, action.value);
			}

			let newPosProps = {};
			newPosProps[`${playerId}--posX`] = newX;
			newPosProps[`${playerId}--posY`] = newY;

			return {
				...state,
				positions: {
					canMove: { ...state.positions.canMove, ...newPosProps },
					cantMove: state.positions.cantMove,
				},
			};
		}
		case c.actions.ADD_ENTITY: {
			// position
			const entityId = action.newEntity.id;
			const positionStoreName = action.positionStore;
			const [posX, posY, latVelocity, longVelocity] = action.positionArray;
			const newPosProps = {};
			newPosProps[`${entityId}--posX`] = posX;
			newPosProps[`${entityId}--posY`] = posY;
			if (latVelocity !== undefined) {
				newPosProps[`${entityId}--latVelocity`] = latVelocity;
				newPosProps[`${entityId}--longVelocity`] = longVelocity;
			}
			let newPositionStore = {};
			if (positionStoreName === 'canMove') {
				newPositionStore = {
					canMove: { ...state.positions.canMove, ...newPosProps },
					cantMove: state.positions.cantMove,
				};
			} else {
				newPositionStore = {
					canMove: state.positions.canMove,
					cantMove: { ...state.positions.cantMove, ...newPosProps },
				};
			}

			// other props
			const storeIn = action.storeIn;
			switch (storeIn) {
				case 'player':
					return {
						...state,
						entities: {
							...state.entities,
							player: action.newEntity,
						},
						positions: newPositionStore,
					};
				case 'targetable':
					return {
						...state,
						entities: {
							...state.entities,
							targetable: [...state.entities.targetable, action.newEntity],
						},
						positions: newPositionStore,
					};
				case 'other':
					return {
						...state,
						entities: {
							...state.entities,
							other: [...state.entities.other, action.newEntity],
						},
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
			delete newPositions[posStore][`${entityId}--latVelocity`];
			delete newPositions[posStore][`${entityId}--longVelocity`];

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
				positions: newPositions,
			};
		}
		case c.actions.TARGET: {
			let newTarget;
			switch (action.do) {
				case 'clear':
					newTarget = null;
					break;
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
			if (
				nearEnoughToScan(state.entities.player.id, targetId, state.positions)
			) {
				const targetIdx = state.entities.targetable.findIndex(
					(entity) => entity.id === targetId
				);

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
			const entityStore = action.entityStore;
			const entityId = action.entityId;
			const shotDamage = action.shotDamage;
			const oldEntity = state.entities[entityStore].find(
				(entity) => entity.id === entityId
			);

			if (oldEntity === undefined) {
				return null;
			}

			let show = c.damageTypes.shieldDamage;
			let currentShieldStrength = oldEntity.shieldStrength;
			if (currentShieldStrength === undefined) currentShieldStrength = 0;
			let newShieldStrength = currentShieldStrength - shotDamage;
			let newHullStrength = oldEntity.hullStrength;
			if (newShieldStrength < 0) {
				newHullStrength += newShieldStrength;
				newShieldStrength = 0;
				show = c.damageTypes.hullDamage;
			}
			if (newHullStrength < 0) {
				show = c.damageTypes.destruction;
			}

			if (show !== c.damageTypes.destruction) {
				const modifiedEntity = assignWPrototype(oldEntity, {
					shieldStrength: newShieldStrength,
					hullStrength: newHullStrength,
				});

				return [
					() => action.callbackFn(show),
					{
						...state,
						entities: {
							...state.entities,
							[entityStore]: [
								...state.entities[entityStore].filter(
									(en) => en.id !== entityId
								),
								modifiedEntity,
							],
						},
					},
				];
			} else {
				// REMOVE_ENTITY will be called in the callback function
				return [() => action.callbackFn(show), null];
			}
		}
		default:
			console.error(`Failed to run action: ${action}`);
			return state;
	}
}
