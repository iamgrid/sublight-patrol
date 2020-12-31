import c from '../../utils/constants';
// import sc from '../storyConstants';
import entities from '../../entities/entities';
import keyboardLayouts from '../../keyboardLayouts';
// import plates from '../../plates';
// import timing from '../../utils/timing';

const scene002 = {
	handlers: { checkBeatCompletion: null }, // gets its values in story.js@advance()
	id: '002',
	titlePlate: {
		wittyText: 'Forking Dylan jinxed it.',
		mainText: "Mission 2: Baby's first standoff",
	},
	playVolume: {
		minX: -2000,
		maxX: 6000,
		minY: -2500,
		maxY: 2500,
		softBoundary: 300,
	},
	entities: {
		mylok_1: {
			id: 'mylok_1',
			groupId: 'mylok',
			type: 'zangari_fighter_type_3',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: false,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		htran_091: {
			id: 'htran_091',
			groupId: 'red',
			type: 'shuttle',
			playerRelation: 'friendly',
			behaviorAssignedGoal: c.possibleGoals.holdStation,
			contents: 'Medicine',
			contentClassification: c.entityContentClassifications.missionObjective,
			hasBeenScanned: true,
		},
		harpax_00097: {
			id: 'harpax_00097',
			type: 'buoy',
		},
	},
	storyBeats: [
		{
			keyboardLayout: keyboardLayouts.play.id,
			cameraMode: c.cameraModes.gameplay,
			isTheFinalGameplayBeat: false,
			registerObjectives() {
				return {
					show: [
						{
							type: c.objectiveTypes.mustHaveSurvived.id,
							entityId: scene002.entities.htran_091.id,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.destroyed.id,
							entityId: scene002.entities.mylok_1.id,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.destroyed.id,
							entityId: scene002.entities.mylok_1.id,
							requiredPercentage: 100,
						},
					],
				};
			},
			execute(playerId, playerShipType) {
				entities.spawn(scene002.entities.harpax_00097, {
					posX: 1000,
					posY: 345,
				});

				entities.spawn(
					playerShipType,
					{
						posX: 100,
						posY: 225,
						latVelocity: 0,
						longVelocity: 0,
					},
					{
						playerRelation: 'self',
						behaviorAssignedGoal: c.possibleGoals.playerDetermined,
						id: playerId,
					},
					'player'
				);

				entities.spawn(scene002.entities.htran_091, {
					posX: 100,
					posY: 150,
				});

				entities.spawn(
					scene002.entities.mylok_1,
					{
						posX: 3900,
						posY: 500,
					},
					{
						behaviorAssignedStationX: 980,
						behaviorAssignedStationY: 170,
					}
				);
			},
		},
		{
			keyboardLayout: keyboardLayouts.play.id,
			cameraMode: c.cameraModes.gameplay,
			isTheFinalGameplayBeat: true,
			registerObjectives() {
				return {
					show: [],
					advanceWhen: [],
				};
			},
			execute() {
				console.log('this is the new ending and stuff');
				if (typeof scene002.handlers.checkBeatCompletion === 'function') {
					scene002.handlers.checkBeatCompletion();
				} else {
					console.error(
						'failed to set the checkBeatCompletion handler in story.js'
					);
				}
			},
		},
	],
};

export default scene002;
