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

function targetPointedOrNearest(from, entities) {
	//pointed
	let current = null;

	const pointerY = from.y;
	const facing = from.facing;

	const candidates = entities.filter((entity) => {
		const rangeTop = pointerY - entity.immutable.width / 2;
		const rangeBottom = pointerY + entity.immutable.width / 2;
		if (entity.posY >= rangeTop && entity.posY <= rangeBottom) {
			if (
				(facing === 'right' && from.x < entity.posX) ||
				(facing === 'left' && from.x > entity.posX)
			)
				return true;
		}
	});

	let bestDistance = Infinity;
	candidates.forEach((entity) => {
		const currentDistance = Math.abs(from.x - entity.posX);
		if (currentDistance < bestDistance) {
			bestDistance = currentDistance;
			current = entity.id;
		}
	});

	if (current !== null) {
		console.log(`Found pointed entity: ${current}`);
		return current;
	}

	// nearest
	let bestDistance2 = Infinity;
	entities.forEach((entity) => {
		const currentDistance2 = calculateDistance(
			from.x,
			from.y,
			entity.posX,
			entity.posY
		);

		if (currentDistance2 < bestDistance2) {
			bestDistance2 = currentDistance2;
			current = entity.id;
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
			let newX = state.entities.player.posX;
			let newY = state.entities.player.posY;
			if (action.axis === 'x') {
				newX = move(action.mode, state.entities.player.posX, action.value);
			} else if (action.axis === 'y') {
				newY = move(action.mode, state.entities.player.posY, action.value);
			}
			const modifiedPlayer = assignWPrototype(state.entities.player, {
				posX: newX,
				posY: newY,
			});
			return {
				...state,
				entities: {
					...state.entities,
					player: modifiedPlayer,
				},
			};
		}
		case c.actions.ADD_ENTITY: {
			const storeIn = action.storeIn;
			switch (storeIn) {
				case 'player':
					return {
						...state,
						entities: {
							...state.entities,
							player: action.newEntity,
						},
					};
				case 'targetable':
					return {
						...state,
						entities: {
							...state.entities,
							targetable: [...state.entities.targetable, action.newEntity],
						},
					};
				case 'other':
					return {
						...state,
						entities: {
							...state.entities,
							other: [...state.entities.other, action.newEntity],
						},
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
				case 'pointed-nearest':
					newTarget = targetPointedOrNearest(
						{
							x: state.entities.player.posX,
							y: state.entities.player.posY,
							facing: state.game.facing,
						},
						state.entities.targetable
					);
					break;
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
