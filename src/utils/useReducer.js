export default function useReducer(reducer, initialArg = {}) {
	if (typeof initialArg !== 'object') {
		console.error(
			'initialArg has to be an object, this was received instead:',
			initialArg
		);
		return null;
	}

	if (typeof reducer !== 'function') {
		console.error(
			'reducer has to be a function, this was received instead:',
			reducer
		);
		return null;
	}

	const _internalState = {
		_store: {},
		get state() {
			return this._store;
		},
		set state(newState) {
			this._store = newState;
		},
	};

	try {
		_internalState.state = initialArg;
	} catch (error) {
		console.error('Failed to set initial state based on:', initialArg);
	}

	function dispatch(action) {
		try {
			const newState = reducer(_internalState.state, action);
			_internalState.state = newState;
		} catch (error) {
			console.error(
				'Failed to run reducer with action:',
				action,
				'error:',
				error
			);
		}
	}

	return [() => _internalState.state, dispatch];
}
