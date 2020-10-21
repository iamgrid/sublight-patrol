import c from '../utils/constants';
import { calculateDistance } from '../utils/formulas';

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

function getPosition(entityId, positions) {
	if (positions.canMove[`${entityId}--posX`]) {
		return [
			positions.canMove[`${entityId}--posX`],
			positions.canMove[`${entityId}--posY`],
		];
	}

	if (positions.cantMove[`${entityId}--posX`]) {
		return [
			positions.cantMove[`${entityId}--posX`],
			positions.cantMove[`${entityId}--posY`],
		];
	}

	console.error(`Unable to ascertain position for ${entityId}`);
	// console.log(positions);
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
				(facing === 'right' && from.x < entityX) ||
				(facing === 'left' && from.x > entityX)
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
		console.log(`Found pointed entity: ${current}`);
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
	if (current === null) return entities[0].id;

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
							facing: state.game.facing,
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
			action.callbackFn(newTarget);
			return {
				...state,
				game: { ...state.game, targeting: newTarget },
			};
		}
		case c.actions.CHANGE_PLAYER_RELATION: {
			const entityId = action.entityId;
			const newRelation = action.newRelation;
			const entityIndex = state.entities.targetable.findIndex(
				(entity) => entity.id === entityId
			);

			const modifiedEntity = assignWPrototype(
				state.entities.targetable[entityIndex],
				{ playerRelation: newRelation }
			);

			action.callbackFn(newRelation);

			return {
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
			};
		}
		default:
			console.error(`Failed to run action: ${action}`);
			return state;
	}
}
