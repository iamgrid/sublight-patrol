const initialGameState = {
	game: {
		facing: 'right',
		targeting: null,
		targetHasBeenScanned: false,
	},
	entities: {
		player: {},
		targetable: [],
		other: [],
	},
	shotIds: [],
	shotSightLines: {},
	positions: {
		canMove: {},
		cantMove: {},
	},
};

export default initialGameState;
