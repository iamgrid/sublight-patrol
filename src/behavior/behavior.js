import c from '../utils/constants';
// import shots from '../shots';

const behavior = {
	handlers: { dispatch: null, state: null }, // gets its values in App.js
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
		const velocityUpdates = {};

		let updatedSomething = false;

		currentState.entities.targetable.forEach((entity) => {
			if (!entity.immutable.hasBehavior || entity.isDisabled) return;

			// this entity is allowed to make a decision right now
			let updatesToEntity = [];
			switch (entity.playerRelation) {
				case 'friendly': {
					if (
						entity.behaviorLastHitOrigin === playerId &&
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

				velocityUpdates[`${entity.id}--latVelocity`] =
					updatesToEntity[1].latVelocity;
				velocityUpdates[`${entity.id}--longVelocity`] =
					updatesToEntity[1].longVelocity;
			}
		});

		if (updatedSomething) {
			behavior.handlers.dispatch({
				type: c.actions.BEHAVIOR_RELATED_UPDATES,
				entityStoreUpdates: entityStoreUpdates,
				velocityUpdates: velocityUpdates,
			});
		}
	},

	flee(currentStoreEntity, currentState) {
		const entityStoreUpdates = {};
		const velocityUpdates = {
			latVelocity: 0,
			longVelocity: 8,
		};

		entityStoreUpdates.behaviorCurrentGoal = behavior.possibleGoals.flee;

		return [entityStoreUpdates, velocityUpdates];
	},
};

export default behavior;
