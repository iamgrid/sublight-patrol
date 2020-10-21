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
};

export default initialGameState;
