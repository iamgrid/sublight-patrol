// My rewrite of the "pixi.js-keyboard" NPM package,
// which does not implement a way to suspend and restore
// keyboard input capture

import Events from 'nom-events';

class Keyboard {
	constructor() {
		this.keyStates = new Map();
		this.events = new Events();
		// this.events = {
		// 	// eslint-disable-next-line no-unused-vars
		// 	call: (eventName, ...args) => {},
		// };
	}

	clear() {
		this.keyStates.clear();
	}

	update() {
		this.keyStates.forEach((value, keyCode) => {
			const event = this.keyStates.get(keyCode);

			event.alreadyPressed = true;

			if (event.wasReleased) {
				this.keyStates.delete(keyCode);
			}

			keyboard.events.call('down', keyCode, event);
			keyboard.events.call('down_' + keyCode, keyCode, event);
		});
	}

	isKeyDown(...args) {
		let result = false;
		for (let keyCode of args) {
			const event = this.keyStates.get(keyCode);
			if (event && !event.wasReleased) result = true;
		}

		return result;
	}

	isKeyUp(...args) {
		return !this.isKeyDown(args);
	}

	isKeyPressed(...args) {
		let result = false;

		if (args.length == 0) return false;

		for (let keyCode of args) {
			const event = this.keyStates.get(keyCode);
			if (event && !event.wasReleased && !event.alreadyPressed) result = true;
		}

		return result;
	}

	isKeyReleased(...args) {
		let result = false;

		if (args.length == 0) return false;

		for (let keyCode of args) {
			const event = this.keyStates.get(keyCode);
			if (event && event.wasReleased) result = true;
		}

		return result;
	}

	keyDownListenerFn(event) {
		if (!keyboard.keyStates.get(event.code)) {
			keyboard.keyStates.set(event.code, event);
			keyboard.events.call('pressed', event.code, event);
			keyboard.events.call('pressed_' + event.code, event.code, event);
		}
	}

	keyUpListenerFn(event) {
		event = keyboard.keyStates.get(event.code);
		if (event) {
			//keyboard.keyStates.set(event.code, event);
			event.wasReleased = true;
			keyboard.events.call('released', event.code, event);
			keyboard.events.call('released_' + event.code, event.code, event);
		}
	}

	addEventListeners() {
		const functionSignature = 'Keyboard.js@addEventListeners()';
		console.log(functionSignature);
		window.addEventListener('keydown', keyboard.keyDownListenerFn, false);
		window.addEventListener('keyup', keyboard.keyUpListenerFn, false);
	}

	removeEventListeners() {
		const functionSignature = 'Keyboard.js@removeEventListeners()';
		console.log(functionSignature);
		window.removeEventListener('keydown', keyboard.keyDownListenerFn, false);
		window.removeEventListener('keyup', keyboard.keyUpListenerFn, false);
	}
}

const keyboard = new Keyboard();

export default keyboard;
