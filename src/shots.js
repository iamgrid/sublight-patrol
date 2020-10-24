import c from './utils/constants';
import { getPosition } from './utils/helpers';
import idCreator from './utils/idCreator';
import Shot from './components/Shot';

const shots = {
	stageShots: {},
	handlers: { dispatch: null, state: null, stage: null }, // gets its values in App.js
	cannonStates: {},
	shootingIntervals: {},
	cannonCooldowns: {},
	shotRegenIntervals: {},
	zIndexIterator: c.zIndices.shots,

	getStoreEntity(entityId, currentState) {
		if (entityId === currentState.entities.player.id) {
			return currentState.entities.player;
		} else {
			const storeEntity = currentState.entities.targetable.find(
				(entity) => entity.id === entityId
			);
			if (!storeEntity) console.error(`Couldn't find ${entityId}`);
			return storeEntity;
		}
	},

	startShooting(entityId) {
		const currentState = shots.handlers.state();
		let storeEntity = shots.getStoreEntity(entityId, currentState);
		if (!storeEntity) {
			return;
		}

		if (!shots.cannonStates[entityId]) {
			shots.cannonStates[entityId] = {};
			shots.cannonStates[entityId].maxShots = storeEntity.immutable.cannonShots;
			shots.cannonStates[entityId].maxCannonCooldown =
				storeEntity.immutable.cannonCooldown;
		}

		window.clearInterval(shots.shotRegenIntervals[entityId]);

		shots.cannonStates[entityId].activeCannon = 0;
		if (!shots.cannonStates[entityId].remainingShots) {
			// shooting for the first time
			shots.cannonStates[entityId].remainingShots =
				storeEntity.immutable.cannonShots;
			shots.cannonStates[entityId].onCooldown = false;
		}

		// immediate first shot
		shots.shoot(entityId);

		// keep shooting
		const shotFrequency =
			(storeEntity.immutable.cannonFiringSpeed /
				storeEntity.immutable.cannonPositions.length) *
			1000;
		shots.shootingIntervals[entityId] = window.setInterval(
			() => shots.shoot(entityId),
			shotFrequency
		);
	},

	stopShooting(entityId) {
		/*console.log(
			`${entityId} stopped shooting, remaining shots: ${shots.cannonStates[entityId].remainingShots}`
		);*/
		window.clearInterval(shots.shootingIntervals[entityId]);
		if (!shots.cannonStates[entityId].onCooldown) {
			shots.triggerShotRegen(entityId);
		}
	},

	triggerShotRegen(entityId) {
		const regenInterval = Math.trunc(
			(shots.cannonStates[entityId].maxCannonCooldown /
				shots.cannonStates[entityId].maxShots) *
				1000
		);

		shots.shotRegenIntervals[entityId] = window.setInterval(() => {
			if (
				shots.cannonStates[entityId].remainingShots <
				shots.cannonStates[entityId].maxShots
			) {
				shots.cannonStates[entityId].remainingShots++;
				// console.log(`regen - ${shots.cannonStates[entityId].remainingShots}`);
			} else {
				window.clearInterval(shots.shotRegenIntervals[entityId]);
			}
		}, regenInterval);
	},

	shoot(entityId) {
		const currentState = shots.handlers.state();
		let storeEntity = shots.getStoreEntity(entityId, currentState);
		if (!storeEntity) {
			return;
		}

		if (!shots.cannonStates[entityId].onCooldown) {
			shots.cannonStates[entityId].onCooldown = false;
			const activeCannon = shots.cannonStates[entityId].activeCannon;
			const [eX, eY] = getPosition(entityId, currentState.positions);
			const cannonX = Math.round(
				eX +
					storeEntity.facing *
						storeEntity.immutable.cannonPositions[activeCannon].lengthWise
			);

			let correction = 0;
			if (storeEntity.immutable.cannonPositions[activeCannon].widthWise < 0)
				correction = -2;
			const cannonY = Math.round(
				eY +
					storeEntity.facing *
						storeEntity.immutable.cannonPositions[activeCannon].widthWise +
					correction
			);

			shots.addShot(
				cannonX,
				cannonY,
				storeEntity.immutable.cannonColor,
				storeEntity.immutable.cannonPower,
				storeEntity.facing
			);

			// cycle cannons on the ship
			const noOfCannons = storeEntity.immutable.cannonPositions.length;
			if (noOfCannons > 1) {
				shots.cannonStates[entityId].activeCannon++;
				if (shots.cannonStates[entityId].activeCannon >= noOfCannons)
					shots.cannonStates[entityId].activeCannon = 0;
			}

			// decrease remaining shots or trigger cooldown
			shots.cannonStates[entityId].remainingShots--;
			if (shots.cannonStates[entityId].remainingShots === 0) {
				shots.triggerCooldown(
					entityId,
					storeEntity.immutable.cannonCooldown,
					storeEntity.immutable.cannonShots
				);
			}
		} else {
			// console.log(`${entityId}'s cannon is on cooldown!`);
		}
	},

	triggerCooldown(entityId, cannonCooldown, maxShots) {
		shots.cannonStates[entityId].onCooldown = true;
		shots.cannonCooldowns[entityId] = window.setTimeout(() => {
			shots.cannonStates[entityId].remainingShots = maxShots;
			shots.cannonStates[entityId].onCooldown = false;
		}, cannonCooldown * 1000);
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

		stageShot.zIndex = shots.zIndexIterator;

		shots.stageShots[shotId] = stageShot;

		shots.handlers.stage.addChild(stageShot);
		shots.zIndexIterator++;
		if (shots.zIndexIterator > c.zIndices.shots - 100)
			shots.zIndexIterator = c.zIndices.shots;
	},

	removeShot(id, sightLine) {
		const stageShot = shots.stageShots[id];
		// console.log(`removing shot ${id}`);
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
