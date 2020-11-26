import c from '../utils/constants';
import shots from '../shots';
import {
	getPosition,
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
	availableActions: {
		complain: 'complain',
		lookOutForHostiles: 'lookOutForHostiles',
		avoidShots: 'avoidShots',
		shieldDefendedEntityFromShots: 'shieldDefendedEntityFromShots',
		getIntoSightlineWEnemy: 'getIntoSightlineWEnemy',
	},

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
			}

			if (updatesToEntity.length > 0) {
				updatedSomething = true;
				entityStoreUpdates[entity.id] = updatesToEntity[0];
				stageVelocityUpdates[entity.id] = updatesToEntity[1];

				stateVelocityUpdates[`${entity.id}--latVelocity`] =
					updatesToEntity[1].latVelocity;
				stateVelocityUpdates[`${entity.id}--longVelocity`] =
					updatesToEntity[1].longVelocity;
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

	flee(entity, currentState) {
		const entityId = entity.id;
		shots.stopShooting(entityId);
		const entityStoreUpdates = {};

		const currentFacing = entity.facing;
		let newFacing = currentFacing;
		let needsToFlip = false;

		const [entityX] = getPosition(entityId, currentState.positions);
		const [attackerX] = getPosition(
			entity.behaviorLastHitOrigin,
			currentState.positions
		);

		if (attackerX < entityX) {
			// the attacker is on the left
			if (currentFacing === -1) {
				newFacing = 1;
				needsToFlip = true;
			}
		} else {
			// the attacker is on the right, or right above/beneath
			if (currentFacing === 1) {
				newFacing = -1;
				needsToFlip = true;
			}
		}

		if (needsToFlip) {
			entityStoreUpdates.facing = newFacing;
			flipStageEntity(entityId, behavior.handlers.stageEntities, newFacing);
		}

		const velocityUpdates = {
			latVelocity: 0,
			longVelocity: newFacing * entity.immutable.thrusters.main,
		};

		entityStoreUpdates.behaviorCurrentGoal = behavior.possibleGoals.flee;

		return [entityStoreUpdates, velocityUpdates];
	},

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
