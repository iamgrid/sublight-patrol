import c from './utils/constants.js';

const initialGameState = {
	game: {
		currentScene: null,
		currentScenePlayerStartingPositionX: null,
		currentScenePlayerStartingPositionY: null,
		targeting: null,
		targetHasBeenScanned: false,
		playerShips: {
			hangarBerths: 5,
			current: c.playableFighterTypeIds.fenrir,
			currentIdSuffix: 'a',
			hangarContents: [
				c.playableFighterTypeIds.fenrir_dominator,
				c.playableFighterTypeIds.valkyrie,
				// c.playableFighterTypeIds.zangari_fighter_type_4,
			],
			lostOnThisMission: [],
		},
		playerHasCompletedTheGame: false,
	},
	entities: {
		player: {
			id: 'red_1a',
		},
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
