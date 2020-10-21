const initialGameState = {
	game: {
		playerX: 150,
		playerY: 225,
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
