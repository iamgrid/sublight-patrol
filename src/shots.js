import c from './utils/constants';
import timing from './utils/timing';
import { getPosition, getStoreEntity } from './utils/helpers';
import idCreator from './utils/idCreator';
import Shot from './components/Shot';
import entities from './entities/entities';
import { moveTargetingReticule } from './utils/helpers';
import soundEffects from './audio/soundEffects';
import formations from './behavior/formations';

const shots = {
	stageShots: {},
	handlers: {
		dispatch: null,
		state: null,
		stage: null,
		stageEntities: null,
	}, // gets its values in App.js
	cannonStates: {},
	shootingIntervals: {},
	cannonCooldowns: {},
	shotRegenIntervals: {},
	candidates: {},
	hullDamageSoundEffects: {},

	zIndexIterator: c.zIndices.shots,

	startShooting(entityId) {
		const currentState = shots.handlers.state();
		let storeEntity = getStoreEntity(entityId, currentState);
		if (!storeEntity) {
			return;
		}

		if (shots.cannonStates[entityId] !== undefined) {
			if (shots.cannonStates[entityId].isShooting) return; // already started shooting
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

		shots.cannonStates[entityId].isShooting = true;

		// immediate first shot
		shots.shoot(entityId);

		// create an interval that keeps shooting
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

		if (shots.cannonStates[entityId] === undefined) return;

		if (!shots.cannonStates[entityId].isShooting) return; // already stopped shooting

		shots.cannonStates[entityId].isShooting = false;

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
				if (!timing.isPaused()) shots.cannonStates[entityId].remainingShots++;
				// console.log(`regen - ${shots.cannonStates[entityId].remainingShots}`);
			} else {
				window.clearInterval(shots.shotRegenIntervals[entityId]);
			}
		}, regenInterval);
	},

	shoot(entityId) {
		const currentState = shots.handlers.state();
		let storeEntity = getStoreEntity(entityId, currentState);
		if (!storeEntity) {
			// entity no longer present, time to stop it from shooting
			window.clearInterval(shots.shootingIntervals[entityId]);
			window.clearInterval(shots.shotRegenIntervals[entityId]);
			return;
		}

		if (timing.isPaused()) return;
		if (shots.cannonStates[entityId].onCooldown) return;
		if (shots.handlers.stageEntities[entityId].isFlipping) return;

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

		// play sound effect
		soundEffects.playOnce(entityId, storeEntity.immutable.cannonSoundEffect);
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
		if (shots.zIndexIterator > c.zIndices.shots + 99900)
			shots.zIndexIterator = c.zIndices.shots;
	},

	removeShot(id, sightLine, callbackFn = null) {
		if (!id || !Number.isFinite(sightLine)) {
			console.error(`removeShot called with id ${id}, sightLine ${sightLine}`);
			return;
		}
		const stageShot = shots.stageShots[id];
		shots.handlers.stage.removeChild(stageShot);
		stageShot.hasBeenDestroyed = true;
		stageShot.destroy();
		delete shots.stageShots[id];
		shots.handlers.dispatch({
			type: c.actions.REMOVE_SHOT,
			id: id,
			sightLine: sightLine,
			callbackFn: callbackFn,
		});
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
								candidates[entityId] = [slKey];
							} else {
								candidates[entityId].push(slKey);
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
			const entityId = cKey;
			const entitySightLines = candidates[entityId];
			let hittingShots = [];
			entitySightLines.forEach((sightLine) => {
				const sightLineShots = sightLines[sightLine];
				const entityCenterX = positions[`${entityId}--posX`];
				const entityCenterY = positions[`${entityId}--posY`];
				const entity = entities.find((ent) => ent.id === entityId);
				const entityWidth = entity.immutable.width;
				const entityLength = entity.immutable.length;

				const hittingShotsInSightLine = sightLineShots.filter((shotId) => {
					const stageShot = stageShots[shotId];

					if (stageShot === undefined) return false;

					const shotX = stageShot.position.x;
					const shotY = sightLine;

					if (!shotX || !shotY) {
						console.error({ shotX, shotY });
					}

					const shotOrigin = stageShot.origin;

					// disabling self hits
					if (shotOrigin === entityId) return false;

					const hitTest = shots.checkCollisionEllipsePoint(
						shotX,
						shotY,
						entityCenterX,
						entityCenterY,
						entityWidth,
						entityLength
					);

					/*stageShot.hitTests.push({
						entity: entityId,
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
				if (hittingShotsInSightLine.length > 0)
					hittingShots = [...hittingShots, ...hittingShotsInSightLine];
			});

			if (hittingShots.length > 0) {
				entitiesSufferingHits[entityId] = hittingShots;
			}
		}

		// damage to state and destroy hitting shots
		for (const heKey in entitiesSufferingHits) {
			const hittingShots = entitiesSufferingHits[heKey];
			hittingShots.forEach((hittingShotId) => {
				const stageShot = stageShots[hittingShotId];

				if (stageShot === undefined) return;

				const sightLine = stageShot.sightLine;

				const shotDamage = stageShot.power;
				const entityId = heKey;
				const entity = entities.find((ent) => ent.id === entityId);
				const entityStore = entity.store;

				/*console.log(
					`entity ${heKey} shot by ${hittingShotId} on sightline ${sightLine}`
					);*/

				// destroy shot
				shots.removeShot(hittingShotId, sightLine, () => {
					// then do damage
					shots.handlers.dispatch({
						type: c.actions.DAMAGE,
						entityStore: entityStore,
						entityId: entityId,
						shotDamage: shotDamage,
						origin: stageShot.origin,
						callbackFn: (showType, hullHealthPrc, fancyEffects) =>
							shots.showDamage(
								entityId,
								entityStore,
								showType,
								shots.handlers.stageEntities,
								stageShot.origin,
								hullHealthPrc,
								fancyEffects
							),
					});
				});
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

	showDamage(
		entityId,
		entityStore,
		type,
		stageEntities,
		origin,
		hullHealthPrc,
		fancyEffects
	) {
		switch (type) {
			case c.damageTypes.shieldDamage:
				stageEntities[entityId].currentTint = 0x32ade6;
				soundEffects.playOnce(entityId, soundEffects.library.shield_damage.id);
				break;

			case c.damageTypes.hullDamage: {
				stageEntities[entityId].currentTint = 0xff9090;
				let variant = -1;
				let effect = soundEffects.library.misc_damage.id;
				if (fancyEffects) {
					effect = soundEffects.library.hull_damage_high_health.id;
					if (hullHealthPrc < 33) {
						effect = soundEffects.library.hull_damage_low_health.id;
						if (shots.hullDamageSoundEffects[entityId] === undefined) {
							shots.hullDamageSoundEffects[entityId] = 0;
						}

						if (
							shots.hullDamageSoundEffects[entityId] <
							soundEffects.library.hull_damage_sys_dropout.variants
						) {
							shots.hullDamageSoundEffects[entityId]++;
							effect = soundEffects.library.hull_damage_sys_dropout.id;
							variant = shots.hullDamageSoundEffects[entityId];
						} else {
							effect = soundEffects.library.hull_damage_low_health.id;
						}
					}
				}
				soundEffects.playOnce(entityId, effect, variant);
				break;
			}
			case c.damageTypes.destruction: {
				let effect = soundEffects.library.misc_explosion.id;
				if (fancyEffects) {
					effect = soundEffects.library.ship_explosion.id;
				}

				// despawn only runs after the blowUp animation finished,
				// so we have to unregister the entity from some modules right now
				const partOfFormationId = formations.isInFormation(entityId);
				if (partOfFormationId) {
					formations.removeEntityFromFormation(partOfFormationId, entityId);
				}
				soundEffects.removeAllSoundInstancesFromEntity(entityId);

				soundEffects.playOnce(entityId, effect);

				stageEntities[entityId].blowUp(() => {
					// shots.handlers.stageEntities[entityId].hasBeenDestroyed = true;
					entities.despawn(entityId, false);
				});

				console.info(`removing ${entityId} from state`);
				shots.handlers.dispatch({
					type: c.actions.REMOVE_ENTITY,
					id: entityId,
					store: entityStore,
				});
				break;
			}
		}

		if (type !== c.damageTypes.destruction) {
			const currentState = shots.handlers.state();
			if (currentState.game.targeting === null) {
				if (origin === currentState.entities.player.id) {
					shots.targetDamagedEntity(entityId);
				}
			}
		}
	},

	targetDamagedEntity(entityId) {
		shots.handlers.dispatch({
			type: c.actions.TARGET,
			do: 'specified',
			targetId: entityId,
			callbackFn: () =>
				moveTargetingReticule(entityId, shots.handlers.stageEntities),
		});
	},
};

export default shots;
