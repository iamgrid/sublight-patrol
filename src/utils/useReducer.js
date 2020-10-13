// isPlainObject source: https://github.com/reduxjs/redux/blob/5ef5fa7ee5a636b16791540233078b9d235c41db/src/utils/isPlainObject.ts
function isPlainObject(obj) {
	if (typeof obj !== 'object' || obj === null) return false;

	let proto = obj;
	while (Object.getPrototypeOf(proto) !== null) {
		proto = Object.getPrototypeOf(proto);
	}

	return Object.getPrototypeOf(obj) === proto;
}

export default function useReducer(reducer, initialArg = {}) {
	if (!isPlainObject(initialArg)) {
		console.error(
			'initialArg has to be a plain object, this was received instead:',
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

	let isDispatching = false;

	const _internalState = {
		_store: {},
		get state() {
			return this._store;
		},
	};

	try {
		_internalState._store = initialArg;
	} catch (error) {
		console.error('Failed to set initial state based on:', initialArg);
	}

	function dispatch(action) {
		if (isDispatching) {
			console.error(
				'Failed to update state, a previous dispatch was still running.'
			);
			return null;
		}

		if (!isPlainObject(action)) {
			console.error(
				'Action has to be a plain object, this was received instead:',
				action
			);
			return null;
		}

		try {
			isDispatching = true;
			_internalState._store = reducer(_internalState.state, action);
		} catch (error) {
			console.error(
				'Failed to execute reducer with action:',
				action,
				'error:',
				error
			);
		} finally {
			isDispatching = false;
		}
	}

	return [() => _internalState.state, dispatch];
}
