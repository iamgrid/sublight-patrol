const initialGameState = {
	game: {
		currentScene: null,
		targeting: null,
		targetHasBeenScanned: false,
		playerShips: {
			repairsAvailable: false,
			hangarBerths: 5,
			current: 'fenrir',
			hangarContents: [
				'fenrir_dominator',
				'valkyrie',
				'zangari_fighter_type_4',
			],
			lostOnThisMission: [],
		},
	},
	entities: {
		player: {},
		targetable: [],
		other: [],
	},
	shots: {
		ids: [],
		sightLines: {},
	},
	velocities: {},
	positions: {
		canMove: {},
		cantMove: {},
	},
};

export default initialGameState;
