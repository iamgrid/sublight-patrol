import c from '../utils/constants';
import shots from '../shots';
import { calculateDistance } from '../utils/formulas';
import {
	isEmptyObject,
	getPosition,
	getVelocity,
	getStoreEntity,
	flipStageEntity,
	updateStageEntityVelocities,
} from '../utils/helpers';

const behavior = {
	handlers: { dispatch: null, state: null, stageEntities: null }, // gets its values in App.js
	possibleGoals: {
		playerDetermined: 'playerDetermined',
		holdStation: 'holdStation',
		maintainVelocity: 'maintainVelocity',
		guardEntity: 'guardEntity',
		flee: 'flee',
		destroyEntity: 'destroyEntity',
		defendEntity: 'defendEntity',
	},
	maxShotTravelDistance: 1000,
	hullHealthPrcToFleeAt: 30,
	widthOfWidestEntityInTheGame: 49,

	tick() {
		const currentState = this.handlers.state();

		const playerId = currentState.entities.player.id;

		const entityStoreUpdates = {};
		const stageVelocityUpdates = {};
		const stateVelocityUpdates = {};

		let updatedSomething = false;

		currentState.entities.targetable.forEach((entity) => {
			if (!entity.immutable.hasBehavior || entity.isDisabled) return;

			// this entity is allowed to make a decision right now
			let updatesToEntity = [];
			switch (entity.playerRelation) {
				case 'friendly': {
					if (
						entity.behaviorLastHitOrigin === playerId &&
						entity.behaviorHitsSuffered > 4 &&
						entity.behaviorCurrentGoal !== behavior.possibleGoals.flee &&
						entity.behaviorAllowedToFlee
					) {
						updatesToEntity = behavior.flee(entity, currentState);
					}
					break;
				}
				default: {
					const hullHealthPrc = Math.trunc(
						(entity.hullStrength / entity.immutable.maxHullStrength) * 100
					);

					if (
						(entity.behaviorAllowedToFlee ||
							entity.assignedPlayerRelation !== 'hostile') &&
						(hullHealthPrc < behavior.hullHealthPrcToFleeAt ||
							!entity.immutable.hasCannons)
					) {
						updatesToEntity = behavior.flee(entity, currentState);
					} else {
						let itsGoTimeBuddy = false;

						const [playerX, playerY] = getPosition(
							playerId,
							currentState.positions
						);
						const [entityX, entityY] = getPosition(
							entity.id,
							currentState.positions
						);
						const distance = Math.trunc(
							calculateDistance(playerX, playerY, entityX, entityY)
						);

						if (
							entity.behaviorHitsSuffered > 0 &&
							entity.behaviorLastHitOrigin === playerId
						) {
							itsGoTimeBuddy = true;
						}

						if (
							entity.playerRelation === 'hostile' &&
							distance < behavior.maxShotTravelDistance - 200
						) {
							itsGoTimeBuddy = true;
						}

						if (itsGoTimeBuddy) {
							updatesToEntity = behavior.destroyEntity(
								entity,
								playerId,
								currentState,
								playerX,
								playerY,
								entityX,
								entityY,
								distance
							);
						}
					}

					break;
				}
			}

			if (updatesToEntity.length > 0) {
				if (!isEmptyObject(updatesToEntity[0])) {
					updatedSomething = true;
					entityStoreUpdates[entity.id] = updatesToEntity[0];
				}
				if (!isEmptyObject(updatesToEntity[1])) {
					updatedSomething = true;
					stageVelocityUpdates[entity.id] = updatesToEntity[1];
					stateVelocityUpdates[`${entity.id}--latVelocity`] =
						updatesToEntity[1].latVelocity;
					stateVelocityUpdates[`${entity.id}--longVelocity`] =
						updatesToEntity[1].longVelocity;
				}
			}
		});

		function updateSEV() {
			behavior.updateChangedStageEntityVelocities(stageVelocityUpdates);
		}

		if (updatedSomething) {
			behavior.handlers.dispatch({
				type: c.actions.BEHAVIOR_RELATED_UPDATES,
				entityStoreUpdates: entityStoreUpdates,
				velocityUpdates: stateVelocityUpdates,
				callbackFn: updateSEV,
			});
		}
	},

	// BEHAVIORS //

	flee(entity, currentState) {
		const entityId = entity.id;
		shots.stopShooting(entityId);
		const entityStoreUpdates = {};

		const [needsToFlip, newFacing] = behavior._turn(
			'away-from',
			entity,
			entity.behaviorLastHitOrigin,
			currentState.positions
		);

		if (needsToFlip) {
			entityStoreUpdates.facing = newFacing;
			flipStageEntity(entityId, behavior.handlers.stageEntities, newFacing);
		}

		const velocityUpdates = {};
		if (
			getVelocity(entityId, currentState.velocities) !==
			newFacing * entity.immutable.thrusters.main
		) {
			velocityUpdates.latVelocity = 0;
			velocityUpdates.longVelocity =
				newFacing * entity.immutable.thrusters.main;
		}

		if (entity.behaviorCurrentGoal !== behavior.possibleGoals.flee)
			entityStoreUpdates.behaviorCurrentGoal = behavior.possibleGoals.flee;

		return [entityStoreUpdates, velocityUpdates];
	},

	destroyEntity(
		entity,
		enemyId,
		currentState,
		enemyX,
		enemyY,
		entityX,
		entityY
	) {
		const entityId = entity.id;
		const entityStoreUpdates = {};

		const [needsToFlip, newFacing] = behavior._turn(
			'toward',
			entity,
			enemyId,
			currentState.positions,
			{ entityX, enemyX }
		);

		if (needsToFlip) {
			entityStoreUpdates.facing = newFacing;
			flipStageEntity(entityId, behavior.handlers.stageEntities, newFacing);
		}

		let newLatVelocity = 0;
		let newLongVelocity = 0;

		const longDistance = Math.abs(enemyX - entityX);
		if (longDistance > entity.behaviorPreferredAttackDistance) {
			// try to move into range with the enemy horizontally
			// attempt to match velocity with the enemy if its also moving
			const enemyLongVel = Math.abs(
				getVelocity(enemyId, currentState.velocities)[1]
			);
			const maxLongVelocity = entity.immutable.thrusters.main;
			newLongVelocity = newFacing * Math.min(enemyLongVel, maxLongVelocity);
		}

		const latDifference = enemyY - entityY;
		if (Math.abs(latDifference) > 20) {
			// try to move into sightline with the enemy
			shots.stopShooting(entityId);
			newLatVelocity = entity.immutable.thrusters.side;
			if (latDifference < 0) {
				newLatVelocity = 0 - newLatVelocity;
			}
		} else {
			if (longDistance < behavior.maxShotTravelDistance) {
				const entitiesInShotRange = behavior._returnEntitiesInShotRange(
					entityId,
					entityX,
					entityY,
					newFacing,
					currentState
				);

				if (
					entitiesInShotRange.length === 1 &&
					entitiesInShotRange[0] === enemyId
				) {
					shots.startShooting(entityId);
				}
			}
		}

		const velocityUpdates = {
			latVelocity: newLatVelocity,
			longVelocity: newLongVelocity,
		};

		if (entity.behaviorAttacking !== enemyId) {
			entityStoreUpdates.playerRelation = 'hostile';
			behavior.handlers.stageEntities[entityId].reticuleRelation('hostile');
			entityStoreUpdates.behaviorAttacking = enemyId;
			entityStoreUpdates.behaviorCurrentGoal =
				behavior.possibleGoals.destroyEntity;
		}

		return [entityStoreUpdates, velocityUpdates];
	},

	// HELPER METHODS //

	_turn(dir = 'toward', entity, enemyId, positions, havePositions = null) {
		const currentFacing = entity.facing;
		let newFacing = currentFacing;
		let needsToFlip = false;

		let entityX = null;
		let enemyX = null;
		if (havePositions) {
			entityX = havePositions.entityX;
			enemyX = havePositions.enemyX;
		} else {
			[entityX] = getPosition(entity.id, positions);
			if (!entityX) return [false, 1];
			[enemyX] = getPosition(enemyId, positions);
		}

		if (enemyX < entityX) {
			// the enemy is on the left
			if (currentFacing === -1 && dir === 'away-from') {
				newFacing = 1;
				needsToFlip = true;
			} else if (currentFacing === 1 && dir === 'toward') {
				newFacing = -1;
				needsToFlip = true;
			}
		} else if (enemyX > entityX) {
			// the enemy is on the right
			if (currentFacing === 1 && dir === 'away-from') {
				newFacing = -1;
				needsToFlip = true;
			} else if (currentFacing === -1 && dir === 'toward') {
				newFacing = 1;
				needsToFlip = true;
			}
		}

		return [needsToFlip, newFacing];
	},

	_returnEntitiesInShotRange(entityId, entityX, entityY, facing, currentState) {
		let xRangeMin = entityX - behavior.maxShotTravelDistance;
		let xRangeMax = entityX;
		if (facing === 1) {
			xRangeMin = entityX;
			xRangeMax = entityX + behavior.maxShotTravelDistance;
		}

		let yTolerance = Math.ceil(behavior.widthOfWidestEntityInTheGame / 2);
		let yRangeMin = entityY - yTolerance;
		let yRangeMax = entityY + yTolerance;

		let candidates = {};
		for (const store in currentState.positions) {
			for (const entityPos in currentState.positions[store]) {
				const [currentEntityId, whichPos] = entityPos.split('--');
				if (whichPos === 'posX') {
					if (
						currentState.positions[store][entityPos] > xRangeMin &&
						currentState.positions[store][entityPos] < xRangeMax
					) {
						// this entity is in the right range in terms of longitude
						const currentEntityPosY =
							currentState.positions[store][`${currentEntityId}--posY`];
						if (
							currentEntityPosY > yRangeMin &&
							currentEntityPosY < yRangeMax
						) {
							// potentially in the right range in terms of latitude
							if (currentEntityId !== entityId)
								candidates[currentEntityId] = currentEntityPosY;
						}
					}
				}
			}
		}

		const re = [];

		// check the actual width (wingspan) of the candidates
		for (const candidateId in candidates) {
			const storeEntity = getStoreEntity(candidateId, currentState);

			if (!storeEntity) continue;

			const candidateY = candidates[candidateId];
			const halvedwidth = Math.ceil(storeEntity.immutable.width / 2);
			if (
				entityY >= candidateY - halvedwidth &&
				entityY <= candidateY + halvedwidth
			) {
				re.push(candidateId);
			}
		}

		return re;
	},

	// STATE UPDATES //

	updateChangedStageEntityVelocities(updates) {
		for (const entityId in updates) {
			updateStageEntityVelocities(
				entityId,
				behavior.handlers.stageEntities,
				updates[entityId].latVelocity,
				updates[entityId].longVelocity
			);
		}
	},
};

export default behavior;
