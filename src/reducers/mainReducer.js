import c from '../utils/constants';
import { targetPointedOrNearest, cycleTargets } from '../utils/formulas';
import { moveTargetingReticule } from '../utils/helpers';

function move(mode = 'relative', initial, newValue) {
	if (mode === 'relative') {
		return initial + newValue;
	} else {
		return newValue;
	}
}

export default function mainReducer(state, action) {
	switch (action.type) {
		case c.actions.MOVE_PLAYER: {
			let newX = state.game.playerX;
			let newY = state.game.playerY;
			if (action.axis === 'x') {
				newX = move(action.mode, state.game.playerX, action.value);
			} else if (action.axis === 'y') {
				newY = move(action.mode, state.game.playerY, action.value);
			}
			return {
				...state,
				game: { ...state.game, playerX: newX, playerY: newY },
			};
		}
		case c.actions.ADD_ENTITY: {
			return { ...state, entities: [...state.entities, action.newEntity] };
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
							x: state.game.playerX,
							y: state.game.playerY,
							facing: state.game.facing,
						},
						state.entities
					);
					break;
				case 'next':
					newTarget = cycleTargets(
						state.game.targeting,
						'next',
						state.entities
					);
					break;
				case 'previous':
					newTarget = cycleTargets(
						state.game.targeting,
						'previous',
						state.entities
					);
					break;
			}
			moveTargetingReticule(newTarget, action.stageEntities);
			return {
				...state,
				game: { ...state.game, targeting: newTarget },
			};
		}
		default:
			console.error(`Failed to run action: ${action}`);
			return state;
	}
}
