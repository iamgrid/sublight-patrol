const initialGameState = {
	game: {
		targeting: null,
		targetHasBeenScanned: false,
		cameraX: null,
		cameraY: null,
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
