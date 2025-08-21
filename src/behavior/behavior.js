import c from '../utils/constants';
import { randomNumber } from '../utils/formulas';
import entities from '../entities/entities';
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
	handlers: {
		dispatch: null,
		state: null,
		stageEntities: null,
		checkAgainstCurrentObjectives: null,
		playVolume: null,
	}, // gets its values in App.js
	enemyFighterDetectionRange: 600,
	maxShotTravelDistance: 1000,
	hullHealthPrcToFleeAt: 30,
	yOffsetToleranceForFiring: 110, // the widest entity currently in the game is 49px wide, so this tolerance should be at least half of that, e.g. 25px
	overcorrectingEntities: {},

	tick() {
		// const functionSignature = 'behavior.js@tick()';
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
			// console.log(
			// 	functionSignature,
			// 	'entity:',
			// 	entity.id,
			// 	'entity immutable:',
			// 	entity.immutable,
			// 	'entity isDisabled:',
			// 	entity.isDisabled
			// );
			if (!entity.immutable.hasBehavior || entity.isDisabled) return;

			// this entity is allowed to make a decision right now
			let updatesToEntity = [];
			switch (entity.playerRelation) {
				case 'friendly': {
					if (
						entity.behaviorLastHitOrigin === playerId &&
						entity.behaviorHitsSuffered > 4 &&
						entity.behaviorAllowedToFlee
					) {
						updatesToEntity = behavior.flee(entity, currentState);
					} else {
						if (entity.behaviorCurrentGoal === c.possibleGoals.holdStation) {
							updatesToEntity = behavior.holdStation(entity, currentState);
						}
					}
					break;
				}
				default: {
					const hullHealthPrc = Math.trunc(
						(entity.hullStrength / entity.immutable.maxHullStrength) * 100
					);

					if (
						((entity.behaviorAllowedToFlee ||
							entity.assignedPlayerRelation !== 'hostile') &&
							hullHealthPrc < behavior.hullHealthPrcToFleeAt) ||
						(!entity.immutable.hasCannons &&
							entity.behaviorAllowedToFlee &&
							entity.behaviorLastHitOrigin === playerId)
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
							(entity.behaviorCurrentGoal === c.possibleGoals.destroyEntity &&
								entity.behaviorAttacking === playerId &&
								playerId !== 'destroyed_player')
						) {
							itsGoTimeBuddy = true;
						}

						if (
							entity.playerRelation === 'hostile' &&
							distance < behavior.enemyFighterDetectionRange &&
							playerId !== 'destroyed_player'
						) {
							itsGoTimeBuddy = true;
						}

						if (
							!formations.isInFormation(entity.id) ||
							formations.isLeadInAFormation(entity.id)
						) {
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
							} else {
								// execute originally assigned behavior
								switch (entity.behaviorAssignedGoal) {
									case c.possibleGoals.maintainVelocity:
										updatesToEntity = behavior.maintainVelocity(
											entity,
											currentState
										);
										break;
									case c.possibleGoals.holdStation:
										updatesToEntity = behavior.holdStation(
											entity,
											currentState
										);
										break;
								}

								if (
									entity.behaviorAssignedGoal !== entity.behaviorCurrentGoal
								) {
									if (c.debug.behavior)
										console.log(
											entity.id,
											'used to',
											entity.behaviorCurrentGoal,
											entity.behaviorAttacking,
											'but now we return it to',
											entity.behaviorAssignedGoal
										);
								}
							}
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
					if (
						currentState.velocities[`${entity.id}--latVelocity`] !==
						updatesToEntity[1].latVelocity
					) {
						stateVelocityUpdates[`${entity.id}--latVelocity`] =
							updatesToEntity[1].latVelocity;
					}
					if (
						currentState.velocities[`${entity.id}--longVelocity`] !==
						updatesToEntity[1].longVelocity
					) {
						stateVelocityUpdates[`${entity.id}--longVelocity`] =
							updatesToEntity[1].longVelocity;
					}
				}
				if (updatesToEntity[2] !== null) {
					updatedSomething = true;
					stageFacingUpdates[entity.id] = updatesToEntity[2];
				}
			}
		});

		// behavior for entities that remained followers in a formation
		for (const formationId in formations.currentFormations) {
			const formationConfig = formations.returnFormationFacingAndCoords(
				formationId,
				currentState
			);

			const facing = formationConfig.facing;
			let flankOneLatMultiplier = -1;
			let flankTwoLatMultiplier = 1;
			let longMultiplier = -1;

			if (facing === 1) {
				// both flanks should be to the left of the lead entity
			} else if (facing === -1) {
				// both flanks should be to the right of the lead entity

				// for nicer movement flankOne (entities with an odd index) and
				// flankTwo (entities with an even index) flip when the facing is -1
				// so their lat multipliers have to actually stay the same
				longMultiplier = 1;
			}

			for (
				let i = 0;
				i < formations.currentFormations[formationId].length;
				i++
			) {
				if (i === 0) continue; // the lead entity is controlled above

				let updatesToEntity2 = [];

				const entityId = formations.currentFormations[formationId][i].id;
				const entity = getStoreEntity(entityId, currentState);

				if (!entity) continue;
				// console.log(entityId, 'is controlled in the formation section');

				const latOffset =
					formations.currentFormations[formationId][i].latOffset;
				const longOffset =
					formations.currentFormations[formationId][i].longOffset;

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
						if (
							currentState.velocities[`${entityId}--latVelocity`] !==
							updatesToEntity2[1].latVelocity
						) {
							stateVelocityUpdates[`${entityId}--latVelocity`] =
								updatesToEntity2[1].latVelocity;
						}
						if (
							currentState.velocities[`${entityId}--longVelocity`] !==
							updatesToEntity2[1].longVelocity
						) {
							stateVelocityUpdates[`${entityId}--longVelocity`] =
								updatesToEntity2[1].longVelocity;
						}
						// stateVelocityUpdates[`${entityId}--longVelocity`] =
						// 	updatesToEntity2[1].longVelocity;
					}
					if (updatesToEntity2[2] !== null) {
						updatedSomething = true;
						stageFacingUpdates[entityId] = updatesToEntity2[2];
					}
				}
			}
		}

		if (c.debug.behaviorPerTick) {
			if (!isEmptyObject(stateVelocityUpdates))
				console.log('stateVelocityUpdates:', stateVelocityUpdates);
			if (!isEmptyObject(entityStoreUpdates))
				console.log('entityStoreUpdates:', entityStoreUpdates);
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

	maintainVelocity(entity, currentState) {
		const entityStoreUpdates = {};

		shots.stopShooting(entity.id);

		if (entity.behaviorCurrentGoal !== c.possibleGoals.maintainVelocity) {
			entityStoreUpdates.behaviorCurrentGoal = c.possibleGoals.maintainVelocity;
			entityStoreUpdates.behaviorAttacking = '';

			if (entity.playerRelation !== entity.assignedPlayerRelation) {
				entityStoreUpdates.playerRelation = entity.assignedPlayerRelation;
				entities.stageEntities[entity.id].reticuleRelation(
					entity.assignedPlayerRelation
				);
			}
		}

		let newLatVel = 0;
		let newLongVel = 0;

		const currentLongVel = getVelocity(entity.id, currentState.velocities)[1];

		if (Number.isFinite(entity.behaviorAssignedLongVelocity)) {
			newLongVel = entity.behaviorAssignedLongVelocity;
		}

		let needsToFlip = false;
		let newFacing = 0;

		if (entity.facing === 1 && (newLongVel < 0 || currentLongVel < 0)) {
			needsToFlip = true;
			newFacing = -1;
		}
		if (entity.facing === -1 && (newLongVel > 0 || currentLongVel > 0)) {
			needsToFlip = true;
			newFacing = 1;
		}

		let facingUpdate = null;
		if (needsToFlip) {
			entityStoreUpdates.facing = newFacing;
			facingUpdate = newFacing;
		}

		const velocityUpdates = {
			latVelocity: newLatVel,
			longVelocity: newLongVel,
		};

		// console.log(entity.id, entityStoreUpdates, velocityUpdates, facingUpdate);

		if (c.debug.behaviorPerTick)
			console.log('maintainVelocity() (return values)', entity.id, {
				...entityStoreUpdates,
				...velocityUpdates,
				facingUpdate,
			});

		return [entityStoreUpdates, velocityUpdates, facingUpdate];
	},

	holdStation(entity, currentState) {
		const entityStoreUpdates = {};

		shots.stopShooting(entity.id);

		if (entity.behaviorCurrentGoal !== c.possibleGoals.holdStation) {
			entityStoreUpdates.behaviorCurrentGoal = c.possibleGoals.holdStation;
			entityStoreUpdates.behaviorAttacking = '';

			if (entity.playerRelation !== entity.assignedPlayerRelation) {
				entityStoreUpdates.playerRelation = entity.assignedPlayerRelation;
				entities.stageEntities[entity.id].reticuleRelation(
					entity.assignedPlayerRelation
				);
			}
		}

		const [entityX, entityY] = getPosition(entity.id, currentState.positions);

		if (!Number.isInteger(entityX) || !Number.isInteger(entityY)) {
			return [{}, {}, null];
		}

		const velocityUpdates = {};

		let needsToFlip = false;
		let newFacing = 0;
		let longDifference = 0;
		let latDifference = 0;

		if (entity.behaviorAssignedStationX !== undefined) {
			longDifference = entity.behaviorAssignedStationX - entityX;
			if (Math.abs(longDifference) < 2) {
				velocityUpdates.longVelocity = 0;
			} else {
				// we need to move sideways
				const maxLongVelocity = entity.immutable.thrusters.main;
				if (longDifference > 0) {
					// required X is to the right
					if (longDifference <= entity.immutable.thrusters.front) {
						// its close, we can get there with as little
						// as the thrust from our frontal thrusters
						velocityUpdates.longVelocity = longDifference;
					} else {
						// its further, we definitely need to flip to the correct facing
						if (entity.facing !== 1) {
							needsToFlip = true;
							newFacing = 1;
						}

						if (longDifference < maxLongVelocity) {
							velocityUpdates.longVelocity = longDifference;
						} else {
							velocityUpdates.longVelocity = maxLongVelocity;
						}
					}
				} else {
					// required X is to the left
					if (longDifference > 0 - entity.immutable.thrusters.front) {
						velocityUpdates.longVelocity = longDifference;
					} else {
						if (entity.facing !== -1) {
							needsToFlip = true;
							newFacing = -1;
						}

						if (longDifference > 0 - maxLongVelocity) {
							velocityUpdates.longVelocity = longDifference;
						} else {
							velocityUpdates.longVelocity = 0 - maxLongVelocity;
						}
					}
				}
			}
		}

		if (entity.behaviorAssignedStationY !== undefined) {
			latDifference = entity.behaviorAssignedStationY - entityY;
			if (Math.abs(latDifference) < 2) {
				velocityUpdates.latVelocity = 0;
			} else {
				// we need to move laterally
				if (latDifference > 0) {
					// required Y is above
					if (latDifference < entity.immutable.thrusters.side) {
						velocityUpdates.latVelocity = latDifference;
					} else {
						velocityUpdates.latVelocity = entity.immutable.thrusters.side;
					}
				} else {
					// required Y is below
					if (latDifference > 0 - entity.immutable.thrusters.side) {
						velocityUpdates.latVelocity = latDifference;
					} else {
						velocityUpdates.latVelocity = 0 - entity.immutable.thrusters.side;
					}
				}
			}
		}

		let facingUpdate = null;
		if (needsToFlip) {
			entityStoreUpdates.facing = newFacing;
			facingUpdate = newFacing;
		}

		// if (entity.id === 'red_2') {
		// 	console.log(
		// 		'red_2',
		// 		entityStoreUpdates,
		// 		velocityUpdates,
		// 		facingUpdate,
		// 		longDifference,
		// 		entityX
		// 	);
		// }

		if (
			velocityUpdates.latVelocity === 0 &&
			velocityUpdates.longVelocity === 0
		) {
			const [prevLatVel, prevLongVel] = getVelocity(
				entity.id,
				currentState.velocities
			);
			if (prevLatVel !== 0 || prevLongVel !== 0) {
				if (c.debug.behavior)
					console.log('holdStation():', entity.id, 'is in position');
				behavior.handlers.checkAgainstCurrentObjectives(
					entity.id,
					c.objectiveTypes.mustHaveArrived.id
				);
			}
		}

		if (c.debug.behaviorPerTick)
			console.log('holdStation() (return values)', entity.id, {
				...entityStoreUpdates,
				...velocityUpdates,
				facingUpdate,
			});

		return [entityStoreUpdates, velocityUpdates, facingUpdate];
	},

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
			currentState.entities.player.id,
			currentState.positions
		);

		let facingUpdate = null;

		if (needsToFlip) {
			entityStoreUpdates.facing = newFacing;
			facingUpdate = newFacing;
		}

		const velocityUpdates = {};

		if (
			getVelocity(entityId, currentState.velocities)[1] !==
			newFacing * entity.immutable.thrusters.main
		) {
			velocityUpdates.latVelocity = 0;
			velocityUpdates.longVelocity =
				newFacing * entity.immutable.thrusters.main;
		}

		if (entity.behaviorCurrentGoal !== c.possibleGoals.flee) {
			entityStoreUpdates.behaviorCurrentGoal = c.possibleGoals.flee;
			entityStoreUpdates.behaviorAttacking = '';
			if (
				typeof behavior.handlers.checkAgainstCurrentObjectives === 'function'
			) {
				behavior.handlers.checkAgainstCurrentObjectives(
					entityId,
					c.objectiveTypes.forcedToFlee.id
				);
			}
		}

		if (c.debug.behaviorPerTick)
			console.log('flee() (return values)', entity.id, {
				...entityStoreUpdates,
				...velocityUpdates,
				facingUpdate,
			});

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
		const functionSignature = 'behavior.js@destroyEntity()';
		const entityId = entity.id;
		const entityStoreUpdates = {};

		// Setting new behavior.
		if (
			entity.behaviorAttacking !== enemyId &&
			enemyId !== 'destroyed_player'
		) {
			entityStoreUpdates.playerRelation = 'hostile';
			entities.stageEntities[entityId].reticuleRelation('hostile');
			entityStoreUpdates.behaviorAttacking = enemyId;
			entityStoreUpdates.behaviorCurrentGoal = c.possibleGoals.destroyEntity;
		}

		// This is a lone attacker, look for other
		// attackers in the vicinity to make a formation with.

		let foundAFormationToJoin = false;
		if (
			!formations.isLeadInAFormation(
				entityId
			) /* && !entity.mutable.isDisabled*/
		) {
			currentState.entities.targetable.forEach((buddy) => {
				if (foundAFormationToJoin) return;
				if (buddy.id === entityId) return;
				if (
					buddy.playerRelation === 'hostile' &&
					buddy.immutable.hasCannons &&
					buddy.behaviorAttacking === enemyId &&
					!buddy.isDisabled
				) {
					const [buddyX, buddyY] = getPosition(
						buddy.id,
						currentState.positions
					);
					const distanceToBuddy = calculateDistance(
						entityX,
						entityY,
						buddyX,
						buddyY
					);
					if (distanceToBuddy < 150) {
						const formationId = formations.isInFormation(buddy.id);
						if (formationId) {
							formations.addEntityToFormation(
								formationId,
								entityId,
								currentState,
								false
							);
							foundAFormationToJoin = true;
						} else {
							formations.createFormation(entityId, buddy.id, currentState);
							foundAFormationToJoin = true;
						}
					}
				}
			});
		}

		if (foundAFormationToJoin) {
			// This entity will start to be controlled by
			// its formation starting on the next tick
			return [entityStoreUpdates, {}, null];
		}

		// Turn towards the player.

		const [needsToFlip, newFacing] = behavior._turn(
			'toward',
			entity,
			enemyId,
			currentState.entities.player.id,
			currentState.positions,
			{ entityX, enemyX }
		);

		let facingUpdate = null;

		if (needsToFlip) {
			entityStoreUpdates.facing = newFacing;
			facingUpdate = newFacing;
		}

		// Velocity updates.

		let newLatVelocity = 0;
		let newLongVelocity = 0;

		const longDistance = Math.abs(enemyX - entityX);
		const [enemyLatVel, enemyLongVel] = getVelocity(
			enemyId,
			currentState.velocities
		);
		if (longDistance > entity.behaviorPreferredAttackDistance) {
			// Try to move into range with the enemy horizontally.

			const maxLongVelocity = entity.immutable.thrusters.main;
			let tempLongVel = maxLongVelocity;
			const absEnemyLongVel = Math.abs(enemyLongVel);
			if (
				absEnemyLongVel > 0 &&
				absEnemyLongVel < maxLongVelocity &&
				((newFacing < 0 && enemyLongVel < 0) ||
					(newFacing > 0 && enemyLongVel > 0))
			) {
				// Match velocity with the enemy
				// if its also moving in the same direction.
				tempLongVel = absEnemyLongVel;
			}
			newLongVelocity = newFacing * tempLongVel;

			// Don't move beyond the behavior boundaries (X axis)
			let boundaryOverride = false;
			if (
				entityX + newLongVelocity <
					behavior.handlers.playVolume.softBoundaries.minX ||
				entityX + newLongVelocity >
					behavior.handlers.playVolume.softBoundaries.maxX
			) {
				newLongVelocity = 0;
				boundaryOverride = true;
			}

			if (c.debug.behaviorPerTick)
				console.log(
					entity.id,
					'is outside its preferred attack distance, moving closer:',
					entity.behaviorPreferredAttackDistance,
					{ longDistance, maxLongVelocity, newLongVelocity, boundaryOverride }
				);
		} else if (longDistance < entity.immutable.length * 3) {
			// way too close to the enemy, backing up
			// console.log(entity.id, 'is backing up');
			newLongVelocity = -1 * newFacing * entity.immutable.thrusters.front;
		}

		const latDifference = enemyY - entityY;
		const halfOfEnemysWidth = Math.floor(
			currentState.entities.player.immutable.width / 2
		);
		const maxLatVelocity = entity.immutable.thrusters.side;
		if (Math.abs(latDifference) > halfOfEnemysWidth) {
			// Try to move into sightline with the enemy
			shots.stopShooting(entityId);
			newLatVelocity = Math.min(Math.abs(latDifference), maxLatVelocity);
			if (latDifference < 0) {
				newLatVelocity = 0 - newLatVelocity;
			}
			behavior.overcorrectingEntities[entityId] = 0;
			// console.log(
			// 	'sightline-based newLatVelocity: ',
			// 	newLatVelocity,
			// 	maxLatVelocity,
			// 	halfOfEnemysWidth
			// );
		} else {
			const absEnemyLatVel = Math.abs(enemyLatVel);
			if (absEnemyLatVel > 0) {
				// We are within sightline right now, but the enemy is
				// moving laterally, let's match velocity with it if we can
				if (absEnemyLatVel >= maxLatVelocity) {
					// This entity has weaker/equal lateral thrusters than the enemy
					newLatVelocity = Math.min(absEnemyLatVel, maxLatVelocity);
				} else {
					// This entity is nimbler than the enemy, so it will
					// overcorrect sometimes
					if (behavior.overcorrectingEntities[entityId] === undefined) {
						behavior.overcorrectingEntities[entityId] = 0;
					}
					const rand = Math.random();
					if (behavior.overcorrectingEntities[entityId] === 0 && rand > 0.98) {
						newLatVelocity = maxLatVelocity;
						behavior.overcorrectingEntities[entityId] = randomNumber(3, 6);
						// console.log(
						// 	'overcorrection',
						// 	newLatVelocity,
						// 	rand,
						// 	behavior.overcorrectingEntities[entityId]
						// );
					} else {
						if (behavior.overcorrectingEntities[entityId] > 0) {
							newLatVelocity = maxLatVelocity;
							behavior.overcorrectingEntities[entityId]--;
							// console.log(
							// 	'keep overcorrecting',
							// 	newLatVelocity,
							// 	rand,
							// 	behavior.overcorrectingEntities[entityId]
							// );
						} else {
							behavior.overcorrectingEntities[entityId] = 0;
							newLatVelocity = absEnemyLatVel;
							// console.log('no overcorrection', newLatVelocity);
						}
					}
				}
				if (latDifference < 0) {
					newLatVelocity = 0 - newLatVelocity;
				}
				// console.log(
				// 	'match-based newLatVelocity: ',
				// 	newLatVelocity,
				// 	maxLatVelocity,
				// 	halfOfEnemysWidth
				// );
			} else {
				behavior.overcorrectingEntities[entityId] = 0;
			}

			if (longDistance < behavior.maxShotTravelDistance) {
				const entitiesInShotRange = behavior._returnEntitiesInShotRange(
					functionSignature,
					entityId,
					entityX,
					entityY,
					newFacing,
					enemyId,
					enemyX,
					currentState
				);

				if (entitiesInShotRange.length === 1) {
					if (entitiesInShotRange[0].id === enemyId) {
						// clear shot to hit the enemy
						if (!needsToFlip) shots.startShooting(entityId);
					}
				} else if (entitiesInShotRange.length > 1) {
					// the shot range has obstructions
					entitiesInShotRange.sort(
						(a, b) => a.distanceFromEnemy - b.distanceFromEnemy
					);

					// console.log(entityId, entitiesInShotRange);

					let cumulativeObstructionType = c.obstructionTypes.otherEntity;
					let partnerId = null;
					let closestObstruction = null;
					for (let currentEntity of entitiesInShotRange) {
						if (currentEntity.id !== enemyId) {
							if (
								currentEntity.obstructionType ===
								c.obstructionTypes.entityAttackingThePlayer
							) {
								cumulativeObstructionType =
									c.obstructionTypes.entityAttackingThePlayer;
								if (!currentEntity.isDisabled) {
									partnerId = currentEntity.id;
								}
								break;
							} else {
								if (closestObstruction === null)
									closestObstruction = currentEntity.id;
							}
						}
					}

					if (cumulativeObstructionType === c.obstructionTypes.otherEntity) {
						// move closer to the enemy

						// console.log(
						// 	entityId,
						// 	'decided to move in front of',
						// 	closestObstruction
						// );

						newLongVelocity = newFacing * entity.immutable.thrusters.main;
					} else if (partnerId !== null) {
						// get into formation with another attacking entity

						// console.log(
						// 	entityId,
						// 	'decided to move into formation with',
						// 	partnerId
						// );

						const partnerAlreadyInFormationWId =
							formations.isInFormation(partnerId);
						if (partnerAlreadyInFormationWId) {
							formations.addEntityToFormation(
								partnerAlreadyInFormationWId,
								entityId,
								currentState
							);
						} else {
							const entityAlreadyInFormationWId =
								formations.isInFormation(entityId);
							if (entityAlreadyInFormationWId) {
								// our partner isn't in a formation, but we are,
								// so we'll tell them to become our new leader
								formations.addEntityToFormation(
									entityAlreadyInFormationWId,
									partnerId,
									currentState,
									true
								);
							} else {
								formations.createFormation(partnerId, entityId, currentState);
							}
						}
					}
				}
			}
		}

		// Don't move beyond the behavior boundaries (Y axis)
		if (
			entityY + newLatVelocity <
				behavior.handlers.playVolume.softBoundaries.minY ||
			entityY + newLatVelocity >
				behavior.handlers.playVolume.softBoundaries.maxY
		) {
			newLatVelocity = 0;
		}

		const velocityUpdates = {
			latVelocity: newLatVelocity,
			longVelocity: newLongVelocity,
		};

		if (c.debug.behaviorPerTick)
			console.log('destroyEntity() (return values)', entity.id, {
				...entityStoreUpdates,
				...velocityUpdates,
				facingUpdate,
			});

		return [entityStoreUpdates, velocityUpdates, facingUpdate];
	},

	attackInFormation(
		entity,
		currentState,
		formationId,
		formationConfig,
		formationFacing,
		latOffset,
		longOffset,
		formationIndex,
		flankOneLatMultiplier,
		flankTwoLatMultiplier,
		longMultiplier
	) {
		const functionSignature = 'behavior.js@attackInFormation()';
		const entityId = entity.id;

		const currentFacing = entity.facing;

		const entityStoreUpdates = {};

		let newFacing = null;
		let facingUpdate = null;

		if (formationFacing !== currentFacing) {
			newFacing = formationFacing;
			facingUpdate = newFacing;
			entityStoreUpdates.facing = newFacing;
		}

		// if (c.debug.behavior)
		// 	console.log(functionSignature, entityId, {
		// 		formationFacing,
		// 		currentFacing,
		// 		newFacing,
		// 	});

		let isInFlankTwo = false;
		if (formationIndex % 2 === 0) {
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

		// console.log(functionSignature, {
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
			if (currentFacing === dir)
				maxLongVelocity = entity.immutable.thrusters.main;

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

		if (
			longDistance < behavior.maxShotTravelDistance /* && newLatVelocity === 0*/
		) {
			const entitiesInShotRange = behavior._returnEntitiesInShotRange(
				functionSignature,
				entityId,
				entityX,
				entityY,
				currentFacing,
				enemyId,
				enemyX,
				currentState
			);

			// console.log(
			// 	functionSignature,
			// 	'entityId:',
			// 	entityId,
			// 	'enemyId:',
			// 	enemyId,
			// 	'entitiesInShotRange:',
			// 	entitiesInShotRange.toString()
			// );

			if (entitiesInShotRange.length === 1) {
				// clear shot to hit the enemy
				if (entitiesInShotRange[0].id === enemyId) {
					doShoot = true;
					// console.log(
					// 	entityId,
					// 	'in',
					// 	formationId,
					// 	currentFacing,
					// 	'starts shooting',
					// 	entitiesInShotRange
					// );
				} else {
					// console.log(
					// 	entityId,
					// 	'in',
					// 	formationId,
					// 	currentFacing,
					// 	'stops shooting',
					// 	entitiesInShotRange
					// );
				}
			}
		}

		if (doShoot) {
			shots.startShooting(entityId);
		} else {
			shots.stopShooting(entityId);
		}

		if (c.debug.behaviorPerTick)
			console.log('attackInFormation(): (return values)', entity.id, {
				...entityStoreUpdates,
				...velocityUpdates,
				facingUpdate,
			});

		return [entityStoreUpdates, velocityUpdates, facingUpdate];
	},

	// HELPER METHODS //

	_turn(
		dir = 'toward',
		entity,
		enemyId,
		playerId,
		positions,
		havePositions = null
	) {
		const currentFacing = entity.facing;

		if (playerId === 'destroyed_player' || enemyId !== playerId)
			return [false, currentFacing];

		let newFacing = currentFacing;
		let needsToFlip = false;

		let entityX = null;
		let enemyX = null;
		if (havePositions) {
			entityX = havePositions.entityX;
			enemyX = havePositions.enemyX;
		} else {
			[entityX] = getPosition(entity.id, positions);
			if (entityX === false) {
				console.log(
					'_turn fn:',
					entity.id,
					'(current entity) getPosition returned false'
				);
				return [false, currentFacing];
			}
			[enemyX] = getPosition(enemyId, positions);
			if (enemyX === false) {
				console.log(
					'_turn fn:',
					enemyId,
					'(enemy entity) getPosition returned false, entity.id:',
					entity.id
				);
				return [false, currentFacing];
			}
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
		calledBy,
		entityId,
		entityX,
		entityY,
		facing,
		enemyId,
		enemyX,
		currentState
	) {
		// const functionSignature = "behavior.js@_returnEntitiesInShotRange()";
		let xRangeMin = entityX - behavior.maxShotTravelDistance;
		let xRangeMax = entityX;
		if (facing === 1) {
			xRangeMin = entityX;
			xRangeMax = entityX + behavior.maxShotTravelDistance;
		}

		let yRangeMin = entityY - behavior.yOffsetToleranceForFiring;
		let yRangeMax = entityY + behavior.yOffsetToleranceForFiring;

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
				let obstructionType = c.obstructionTypes.otherEntity;
				let distanceFromEnemy = Math.abs(enemyX - candidateX);
				if (
					!storeEntity.isDisabled &&
					storeEntity.immutable.hasCannons &&
					storeEntity.behaviorAttacking === enemyId
				) {
					obstructionType = c.obstructionTypes.entityAttackingThePlayer;
					const currentEntityFormationId = formations.isInFormation(entityId);
					if (currentEntityFormationId) {
						if (
							currentEntityFormationId === formations.isInFormation(candidateId)
						) {
							// our current entity and the candidate are
							// part of the same formation
							obstructionType = c.obstructionTypes.partnerInTheSameFormation;
						}
					}
				}
				if (storeEntity.id === enemyId) {
					obstructionType = c.obstructionTypes.enemy;
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
				entities.stageEntities,
				facingUpdates[entityId2]
			);
		}

		for (const entityId in velocityUpdates) {
			updateStageEntityVelocities(
				entityId,
				entities.stageEntities,
				velocityUpdates[entityId].latVelocity,
				velocityUpdates[entityId].longVelocity
			);
		}
	},
};

export default behavior;
