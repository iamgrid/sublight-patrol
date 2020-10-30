const initialGameState = {
	game: {
		targeting: null,
		targetHasBeenScanned: false,
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
