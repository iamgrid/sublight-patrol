const c = {
	gameVersion: '[AIV]v{version} ({date})[/AIV]',
	debug: {
		reducers: false,
		behavior: true,
		behaviorPerTick: false,
		sequentialEvents: false,
		objectives: false,
		localStorage: false,
		controlSchemes: false,
	},
	actions: {
		SET_CURRENT_SCENE: 'SET_CURRENT_SCENE',
		CHANGE_ENTITY_VELOCITIES: 'CHANGE_ENTITY_VELOCITIES',
		UPDATE_ENTITY_COORDS: 'UPDATE_ENTITY_COORDS',
		BEHAVIOR_RELATED_UPDATES: 'BEHAVIOR_RELATED_UPDATES',
		ADD_ENTITY: 'ADD_ENTITY',
		REMOVE_ENTITY: 'REMOVE_ENTITY',
		ADD_SHOT: 'ADD_SHOT',
		REMOVE_SHOT: 'REMOVE_SHOT',
		TARGET: 'TARGET',
		CHANGE_PLAYER_RELATION: 'CHANGE_PLAYER_RELATION',
		SCAN: 'SCAN',
		DAMAGE: 'DAMAGE',
		EMP_DAMAGE: 'EMP_DAMAGE',
		SHIELD_REGEN: 'SHIELD_REGEN',
		FLIP: 'FLIP',
		CLEANUP: 'CLEANUP',
		RESTART_MISSION: 'RESTART_MISSION',
		UPDATE_PLAYER_PROGRESS_BASED_ON_LOCAL_STORAGE:
			'UPDATE_PLAYER_PROGRESS_BASED_ON_LOCAL_STORAGE',
		REVERT_PLAYER_PROGRESS_TO_DEFAULTS: 'REVERT_PLAYER_PROGRESS_TO_DEFAULTS',
	},
	gameCanvas: {
		width: 1200,
		height: 450,
	},
	zIndices: {
		environmental: 0,
		shots: 100000,
		entities: 200000,
		healthBars: 300000,
	},
	starScapeLayers: [
		{ noOfStars: 15, speedMultiplier: 0.8 },
		{ noOfStars: 25, speedMultiplier: 0.7 },
		{ noOfStars: 25, speedMultiplier: 0.6 },
		{ noOfStars: 35, speedMultiplier: 0.5 },
		{ noOfStars: 35, speedMultiplier: 0.3 },
		{ noOfStars: 40, speedMultiplier: 0.2 },
	],
	alertsAndWarnings: {
		warnings: {
			leavingVolume: {
				m: 'You are approaching the edge of the mission volume',
			},
			no_emp: { m: 'Your current ship has no EMP capability' },
		},
		alerts: {
			leftVolume: { m: 'You are beyond the edge of the mission volume!' },
			systemsOffline: { m: 'Systems offline.' },
		},
	},
	groups: {
		general: {
			groupId: 'general',
			laserColor: 0xff4040,
			shieldDamageColor: 0x32ade6,
			hullDamageColor: 0xff9090,
		},
		human_empire: {
			groupId: 'human_empire',
			laserColor: 0xff4040,
			shieldDamageColor: 0x32ade6,
			hullDamageColor: 0xff9090,
		},
		zangari: {
			groupId: 'zangari',
			laserColor: 0xffff40,
			shieldDamageColor: 0x008080,
			hullDamageColor: 0xff5000,
		},
	},
	damageTypes: {
		shieldDamage: 'shieldDamage',
		hullDamage: 'hullDamage',
		destruction: 'destruction',
	},
	possibleGoals: {
		playerDetermined: 'playerDetermined',
		holdStation: 'holdStation',
		maintainVelocity: 'maintainVelocity',
		/*guardEntity: 'guardEntity',*/
		flee: 'flee',
		destroyEntity: 'destroyEntity',
		/*defendEntity: 'defendEntity',*/
	},
	obstructionTypes: {
		entityAttackingThePlayer: 'entityAttackingThePlayer',
		partnerInTheSameFormation: 'partnerInTheSameFormation',
		enemy: 'enemy',
		otherEntity: 'otherEntity',
	},
	entityContentClassifications: {
		irrelevant: 'irrelevant',
		illicit: 'illicit',
		missionObjective: 'missionObjective',
	},
	objectiveTypes: {
		inspected: {
			id: 'inspected',
			desc: 'must be inspected',
			completed_desc: 'was inspected',
			failsIfEventIs: [],
		},
		disabled: {
			id: 'disabled',
			desc: 'must be disabled',
			completed_desc: 'was disabled',
			failsIfEventIs: ['destroyed', 'hasDespawned'],
		},
		forcedToFlee: {
			id: 'forcedToFlee',
			desc: 'must be forced to flee',
			completed_desc: 'was forced to flee',
			failsIfEventIs: ['destroyed'],
		},
		destroyed: {
			id: 'destroyed',
			desc: 'must be destroyed',
			completed_desc: 'was destroyed',
			failsIfEventIs: ['hasDespawned'],
		},
		mustHaveSurvived: {
			id: 'mustHaveSurvived',
			desc: 'must have survived until other objectives completed',
			completed_desc: 'has survived until other objectives completed',
			failsIfEventIs: ['destroyed'],
		},
		mustHaveArrived: {
			id: 'mustHaveArrived',
			desc: 'must have arrived',
			completed_desc: 'has arrived',
			failsIfEventIs: ['forcedToFlee', 'destroyed', 'hasDespawned'],
		},
		hasDespawned: {
			id: 'hasDespawned',
			desc:
				'!!! This objective only exists for program logic, do not use it in your scenes!',
			completed_desc: '???',
			failsIfEventIs: [],
		},
	},
	empReach: 120,
	playerIdPartial: 'red_1',
	cameraModes: {
		gameplay: 'gameplay',
		centeredEntity: 'centeredEntity',
		stationary: 'stationary',
	},

	init() {
		for (let key in this.alertsAndWarnings.warnings) {
			this.alertsAndWarnings.warnings[key].type = 'warning';
			this.alertsAndWarnings.warnings[key].k = key;
		}
		for (let key in this.alertsAndWarnings.alerts) {
			this.alertsAndWarnings.alerts[key].type = 'alert';
			this.alertsAndWarnings.alerts[key].k = key;
		}
	},
};

export default c;
