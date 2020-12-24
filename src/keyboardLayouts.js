import c from './utils/constants';
import {
	updateStageEntityVelocities,
	moveTargetingReticule,
	status,
} from './utils/helpers';
import Keyboard from 'pixi.js-keyboard';
import entities from './entities/entities';
import shots from './shots';
import emp from './emp';

const keyboardLayouts = {
	// https://www.npmjs.com/package/pixi.js-keyboard

	currentlyShowingLayout: null,
	showLayout(layout) {
		if (keyboardLayouts.currentlyShowingLayout !== layout) {
			const currentDescriptions = keyboardLayouts[layout].descriptions;
			// console.log('showLayout: ', currentDescriptions);

			const re = [];

			currentDescriptions.forEach((desc) => {
				re.push(`<div class="controls__control">
					<span class="controls__key">${desc.keys}</span
					><span class="controls__function">${desc.function}</span>
				</div>`);
			});

			document.getElementById('controls').innerHTML = re.join('\n');

			keyboardLayouts.currentlyShowingLayout = layout;
		}
	},

	pause: {
		id: 'pause',
		descriptions: [
			{ keys: 'esc', function: 'Resume game' },
			{ keys: 'up, down', function: 'Scroll messages' },
		],
		execute() {
			keyboardLayouts.showLayout(keyboardLayouts.pause.id);

			if (Keyboard.isKeyPressed('Escape')) {
				window.pixiapp.togglePause();
			}

			const statusProperDiv = document.getElementById('game__status-proper');

			if (status.store.length > 4) {
				if (Keyboard.isKeyDown('ArrowUp')) {
					statusProperDiv.scrollBy(0, -4);
				}
				if (Keyboard.isKeyDown('ArrowDown')) {
					statusProperDiv.scrollBy(0, 4);
				}
			}
		},
	},

	play: {
		id: 'play',
		descriptions: [
			{ keys: 'esc', function: 'Pause game' },
			{ keys: 'up, down, left, right', function: 'Thrusters' },
			{ keys: 'f', function: 'Flip 180°' },
			{ keys: 'a, s', function: 'Cycle targets' },
			{ keys: 'd', function: 'Target pointed / closest entity' },
			{ keys: 'c', function: 'Clear target' },
			{ keys: 'space', function: 'Fire' },
			{ keys: 'e', function: 'EMP' },
		],
		execute(playerId, currentState, dispatch, camera) {
			keyboardLayouts.showLayout(keyboardLayouts.play.id);

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

			if (Keyboard.isKeyPressed('Escape')) {
				window.pixiapp.togglePause();
			}

			if (playerId !== 'destroyed_player') {
				let latDirection = 0;
				let longDirection = 0;
				if (Keyboard.isKeyDown('ArrowUp')) {
					latDirection = -1;
				} else if (Keyboard.isKeyDown('ArrowDown')) {
					latDirection = 1;
				}

				if (Keyboard.isKeyDown('ArrowLeft')) {
					longDirection = -1;
				} else if (Keyboard.isKeyDown('ArrowRight')) {
					longDirection = 1;
				}

				dispatch({
					type: c.actions.CHANGE_ENTITY_VELOCITIES,
					id: playerId,
					latDirection: latDirection,
					longDirection: longDirection,
					callbackFn: playerStageEntityVelocity,
				});

				if (Keyboard.isKeyPressed('Space')) {
					shots.startShooting(playerId);
				}

				if (Keyboard.isKeyReleased('Space')) {
					shots.stopShooting(playerId);
				}

				if (Keyboard.isKeyPressed('KeyD')) {
					dispatch({
						type: c.actions.TARGET,
						do: 'pointed-nearest',
						stageEntities: entities.stageEntities,
						callbackFn: targetingCallback,
					});
				}

				if (Keyboard.isKeyPressed('KeyS')) {
					dispatch({
						type: c.actions.TARGET,
						do: 'next',
						stageEntities: entities.stageEntities,
						callbackFn: targetingCallback,
					});
				}

				if (Keyboard.isKeyPressed('KeyA')) {
					dispatch({
						type: c.actions.TARGET,
						do: 'previous',
						stageEntities: entities.stageEntities,
						callbackFn: targetingCallback,
					});
				}

				if (Keyboard.isKeyPressed('KeyC')) {
					dispatch({
						type: c.actions.TARGET,
						do: 'clear',
						callbackFn: targetingCallback,
					});
				}

				if (Keyboard.isKeyPressed('KeyL')) {
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

				if (Keyboard.isKeyPressed('KeyF')) {
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

				if (Keyboard.isKeyPressed('KeyE')) {
					emp.toggleEMP(playerId, true);
				}
				if (Keyboard.isKeyReleased('KeyE')) {
					emp.toggleEMP(playerId, false);
				}
			}
		},
	},

	cutscene: {
		id: 'cutscene',
		descriptions: [
			{ keys: 'esc', function: 'Pause game' },
			{ keys: 'space', function: 'Advance dialog' },
			{ keys: 'enter', function: 'Skip cutscene' },
		],
		execute() {
			keyboardLayouts.showLayout(keyboardLayouts.cutscene.id);

			if (Keyboard.isKeyPressed('Escape')) {
				window.pixiapp.togglePause();
			}
		},
	},
};

export default keyboardLayouts;
