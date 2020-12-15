const initialGameState = {
	game: {
		targeting: null,
		targetHasBeenScanned: false,
		playerShips: {
			unlocked: 1,
			spent: 0,
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
