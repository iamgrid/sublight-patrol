import c from './utils/constants';
import { getPosition } from './utils/helpers';
import idCreator from './utils/idCreator';
import Shot from './components/Shot';

const shots = {
	stageShots: {},
	handlers: { dispatch: null, state: null, stage: null }, // gets its values in App.js
	shootingIntervals: {},

	startShooting(entityId) {
		shots.shootingIntervals[entityId] = window.setInterval(
			() => shots.shoot(entityId),
			250
		);
		console.log(shots.shootingIntervals);
	},
	stopShooting(entityId) {
		window.clearInterval(shots.shootingIntervals[entityId]);
		console.log(shots.shootingIntervals);
	},

	shoot(entityId) {
		const currentState = shots.handlers.state();
		// const entityIdx = currentState.entities.findIndex(entity => entity.id === entityId);
		console.log(
			`${entityId} tries to fire a shot!`,
			getPosition(entityId, currentState.positions)
		);
	},

	addShot(posX, posY, color, power, direction) {
		const shotId = idCreator.create();
		const stageShot = new Shot({
			id: shotId,
			color: color,
			power: power,
			posX: posX,
			posY: posY,
			direction: direction,
			callbackFn: (shotId, sightLine) => shots.removeShot(shotId, sightLine),
		});

		shots.handlers.dispatch({
			type: c.actions.ADD_SHOT,
			id: shotId,
			sightLine: posY,
		});

		shots.stageShots[shotId] = stageShot;

		shots.handlers.stage.addChild(stageShot);
	},

	removeShot(id, sightLine) {
		const stageShot = shots.stageShots[id];
		console.log(`removing shot ${id}`);
		shots.handlers.stage.removeChild(stageShot);
		stageShot.hasBeenDestroyed = true;
		stageShot.destroy();
		shots.handlers.dispatch({
			type: c.actions.REMOVE_SHOT,
			id: id,
			sightLine: sightLine,
		});
	},
};

export default shots;
