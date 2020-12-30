import c from '../../utils/constants';
// import sc from '../storyConstants';
import entities from '../../entities/entities';
import keyboardLayouts from '../../keyboardLayouts';
// import plates from '../../plates';
// import timing from '../../utils/timing';

const scene002 = {
	id: '002',
	titlePlate: {
		wittyText: 'It seemed way too easy',
		mainText: 'Mission 2: Just like in the movies',
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
		mylok_2: {
			id: 'mylok_2',
			groupId: 'mylok',
			type: 'zangari_fighter_type_3',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: false,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		red_2: {
			id: 'red_2',
			groupId: 'red',
			type: 'shuttle',
			playerRelation: 'friendly',
			behaviorAssignedGoal: c.possibleGoals.holdStation,
			contents: 'Medicine',
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
							entityId: scene002.entities.red_2.id,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.destroyed.id,
							groupId: scene002.entities.mylok_1.groupId,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.destroyed.id,
							groupId: scene002.entities.mylok_1.groupId,
							requiredPercentage: 100,
						},
					],
				};
			},
			execute(playerId, playerShipType) {
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

				entities.spawn(scene002.entities.red_2, {
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

				entities.spawn(
					scene002.entities.mylok_2,
					{
						posX: 3900,
						posY: 0,
					},
					{
						behaviorAssignedStationX: 980,
						behaviorAssignedStationY: 100,
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
			},
		},
	],
};

export default scene002;
