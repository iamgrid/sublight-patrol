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
import formations from './formations';

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
	obstructionTypes: {
		entityAttackingThePlayer: 'entityAttackingThePlayer',
		enemy: 'enemy',
		otherEntity: 'otherEntity',
	},
	currentFormations: formations.currentFormations,
	maxShotTravelDistance: 1000,
	hullHealthPrcToFleeAt: 30,
	widthOfWidestEntityInTheGame: 49,

	tick() {
		const currentState = this.handlers.state();

		const playerId = currentState.entities.player.id;

		const entityStoreUpdates = {};
		const stateVelocityUpdates = {};
		const stageVelocityUpdates = {};
		const stageFacingUpdates = {};

		let updatedSomething = false;

		// behavior for entities that lead a formation,
		// aren't in a formation at all,
		// or fell below the hullHealth threshold for fleeing
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
							(entity.behaviorHitsSuffered > 0 &&
								entity.behaviorLastHitOrigin === playerId) ||
							(entity.behaviorCurrentGoal ===
								behavior.possibleGoals.destroyEntity &&
								entity.behaviorAttacking === playerId)
						) {
							itsGoTimeBuddy = true;
						}

						if (
							entity.playerRelation === 'hostile' &&
							distance < behavior.maxShotTravelDistance - 200
						) {
							itsGoTimeBuddy = true;
						}

						if (
							itsGoTimeBuddy &&
							(!formations.isInFormation(entity.id) ||
								formations.isLeadInAFormation(entity.id))
						) {
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
				if (updatesToEntity[2] !== null) {
					updatedSomething = true;
					stageFacingUpdates[entity.id] = updatesToEntity[2];
				}
			}
		});

		// behavior for entities that remained followers in a formation
		for (const formationId in formations.currentFormations.proper) {
			const formationConfig = formations.returnFormationFacingAndCoords(
				formationId,
				currentState
			);

			const facing = formationConfig.facing;
			let flankOneLatMultiplier = -1;
			let flankTwoLatMultiplier = 1;
			let longMultiplier = -1;

			if (facing === 1) {
				// flankOne (entities with an odd index) is above,
				// flankTwo (entities with an even index) is below
				// both flanks are to the left of the lead entity
			} else if (facing === -1) {
				// flankOne (entities with an odd index) is below,
				// flankTwo (entities with an even index) is above
				// both flanks are to the right of the lead entity
				flankOneLatMultiplier = 1;
				flankTwoLatMultiplier = -1;
				longMultiplier = 1;
			}

			for (
				let i = 0;
				i < formations.currentFormations.proper[formationId].length;
				i++
			) {
				if (i === 0) continue; // the lead entity is controlled above

				let updatesToEntity2 = [];

				const entityId = formations.currentFormations.proper[formationId][i].id;
				const entity = getStoreEntity(entityId, currentState);

				if (!entity) continue;
				// console.log(entityId, 'is controlled in the formation section');

				const latOffset =
					formations.currentFormations.proper[formationId][i].latOffset;
				const longOffset =
					formations.currentFormations.proper[formationId][i].longOffset;

				updatesToEntity2 = behavior.attackInFormation(
					entity,
					currentState,
					formationId,
					formationConfig,
					facing,
					latOffset,
					longOffset,
					i,
					flankOneLatMultiplier,
					flankTwoLatMultiplier,
					longMultiplier
				);

				if (updatesToEntity2.length > 0) {
					if (!isEmptyObject(updatesToEntity2[0])) {
						updatedSomething = true;
						entityStoreUpdates[entityId] = updatesToEntity2[0];
					}
					if (!isEmptyObject(updatesToEntity2[1])) {
						updatedSomething = true;
						stageVelocityUpdates[entityId] = updatesToEntity2[1];
						stateVelocityUpdates[`${entityId}--latVelocity`] =
							updatesToEntity2[1].latVelocity;
						stateVelocityUpdates[`${entityId}--longVelocity`] =
							updatesToEntity2[1].longVelocity;
					}
					if (updatesToEntity2[2] !== null) {
						updatedSomething = true;
						stageFacingUpdates[entityId] = updatesToEntity2[2];
					}
				}
			}
		}

		function updateSEV() {
			behavior.updateChangedStageEntityVelocities(
				stageVelocityUpdates,
				stageFacingUpdates
			);
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
		const formationId = formations.isInFormation(entityId);
		if (formationId) {
			formations.removeEntityFromFormation(formationId, entityId);
		}

		const entityStoreUpdates = {};

		const [needsToFlip, newFacing] = behavior._turn(
			'away-from',
			entity,
			entity.behaviorLastHitOrigin,
			currentState.positions
		);

		let facingUpdate = null;

		if (needsToFlip) {
			entityStoreUpdates.facing = newFacing;
			facingUpdate = newFacing;
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

		return [entityStoreUpdates, velocityUpdates, facingUpdate];
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

		let facingUpdate = null;

		if (needsToFlip) {
			entityStoreUpdates.facing = newFacing;
			facingUpdate = newFacing;
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
		const halfOfEnemysWidth = Math.floor(
			currentState.entities.player.immutable.width / 2
		);
		if (Math.abs(latDifference) > halfOfEnemysWidth) {
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
					enemyId,
					enemyX,
					currentState
				);

				if (entitiesInShotRange.length === 1) {
					// clear shot to hit the enemy
					if (entitiesInShotRange[0].id === enemyId)
						shots.startShooting(entityId);
				} else if (entitiesInShotRange.length > 1) {
					// the shot range has obstructions
					entitiesInShotRange.sort(
						(a, b) => a.distanceFromEnemy - b.distanceFromEnemy
					);

					// console.log(entityId, entitiesInShotRange);

					let cumulativeObstructionType = behavior.obstructionTypes.otherEntity;
					let partnerId = null;
					let closestObstruction = null;
					for (let currentEntity of entitiesInShotRange) {
						if (currentEntity.id !== enemyId) {
							if (
								currentEntity.obstructionType ===
								behavior.obstructionTypes.entityAttackingThePlayer
							) {
								cumulativeObstructionType =
									behavior.obstructionTypes.entityAttackingThePlayer;
								partnerId = currentEntity.id;
								break;
							} else {
								if (closestObstruction === null)
									closestObstruction = currentEntity.id;
							}
						}
					}

					if (
						cumulativeObstructionType === behavior.obstructionTypes.otherEntity
					) {
						// move closer to the enemy

						// console.log(
						// 	entityId,
						// 	'decided to move in front of',
						// 	closestObstruction
						// );

						newLongVelocity = newFacing * entity.immutable.thrusters.main;
					} else {
						// get into formation with another attacking entity
						// console.log(
						// 	entityId,
						// 	'decided to move into formation with',
						// 	partnerId
						// );
						const partnerAlreadyInFormationWId = formations.isInFormation(
							partnerId
						);
						if (partnerAlreadyInFormationWId) {
							formations.addEntityToFormation(
								partnerAlreadyInFormationWId,
								entityId,
								currentState
							);
						} else {
							const entityAlreadyInFormationWId = formations.isInFormation(
								entityId
							);
							if (entityAlreadyInFormationWId) {
								// our partner isn't in a formation, but we are,
								// so we'll tell them to join ours
								formations.addEntityToFormation(
									entityAlreadyInFormationWId,
									partnerId,
									currentState
								);
							} else {
								formations.createFormation(partnerId, entityId, currentState);
							}
						}
					}
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

		return [entityStoreUpdates, velocityUpdates, facingUpdate];
	},

	attackInFormation(
		entity,
		currentState,
		formationId,
		formationConfig,
		facing,
		latOffset,
		longOffset,
		formationIndex,
		flankOneLatMultiplier,
		flankTwoLatMultiplier,
		longMultiplier
	) {
		const entityId = entity.id;

		const currentFacing = entity.facing;

		const entityStoreUpdates = {};

		let newFacing = null;
		let facingUpdate = null;

		if (facing !== currentFacing) {
			newFacing = facing;
			facingUpdate = newFacing;
			entityStoreUpdates.facing = newFacing;
		}

		// let isInFlankOne = true;
		let isInFlankTwo = false;
		if (formationIndex % 2 === 0) {
			// isInFlankOne = false;
			isInFlankTwo = true;
		}

		let newLatVelocity = 0;
		let newLongVelocity = 0;

		let correctY = formationConfig.leadY + flankOneLatMultiplier * latOffset;
		let correctX = formationConfig.leadX + longMultiplier * longOffset;

		if (isInFlankTwo) {
			correctY = formationConfig.leadY + flankTwoLatMultiplier * latOffset;
		}

		const [entityX, entityY] = getPosition(entityId, currentState.positions);

		const latDifference = entityY - correctY;
		const longDifference = entityX - correctX;

		// console.log('attackInFormation', {
		// 	entityId,
		// 	latDifference,
		// 	longDifference,
		// });

		if (Math.abs(latDifference) > 1) {
			let dir = -1; // entity is below the assigned position, move up
			if (latDifference < 0) dir = 1; // entity is above the assigned position, move down

			let maxLatVelocity = entity.immutable.thrusters.side;

			newLatVelocity = dir * maxLatVelocity;
			if (Math.abs(latDifference) < maxLatVelocity) {
				newLatVelocity = -1 * latDifference;
			}
		}

		if (Math.abs(longDifference) > 1) {
			let dir = -1; // entity is to the right of the assigned position, move left
			if (longDifference < 0) dir = 1; // entity is to the left of the assigned position, move right

			let maxLongVelocity = entity.immutable.thrusters.front;
			if (facing === dir) maxLongVelocity = entity.immutable.thrusters.main;

			newLongVelocity = dir * maxLongVelocity;
			if (Math.abs(longDifference) < maxLongVelocity) {
				newLongVelocity = -1 * longDifference;
			}
		}

		const velocityUpdates = {
			latVelocity: newLatVelocity,
			longVelocity: newLongVelocity,
		};

		const enemyId = currentState.entities.player.id;
		const [enemyX] = getPosition(enemyId, currentState.positions);

		const longDistance = Math.abs(enemyX - entityX);

		let doShoot = false;

		if (longDistance < behavior.maxShotTravelDistance && newLatVelocity === 0) {
			const entitiesInShotRange = behavior._returnEntitiesInShotRange(
				entityId,
				entityX,
				entityY,
				newFacing,
				enemyId,
				enemyX,
				currentState
			);

			if (entitiesInShotRange.length === 1) {
				// clear shot to hit the enemy
				if (entitiesInShotRange[0].id === enemyId) doShoot = true;
			}
		}

		if (doShoot) {
			shots.startShooting(entityId);
		} else {
			shots.stopShooting(entityId);
		}

		// console.log('attackInFormation velocityUpdates:', velocityUpdates);

		return [entityStoreUpdates, velocityUpdates, facingUpdate];
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

	_returnEntitiesInShotRange(
		entityId,
		entityX,
		entityY,
		facing,
		enemyId,
		enemyX,
		currentState
	) {
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
							if (currentEntityId !== entityId) {
								const currentEntityPosX =
									currentState.positions[store][`${currentEntityId}--posX`];
								candidates[currentEntityId] = [
									currentEntityPosX,
									currentEntityPosY,
								];
							}
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

			const [candidateX, candidateY] = candidates[candidateId];
			const halvedwidth = Math.ceil(storeEntity.immutable.width / 2);
			if (
				entityY >= candidateY - halvedwidth &&
				entityY <= candidateY + halvedwidth
			) {
				let obstructionType = behavior.obstructionTypes.otherEntity;
				let distanceFromEnemy = Math.abs(enemyX - candidateX);
				if (
					storeEntity.immutable.hasCannons &&
					storeEntity.behaviorAttacking === enemyId
				) {
					obstructionType = behavior.obstructionTypes.entityAttackingThePlayer;
				}
				if (storeEntity.id === enemyId) {
					obstructionType = behavior.obstructionTypes.enemy;
				}

				re.push({ id: candidateId, obstructionType, distanceFromEnemy });
			}
		}

		return re;
	},

	// STATE UPDATES //

	updateChangedStageEntityVelocities(velocityUpdates, facingUpdates) {
		for (const entityId2 in facingUpdates) {
			flipStageEntity(
				entityId2,
				behavior.handlers.stageEntities,
				facingUpdates[entityId2]
			);
		}

		for (const entityId in velocityUpdates) {
			updateStageEntityVelocities(
				entityId,
				behavior.handlers.stageEntities,
				velocityUpdates[entityId].latVelocity,
				velocityUpdates[entityId].longVelocity
			);
		}
	},
};

export default behavior;
