const initialGameState = {
	game: {
		currentScene: null,
		targeting: null,
		targetHasBeenScanned: false,
		playerShips: {
			unlocked: 4,
			spent: 0,
			next: null,
			orderedHangar: [
				'fenrir',
				'fenrir_dominator',
				'valkyrie',
				'zangari_fighter_type_4',
			],
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
