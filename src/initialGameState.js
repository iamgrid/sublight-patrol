const initialGameState = {
	game: {
		targeting: null,
		targetHasBeenScanned: false,
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
