const initialGameState = {
	game: {
		targeting: null,
		targetHasBeenScanned: false,
		playerShips: {
			unlocked: 4,
			spent: 0,
			next: null,
			order: [
				'fenrir',
				'fenrir_dominator',
				'valkyrie',
				'zangari_fighter_type_4',
			],
		},
		cameraLTX: null,
		cameraLTY: null,
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
