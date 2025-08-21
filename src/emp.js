import { getPosition, alertsAndWarnings } from './utils/helpers';
import { calculateDistance } from './utils/formulas';
import c from './utils/constants';
import soundEffects from './audio/soundEffects';
import entities from './entities/entities';
import shots from './shots';
import formations from './behavior/formations';
import timing from './utils/timing';

const emp = {
	playerHasEMP: true,
	playerEMPIsOn: false,
	handlers: {
		dispatch: null,
		state: null,
		checkAgainstCurrentObjectives: null,
	}, // gets its values in App.js

	toggleEMP(entityId, toggle = true) {
		if (emp.playerEMPIsOn === toggle) return;

		if (!emp.playerHasEMP) {
			alertsAndWarnings.add(c.alertsAndWarnings.warnings.no_emp);
			timing.setTimeout(
				() => {
					alertsAndWarnings.remove(c.alertsAndWarnings.warnings.no_emp);
				},
				timing.modes.play,
				4000
			);
			return;
		}

		entities.stageEntities[entityId].toggleEMP(toggle);
		emp.playerEMPIsOn = toggle;

		if (toggle) {
			soundEffects.startLoop(entityId, soundEffects.library.emp.id);
		} else {
			soundEffects.stopLoop(entityId, soundEffects.library.emp.id);
		}
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
				if (entity.shieldStrength > c.shieldEMPProtectionThreshold) return;
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
				callbackFn: emp.disableStageEntities,
			});
		}
	},

	disableStageEntities(newlyDisabledEntities) {
		const functionSignature = 'emp.js@disableStageEntities()';
		if (newlyDisabledEntities.length < 1) return;

		console.log(
			functionSignature,
			'newly disabled entities:',
			newlyDisabledEntities
		);

		newlyDisabledEntities.forEach((entityId) => {
			if (entities.stageEntities[entityId] !== undefined) {
				entities.stageEntities[entityId].isDisabled = true;
				entities.stageEntities[entityId].currentLatVelocity = 0;
				entities.stageEntities[entityId].currentLongVelocity = 0;
				entities.stageEntities[entityId].latVelocity = 0;
				entities.stageEntities[entityId].longVelocity = 0;
			}
			shots.stopShooting(entityId);

			soundEffects.removeAllSoundInstancesForEntity(entityId);
			soundEffects.playOnce(entityId, soundEffects.library.emp_sys_dropout.id);

			const formationId = formations.isInFormation(entityId);
			if (formationId) {
				console.log(
					functionSignature,
					'entity',
					entityId,
					'is in formation',
					formationId,
					'attempting to remove...'
				);
				formations.removeEntityFromFormation(formationId, entityId);
			}

			if (typeof emp.handlers.checkAgainstCurrentObjectives === 'function') {
				emp.handlers.checkAgainstCurrentObjectives(entityId, 'disabled');
			}
		});
	},
};

export default emp;
