const initialGameState = {
	game: {
		currentScene: null,
		targeting: null,
		targetHasBeenScanned: false,
		playerShips: {
			hangarBerths: 5,
			current: 'fenrir',
			currentIdSuffix: 'a',
			hangarContents: [
				'fenrir_dominator',
				'valkyrie',
				'zangari_fighter_type_4',
			],
			lostOnThisMission: [],
		},
		playerHasCompletedTheGame: false,
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
