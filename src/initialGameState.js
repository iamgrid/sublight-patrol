const initialGameState = {
	game: {
		facing: 'right',
		targeting: null,
	},
	entities: {
		player: {},
		targetable: [],
		other: [],
	},
	positions: {
		canMove: {},
		cantMove: {},
	},
};

export default initialGameState;
