import { getPosition } from './utils/helpers';
import { calculateDistance } from './utils/formulas';
import c from './utils/constants';

const emp = {
	playerEMPIsOn: false,
	handlers: { dispatch: null, state: null, stageEntities: null }, // gets its values in App.js

	toggleEMP(entityId, toggle = true) {
		if (emp.playerEMPIsOn === toggle) return;

		emp.handlers.stageEntities[entityId].toggleEMP(toggle);
		emp.playerEMPIsOn = toggle;
	},

	handleEMPDamage() {
		if (!emp.playerEMPIsOn) return;

		let currentState = emp.handlers.state();

		const playerId = currentState.entities.player.id;
		const empReach = c.empReach;

		const [playerX, playerY] = getPosition(playerId, currentState.positions);

		const damagedEntities = [];
		currentState.entities.targetable.forEach((entity) => {
			if (entity.isDisabled) return;

			if (entity.immutable.hasShields) {
				if (entity.shieldStrength > 30) return;
			}

			const [entityX, entityY] = getPosition(entity.id, currentState.positions);

			if (calculateDistance(playerX, playerY, entityX, entityY) < empReach) {
				damagedEntities.push(entity.id);
			}
		});

		if (damagedEntities.length > 0) {
			emp.handlers.dispatch({
				type: c.actions.EMP_DAMAGE,
				damagedEntities: damagedEntities,
			});
		}
	},
};

export default emp;
