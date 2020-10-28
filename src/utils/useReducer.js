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
		set state(badSet) {
			console.error(
				`Out of bounds state update attempt detected, this should not be happening! Incoming attribute: ${badSet}`
			);
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
			let newStore = reducer(_internalState.state, action);
			let callbackFunction = null;
			if (Array.isArray(newStore)) {
				if (typeof newStore[0] === 'function') {
					callbackFunction = newStore[0];
					newStore = newStore[1];
				} else {
					console.error(
						'Your callback function has to be of type function! action:',
						action,
						', the return value was:',
						newStore
					);
					return null;
				}
			}
			if (!isPlainObject(newStore)) {
				console.error(
					'Failed to execute reducer with action:',
					action,
					', the return value was:',
					newStore
				);
				return null;
			}
			_internalState._store = newStore;
			isDispatching = false;
			if (callbackFunction) callbackFunction();
		} catch (error) {
			console.error(
				'Failed to execute reducer with action:',
				action,
				'error:',
				error
			);
			return null;
		} finally {
			isDispatching = false;
		}
	}

	return [() => _internalState.state, dispatch];
}
