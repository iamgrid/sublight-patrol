const initialGameState = {
	game: {
		targeting: null,
		targetHasBeenScanned: false,
		lives: 5,
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
	positions: {
		canMove: {},
		cantMove: {},
	},
};

export default initialGameState;
