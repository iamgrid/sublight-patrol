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
	candidates: {},

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
				storeEntity.facing,
				storeEntity.id
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

	addShot(posX, posY, color, power, direction, origin = null) {
		const shotId = idCreator.create();
		const stageShot = new Shot({
			id: shotId,
			color: color,
			power: power,
			posX: posX,
			posY: posY,
			direction: direction,
			origin: origin,
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
		if (shots.zIndexIterator > c.zIndices.entities - 100)
			shots.zIndexIterator = c.zIndices.shots;
	},

	removeShot(id, sightLine) {
		if (!id || !sightLine) {
			console.error(`removeShot called with id ${id}, sightLine ${sightLine}`);
			return;
		}
		const stageShot = shots.stageShots[id];
		shots.handlers.stage.removeChild(stageShot);
		stageShot.hasBeenDestroyed = true;
		stageShot.destroy();
		shots.handlers.dispatch({
			type: c.actions.REMOVE_SHOT,
			id: id,
			sightLine: sightLine,
		});
		delete shots.stageShots[id];
	},

	detectCollisions() {
		const currentState = shots.handlers.state();
		const sightLines = currentState.shots.sightLines;
		const entities = [
			currentState.entities.player,
			...currentState.entities.targetable,
			...currentState.entities.other,
		];
		const positions = {
			...currentState.positions.canMove,
			...currentState.positions.cantMove,
		};
		const stageShots = shots.stageShots;

		// entities that are in the sightline of a shot
		let candidates = {};
		for (const posKey in positions) {
			const [entityId, posV] = posKey.split('--');
			if (posV === 'posY') {
				const entityY = positions[posKey];
				const entity = entities.find((ent) => ent.id === entityId);
				if (entity !== undefined) {
					const entityWidth = entity.immutable.width;
					const entityTop = entityY - entityWidth / 2;
					const entityBottom = entityY + entityWidth / 2;

					for (const slKey in sightLines) {
						const shotsInSightLine = sightLines[slKey];
						// console.log({ slKey, entityTop, entityBottom, shotsInSightLine });
						if (
							slKey >= entityTop &&
							slKey <= entityBottom &&
							shotsInSightLine.length > 0
						) {
							if (!candidates[entityId]) {
								candidates[entityId] = [...shotsInSightLine];
							} else {
								candidates[entityId] = [
									...candidates[entityId],
									...shotsInSightLine,
								];
							}
						}
					}
				}
			}
		}

		// shots.candidates = candidates;

		// checking collisions on candidates
		const entitiesSufferingHits = {};
		for (const cKey in candidates) {
			const shotIds = candidates[cKey];
			const entityCenterX = positions[`${cKey}--posX`];
			const entityCenterY = positions[`${cKey}--posY`];
			const entity = entities.find((ent) => ent.id === cKey);
			const entityWidth = entity.immutable.width;
			const entityLength = entity.immutable.length;

			const hittingShots = shotIds.filter((shotId) => {
				const stageShot = stageShots[shotId];
				const shotX = stageShot.position.x;
				const shotY = stageShot.position.y;

				if (!shotX || !shotY) {
					console.error({ shotX, shotY });
				}

				const shotOrigin = stageShot.origin;

				// disabling self hits
				if (shotOrigin === cKey) return false;

				const hitTest = shots.checkCollisionEllipsePoint(
					shotX,
					shotY,
					entityCenterX,
					entityCenterY,
					entityWidth,
					entityLength
				);

				/*stageShot.hitTests.push({
					entity: cKey,
					result: hitTest,
					shotX: shotX,
					shotY: shotY,
					entityCenterX: entityCenterX,
					entityCenterY: entityCenterY,
					entityWidth: entityWidth,
					entityLength: entityLength,
				});*/

				return hitTest;
			});

			if (hittingShots.length > 0) {
				entitiesSufferingHits[cKey] = hittingShots;
			}
		}

		// damage to state and destroy hitting shots
		for (const heKey in entitiesSufferingHits) {
			const hittingShots = entitiesSufferingHits[heKey];
			hittingShots.forEach((shotId) => {
				const stageShot = stageShots[shotId];
				const sightLine = stageShot.sightLine;

				// do damage
				const shotDamage = stageShot.power;
				const entityId = heKey;
				const entity = entities.find((ent) => ent.id === entityId);
				const entityStore = entity.store;

				shots.handlers.dispatch({
					type: c.actions.DAMAGE,
					entityStore: entityStore,
					entityId: entityId,
					shotDamage: shotDamage,
					callbackFn: (showType) =>
						shots.showDamage(entityId, entityStore, showType),
				});

				// destroy shot
				/*console.log(
					`entity ${heKey} shot by ${shotId} on sightline ${sightLine}`
				);*/
				shots.removeShot(shotId, sightLine);
			});
		}
	},

	checkCollisionEllipsePoint(
		shotX,
		shotY,
		entityCenterX,
		entityCenterY,
		entityWidth,
		entityLength
	) {
		const calc =
			Math.pow(shotX - entityCenterX, 2) / Math.pow(entityLength / 2, 2) +
			Math.pow(shotY - entityCenterY, 2) / Math.pow(entityWidth / 2, 2);

		if (calc < 1) return true;
		return false;
	},

	showDamage(entityId, entityStore, type) {
		console.log({ entityId, type });

		if (type === c.damageTypes.destruction) {
			shots.handlers.dispatch({
				type: c.actions.REMOVE_ENTITY,
				id: entityId,
				store: entityStore,
			});
		}
	},
};

export default shots;
