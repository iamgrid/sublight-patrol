import c from './utils/constants';
import {
	updateStageEntityVelocities,
	moveTargetingReticule,
	gameLog,
	messageLayer,
} from './utils/helpers';
import keyboard from './Keyboard';
import gameMenus from './gameMenus';
import entities from './entities/entities';
import shots from './shots';
import emp from './emp';
import soundEffects from './audio/soundEffects';
// import story from './story/story';

const controlSchemes = {
	// https://www.npmjs.com/package/pixi.js-keyboard

	currentlyShowingLayout: null,
	suspendedLayout: null,
	init() {
		window.addEventListener(
			'keydown',
			controlSchemes.preventDefaultOnKeys,
			false
		);
	},
	preventDefaultOnKeys(event) {
		// prevent keyboard scroll events (space and arrow keys) on window
		// https://keycode.info/

		const prevent = [
			'Enter',
			'Space',
			'ArrowLeft',
			'ArrowUp',
			'ArrowRight',
			'ArrowDown',
		];
		if (prevent.includes(event.code)) event.preventDefault();
	},
	showLayout(layout) {
		if (controlSchemes.currentlyShowingLayout !== layout) {
			const functionSignature = 'controlSchemes.js@showLayout()';
			if (c.debug.controlSchemes) console.log(functionSignature);

			const currentDescriptions = controlSchemes[layout].descriptions;
			if (c.debug.controlSchemes) console.log('showLayout: ', layout);

			const re = [];

			currentDescriptions.forEach((desc) => {
				re.push(`<div class="footer__controls__control">
					<span class="footer__controls__key">${desc.keys}</span
					><span class="footer__controls__function">${desc.function}</span>
				</div>`);
			});

			document.getElementById('footer__controls').innerHTML = re.join('\n');

			controlSchemes.currentlyShowingLayout = layout;
		}
	},

	suspendCurrentLayout() {
		const functionSignature = 'controlSchemes.js@suspendCurrentLayout()';
		if (c.debug.controlSchemes) console.log(functionSignature);

		controlSchemes.suspendedLayout = controlSchemes.currentlyShowingLayout;
		controlSchemes.currentlyShowingLayout = null;
		keyboard.clear();
		keyboard.removeEventListeners();

		window.removeEventListener(
			'keydown',
			controlSchemes.preventDefaultOnKeys,
			false
		);

		document.getElementById('footer__controls').innerHTML = '&nbsp;';
	},

	restoreSuspendedLayout() {
		const functionSignature = 'controlSchemes.js@restoreSuspendedLayout()';
		if (c.debug.controlSchemes) console.log(functionSignature);

		if (typeof controlSchemes.suspendedLayout !== 'string') {
			console.warn(
				`${functionSignature} - controlSchemes.suspendedLayout is not a string:`,
				controlSchemes.suspendedLayout
			);
			return;
		}
		controlSchemes.showLayout(controlSchemes.suspendedLayout);

		keyboard.addEventListeners();

		window.addEventListener(
			'keydown',
			controlSchemes.preventDefaultOnKeys,
			false
		);

		controlSchemes.suspendedLayout = null;
	},

	pause: {
		id: 'pause',
		descriptions: [
			{ keys: 'esc', function: 'Resume game' },
			{ keys: 'left, right', function: 'Cycle menu buttons' },
			{ keys: 'enter', function: 'Activate menu button' },
			{ keys: 'up, down', function: 'Scroll combat log' },
		],
		execute() {
			// const functionSignature = 'controlSchemes.js@pause.execute()';
			// if (c.debug.controlSchemes) console.log(functionSignature);

			controlSchemes.showLayout(controlSchemes.pause.id);

			if (keyboard.isKeyPressed('Escape')) {
				soundEffects.playOnce(null, soundEffects.library.menu_activate.id);
				window.pixiapp.togglePause();
			}

			if (keyboard.isKeyPressed('ArrowRight')) {
				gameMenus.cycleFocus('forward');
			}

			if (keyboard.isKeyPressed('ArrowLeft')) {
				gameMenus.cycleFocus('back');
			}

			if (keyboard.isKeyPressed('Enter', 'NumpadEnter')) {
				gameMenus.activateFocusedButton();
			}

			const gameLogProperDiv = document.getElementById('game__log-proper');

			if (gameLog.store.length > 4) {
				if (keyboard.isKeyDown('ArrowUp')) {
					gameLogProperDiv.scrollBy(0, -4);
				}
				if (keyboard.isKeyDown('ArrowDown')) {
					gameLogProperDiv.scrollBy(0, 4);
				}
			}
		},
	},

	play: {
		id: 'play',
		descriptions: [
			{ keys: 'esc', function: 'Pause game' },
			{ keys: 'm', function: 'Advance dialog' },
			{ keys: 'up, down, left, right', function: 'Thrusters' },
			{ keys: 'f', function: 'Flip 180°' },
			{ keys: 'a, s', function: 'Cycle targets' },
			{ keys: 'd', function: 'Target pointed entity' },
			{ keys: 'c', function: 'Clear target' },
			{ keys: 'space', function: 'Fire' },
			{ keys: 'e', function: 'EMP' },
		],
		execute(playerId, currentState, dispatch, camera) {
			// const functionSignature = 'controlSchemes.js@play.execute()';
			// if (c.debug.controlSchemes) console.log(functionSignature);

			controlSchemes.showLayout(controlSchemes.play.id);

			function playerStageEntityVelocity(newLatVelocity, newLongVelocity) {
				updateStageEntityVelocities(
					playerId,
					entities.stageEntities,
					newLatVelocity,
					newLongVelocity
				);
			}

			function targetingCallback(newTargetId) {
				moveTargetingReticule(newTargetId, entities.stageEntities);
			}

			if (keyboard.isKeyPressed('Escape')) {
				soundEffects.playOnce(null, soundEffects.library.menu_activate.id);
				window.pixiapp.togglePause();
			}

			if (playerId !== 'destroyed_player') {
				let latDirection = 0;
				let longDirection = 0;
				if (keyboard.isKeyDown('ArrowUp')) {
					latDirection = -1;
				} else if (keyboard.isKeyDown('ArrowDown')) {
					latDirection = 1;
				}

				if (keyboard.isKeyDown('ArrowLeft')) {
					longDirection = -1;
				} else if (keyboard.isKeyDown('ArrowRight')) {
					longDirection = 1;
				}

				dispatch({
					type: c.actions.CHANGE_ENTITY_VELOCITIES,
					id: playerId,
					latDirection: latDirection,
					longDirection: longDirection,
					callbackFn: playerStageEntityVelocity,
				});

				if (keyboard.isKeyPressed('Space')) {
					shots.startShooting(playerId);
				}

				if (
					keyboard.isKeyPressed('KeyM') &&
					!(keyboard.isKeyDown('ShiftLeft') || keyboard.isKeyDown('ShiftRight'))
				) {
					if (messageLayer.messageIsShowing) {
						messageLayer.advance();
					}
				}

				if (
					keyboard.isKeyPressed('KeyM') &&
					(keyboard.isKeyDown('ShiftLeft') || keyboard.isKeyDown('ShiftRight'))
				) {
					if (messageLayer.messageIsShowing) {
						messageLayer.skipDialog();
					}
				}

				if (keyboard.isKeyReleased('Space')) {
					shots.stopShooting(playerId);
				}

				if (keyboard.isKeyPressed('KeyD')) {
					dispatch({
						type: c.actions.TARGET,
						do: 'pointed-nearest',
						stageEntities: entities.stageEntities,
						callbackFn: targetingCallback,
					});
				}

				if (keyboard.isKeyPressed('KeyS')) {
					dispatch({
						type: c.actions.TARGET,
						do: 'next',
						stageEntities: entities.stageEntities,
						callbackFn: targetingCallback,
					});
				}

				if (keyboard.isKeyPressed('KeyA')) {
					dispatch({
						type: c.actions.TARGET,
						do: 'previous',
						stageEntities: entities.stageEntities,
						callbackFn: targetingCallback,
					});
				}

				if (keyboard.isKeyPressed('KeyC')) {
					dispatch({
						type: c.actions.TARGET,
						do: 'clear',
						callbackFn: targetingCallback,
					});
				}

				if (keyboard.isKeyPressed('KeyL')) {
					const currentTarget = currentState.game.targeting;
					console.log(
						`%c target id: ${currentTarget}`,
						'padding-top: 10px; color: aqua'
					);
					if (currentTarget !== null) {
						console.info(
							currentState.entities.targetable.find(
								(ent) => ent.id === currentTarget
							)
						);
						console.info(entities.stageEntities[currentTarget]);
					}
				}

				if (keyboard.isKeyPressed('KeyF')) {
					if (!camera.isFlipping) {
						if (currentState.entities.player.facing === 1) {
							entities.stageEntities[playerId].targetRotation = Math.PI;
							entities.stageEntities[playerId].facing = -1;
							camera.newFacing = -1;
						} else {
							entities.stageEntities[playerId].targetRotation = 0;
							entities.stageEntities[playerId].facing = 1;
							camera.newFacing = 1;
						}

						dispatch({
							type: c.actions.FLIP,
							id: playerId,
							store: 'player',
						});

						camera.isFlipping = true;
						camera.flipTimer = camera.maxFlipTimer;
					}
				}

				if (keyboard.isKeyPressed('KeyE')) {
					emp.toggleEMP(playerId, true);
				}
				if (keyboard.isKeyReleased('KeyE')) {
					emp.toggleEMP(playerId, false);
				}
			}
		},
	},

	gameMenus: {
		id: 'gameMenus',
		descriptions: [
			{ keys: 'left, right', function: 'Cycle menu buttons' },
			{ keys: 'enter', function: 'Activate menu button' },
		],
		execute() {
			// const functionSignature = 'controlSchemes.js@gameMenus.execute()';
			// if (c.debug.controlSchemes) console.log(functionSignature);

			controlSchemes.showLayout(controlSchemes.gameMenus.id);

			if (keyboard.isKeyPressed('ArrowRight')) {
				gameMenus.cycleFocus('forward');
			}

			if (keyboard.isKeyPressed('ArrowLeft')) {
				gameMenus.cycleFocus('back');
			}

			if (keyboard.isKeyPressed('Enter', 'NumpadEnter')) {
				gameMenus.activateFocusedButton();
			}
		},
	},

	gameMenusVertical: {
		id: 'gameMenusVertical',
		descriptions: [
			{ keys: 'up, down', function: 'Cycle menu buttons' },
			{ keys: 'enter', function: 'Activate menu button' },
			{ keys: 'esc', function: 'Return to main menu' },
		],
		execute() {
			// const functionSignature = 'controlSchemes.js@gameMenusVertical.execute()';
			// if (c.debug.controlSchemes) console.log(functionSignature);

			controlSchemes.showLayout(controlSchemes.gameMenusVertical.id);

			if (keyboard.isKeyPressed('ArrowDown')) {
				gameMenus.cycleFocus('forward');
			}

			if (keyboard.isKeyPressed('ArrowUp')) {
				gameMenus.cycleFocus('back');
			}

			if (keyboard.isKeyPressed('Escape')) {
				gameMenus.returnToMainMenu();
			}

			if (keyboard.isKeyPressed('Enter', 'NumpadEnter')) {
				gameMenus.activateFocusedButton();
			}
		},
	},

	intro: {
		id: 'intro',
		descriptions: [{ keys: 'space', function: 'Skip to main menu' }],
		execute(playerId, currentState, dispatch, camera, skipToMainMenu) {
			// const functionSignature = 'controlSchemes.js@intro.execute()';
			// if (c.debug.controlSchemes) console.log(functionSignature);

			controlSchemes.showLayout(controlSchemes.intro.id);

			// keyboard.clear();

			if (keyboard.isKeyPressed('Space')) {
				console.log('controlSchemes.js@intro.execute()');
				skipToMainMenu();
			}
		},
	},

	// cutscenes: {
	// 	id: 'cutscenes',
	// 	descriptions: [
	// 		{ keys: 'esc', function: 'Pause game' },
	// 		{ keys: 'space', function: 'Advance dialog' },
	// 		{ keys: 'enter', function: 'Skip cutscene' },
	// 	],
	// 	execute() {
	// 		const functionSignature = "controlSchemes.js@cutscenes.execute()";
	// 		if (c.debug.controlSchemes) console.log(functionSignature);

	// 		controlSchemes.showLayout(controlSchemes.cutscenes.id);

	// 		if (keyboard.isKeyPressed('Escape')) {
	// 			window.pixiapp.togglePause();
	// 		}
	// 	},
	// },
};

export default controlSchemes;
