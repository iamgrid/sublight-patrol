import c from './utils/constants';
import timing from './utils/timing';
import { getPosition, getStoreEntity } from './utils/helpers';
import idCreator from './utils/idCreator';
import Shot from './components/Shot';
import entities from './entities/entities';
import { moveTargetingReticule, shields } from './utils/helpers';
import soundEffects from './audio/soundEffects';
import formations from './behavior/formations';
import emp from './emp';
import hud from './hud';

const shots = {
	stageShots: {},
	handlers: {
		dispatch: null,
		state: null,
		stage: null,
		checkAgainstCurrentObjectives: null,
	}, // gets its values in App.js
	cannonStates: {},
	shootingIntervals: {},
	cannonCooldowns: {},
	shotRegenIntervals: {},
	candidates: {},
	hullDamageSoundEffects: {},
	lastEntitiesHitByPlayer: [],

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
			shots.registerEntityCannons(entityId);
		}

		window.clearInterval(shots.shotRegenIntervals[entityId]);

		shots.cannonStates[entityId].activeCannon = 0;

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

	registerEntityCannons(entityId) {
		// console.log('registerEntityCannons called for', entityId);
		const currentState = shots.handlers.state();
		let storeEntity = getStoreEntity(entityId, currentState);
		if (!storeEntity) {
			return;
		}

		shots.cannonStates[entityId] = {};
		shots.cannonStates[entityId].isShooting = false;
		shots.cannonStates[entityId].onCooldown = false;
		shots.cannonStates[entityId].activeCannon = 0;
		shots.cannonStates[entityId].maxShots = storeEntity.immutable.cannonShots;
		shots.cannonStates[entityId].remainingShots =
			storeEntity.immutable.cannonShots;
		shots.cannonStates[entityId].maxCannonCooldown =
			storeEntity.immutable.cannonCooldown;

		// console.log(
		// 	'remainingShots:',
		// 	shots.cannonStates[entityId].remainingShots
		// );
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

		if (timing.isPaused() || !timing.isEntityMovementEnabled()) return;

		if (shots.cannonStates[entityId] === undefined) return;

		if (shots.cannonStates[entityId].onCooldown) return;
		if (entities.stageEntities[entityId].isFlipping) return;

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
			storeEntity.immutable.colors.laserColor,
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
			console.log(
				`removeShot called with id ${id}, sightLine ${sightLine}, canceling`
			);
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

			if (entityId === 'destroyed_player') continue;

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
						callbackFn: (
							showType,
							hullHealthPrc,
							damageColor,
							wasPreviouslyInspected,
							fancyEffects
						) =>
							shots.showDamage(
								entityId,
								entityStore,
								showType,
								stageShot.origin,
								hullHealthPrc,
								damageColor,
								wasPreviouslyInspected,
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
		origin,
		hullHealthPrc,
		damageColor,
		wasPreviouslyInspected,
		fancyEffects
	) {
		switch (type) {
			case c.damageTypes.shieldDamage:
				entities.stageEntities[entityId].currentTint = damageColor;
				soundEffects.playOnce(entityId, soundEffects.library.shield_damage.id);
				break;

			case c.damageTypes.hullDamage: {
				entities.stageEntities[entityId].currentTint = damageColor;
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
				// despawn only runs after the blowUp animation finished,
				// so we have to unregister the entity from some modules right now
				shields.removeEntity(entityId);
				hud.removeEntity(entityId);
				const partOfFormationId = formations.isInFormation(entityId);
				if (partOfFormationId) {
					formations.removeEntityFromFormation(partOfFormationId, entityId);
				}
				soundEffects.removeAllSoundInstancesForEntity(entityId);

				let effect = soundEffects.library.misc_explosion.id;
				if (fancyEffects) {
					effect = soundEffects.library.ship_explosion.id;
				}
				soundEffects.playOnce(entityId, effect);

				if (entityStore !== 'player') {
					if (
						typeof shots.handlers.checkAgainstCurrentObjectives === 'function'
					) {
						shots.handlers.checkAgainstCurrentObjectives(
							entityId,
							c.objectiveTypes.destroyed.id,
							wasPreviouslyInspected
						);
					}
				}

				entities.stageEntities[entityId].blowUp(() => {
					// entities.stageEntities[entityId].hasBeenDestroyed = true;
					if (entityId !== 'destroyed_player')
						entities.despawn(entityId, entityStore, false);
				});

				if (entityStore === 'player') {
					moveTargetingReticule(null, entities.stageEntities);
					formations.cleanUp();
					emp.playerEMPIsOn = false;
				}

				console.info(`removing ${entityId} from state`);
				shots.handlers.dispatch({
					type: c.actions.REMOVE_ENTITY,
					id: entityId,
					store: entityStore,
					callbackFn: entities.playerShipDestruction,
				});
				break;
			}
		}

		if (type !== c.damageTypes.destruction) {
			const currentState = shots.handlers.state();
			if (origin === currentState.entities.player.id) {
				const lastTwo = shots.lastEntitiesHitByPlayer.slice(-2);

				if (
					currentState.game.targeting === null ||
					(lastTwo.every((el) => el === entityId) &&
						entityId !== currentState.game.targeting)
				) {
					shots.targetDamagedEntity(entityId);
				}

				shots.lastEntitiesHitByPlayer.push(entityId);
				if (shots.lastEntitiesHitByPlayer.length > 10)
					shots.lastEntitiesHitByPlayer = lastTwo;
			}
		}
	},

	targetDamagedEntity(entityId) {
		shots.handlers.dispatch({
			type: c.actions.TARGET,
			do: 'specified',
			targetId: entityId,
			callbackFn: () => moveTargetingReticule(entityId, entities.stageEntities),
		});
	},

	cleanUp() {
		for (const stageShotId in shots.stageShots) {
			const stageShot = shots.stageShots[stageShotId];
			shots.handlers.stage.removeChild(stageShot);
			stageShot.hasBeenDestroyed = true;
			stageShot.destroy();
		}

		shots.stageShots = {};
		shots.cannonStates = {};
		shots.cannonCooldowns = {};
		shots.lastEntitiesHitByPlayer = [];
		shots.zIndexIterator = c.zIndices.shots;
	},
};

export default shots;
