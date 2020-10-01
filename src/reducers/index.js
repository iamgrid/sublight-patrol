import c from '../utils/constants';

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
			let newX = state.player.x;
			let newY = state.player.y;
			if (action.axis === 'x') {
				newX = move(action.mode, state.player.x, action.value);
			} else if (action.axis === 'y') {
				newY = move(action.mode, state.player.y, action.value);
			}
			return { ...state, player: { ...state.player, x: newX, y: newY } };
		}
		default:
			console.error(`failed to run action: ${action}`);
			return state;
	}
}
