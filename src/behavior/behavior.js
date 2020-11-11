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
		lookOutForHostiles: 'lookOutForHostiles',
		avoidShots: 'avoidShots',
		shieldDefendedEntityFromShots: 'shieldDefendedEntityFromShots',
		getIntoSightlineWEnemy: 'getIntoSightlineWEnemy',
	},

	tick() {
		const currentState = this.handlers.state();
		currentState.entities.targetable.forEach((entity) => {
			if (!entity.immutable.hasBehavior || entity.isDisabled) return;

			// this entity is allowed to make a decision right now
		});
	},
};

export default behavior;
