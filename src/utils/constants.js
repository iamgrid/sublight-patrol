const c = {
	gameVersion: '[AIV]v{version} ({date})[/AIV]',
	debug: {
		verboseReducers: false,
	},
	actions: {
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
		SHIELD_REGEN: 'SHIELD_REGEN',
		FLIP: 'FLIP',
	},
	gameCanvas: {
		width: 1200,
		height: 450,
	},
	playVolume: {
		minX: -2500,
		maxX: 3000,
		minY: -2500,
		maxY: 3000,
		softBoundary: 300,
	},
	zIndices: {
		environmental: 0,
		shots: 100000,
		entities: 200000,
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
				m: 'You are approaching the edge of the playable volume!',
			},
			collision: { m: 'Collision imminent!' },
			otherWarning: {
				m: 'Other warning text!',
			},
		},
		alerts: {
			leftVolume: { m: 'You are beyond the edge of the playable volume!' },
			systemsOffline: {
				m: 'Systems offline.',
			},
			otherAlert: { m: 'Other alert text!' },
		},
	},
	groups: {
		general: {
			groupId: 'general',
			laserColor: 0xff4040,
			shieldDamageColor: 0x32ade6,
			hullDamageColor: 0xff9090,
		},
		humans: {
			groupId: 'humans',
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
