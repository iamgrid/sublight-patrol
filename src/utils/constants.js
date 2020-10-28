const c = {
	gameVersion: '[AIV]v{version} ({date})[/AIV]',
	actions: {
		MOVE_PLAYER: 'MOVE_PLAYER',
		ADD_ENTITY: 'ADD_ENTITY',
		REMOVE_ENTITY: 'REMOVE_ENTITY',
		ADD_SHOT: 'ADD_SHOT',
		REMOVE_SHOT: 'REMOVE_SHOT',
		TARGET: 'TARGET',
		CHANGE_PLAYER_RELATION: 'CHANGE_PLAYER_RELATION',
		SCAN: 'SCAN',
		DAMAGE: 'DAMAGE',
	},
	gameCanvas: {
		width: 1200,
		height: 450,
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
			collision: { m: 'Collision imminent!' },
			otherWarning: {
				m: 'Other warning text!',
			},
		},
		alerts: {
			systemsOffline: {
				m: 'Systems offline.',
			},
			otherAlert: { m: 'Other alert text!' },
		},
	},
	races: {
		humans: {
			laserColor: 0xff4040,
		},
		zangari: {
			laserColor: 0xffff40,
		},
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
