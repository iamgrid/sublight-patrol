const c = {
	actions: {
		MOVE_PLAYER: 'MOVE_PLAYER',
		ADD_ENTITY: 'ADD_ENTITY',
	},
	gameCanvas: {
		width: 1200,
		height: 450,
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
		collision: { type: 'warning', k: 'collision', m: 'Collision imminent!' },
		otherWarning: {
			type: 'warning',
			k: 'otherWarning',
			m: 'Other warning text!',
		},
		systemsOffline: {
			type: 'alert',
			k: 'systemsOffline',
			m: 'Systems offline.',
		},
		otherAlert: { type: 'alert', k: 'otherAlert', m: 'Other alert text!' },
	},
};

export default c;
