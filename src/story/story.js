import c from '../utils/constants';
import scene001 from './scenes/scene001';
import plates from '../plates';
import timing from '../utils/timing';
import hud from '../hud';

const story = {
	handlers: { dispatch: null, state: null }, // gets its values in App.js
	sceneList: [{ id: '001', sceneObject: scene001 }],
	playerShipId: 'red_1',
	playerShipSuffixes: ['a', 'b', 'c', 'd'],
	currentScene: null,
	currentSceneBeat: null,

	advance(nextScene = null, nextSceneBeat = 0) {
		const currentState = story.handlers.state();

		let cleanUpNeeded = false;

		let nextPlayerShip = currentState.game.playerShips.next;
		if (nextPlayerShip === null) nextPlayerShip = 0;
		const playerId =
			story.playerShipId + story.playerShipSuffixes[nextPlayerShip];
		const playerShipType =
			currentState.game.playerShips.orderedHangar[nextPlayerShip];

		if (story.currentScene === null) {
			story.currentScene = story.sceneList[0].id;
		} else {
			if (nextSceneBeat === 0) cleanUpNeeded = true;
			if (nextScene !== null) {
				story.currentScene = nextScene;
			} else {
				let oldIndex = story.sceneList.findIndex(
					(el) => el.id === story.currentScene
				);
				story.currentScene = story.sceneList[oldIndex + 1];
			}
		}

		const currentSceneObject = story.sceneList.find(
			(el) => el.id === story.currentScene
		).sceneObject;

		let currentStateScene = currentState.game.currentScene;
		if (currentStateScene !== story.currentScene) {
			story.handlers.dispatch({
				type: c.actions.SET_CURRENT_SCENE,
				newCurrentScene: story.currentScene,
			});
		}

		story.currentSceneBeat = nextSceneBeat;

		const currentSceneBeatObj =
			currentSceneObject.storyBeats[story.currentSceneBeat];

		console.log(
			'currentScene:',
			story.currentScene,
			currentSceneObject,
			'currentSceneBeat:',
			story.currentSceneBeat
		);

		if (cleanUpNeeded) story.cleanUp();

		plates.fullMatte();

		currentSceneBeatObj.execute(playerId, playerShipType);

		if (currentSceneBeatObj.cameraMode === c.cameraModes.gameplay) {
			// toggle HUD
			timing.setTrigger(
				'appjs-1st-trigger',
				() => {
					hud.toggle(true);
				},
				timing.modes.play,
				2000
			);
		} else {
			hud.toggle(false);
		}

		plates.fadeOutMatte(50);
	},

	cleanUp() {
		console.log('story.cleanUp() called');
	},
};

export default story;
