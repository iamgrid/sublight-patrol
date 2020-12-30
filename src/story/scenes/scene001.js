import c from '../../utils/constants';
// import sc from '../storyConstants';
import entities from '../../entities/entities';
import keyboardLayouts from '../../keyboardLayouts';
// import plates from '../../plates';
// import timing from '../../utils/timing';

const scene001 = {
	id: '001',
	entities: {
		habeen_1: {
			id: 'habeen_1',
			groupId: 'habeen',
			type: 'zangari_fighter_type_1',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: false,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		habeen_2: {
			id: 'habeen_2',
			groupId: 'habeen',
			type: 'zangari_fighter_type_1',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: false,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		argoon_1: {
			id: 'argoon_1',
			groupId: 'argoon',
			type: 'zangari_fighter_type_2',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: false,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		b2508_012: {
			id: 'b2508_012',
			groupId: 'b2508',
			type: 'container',
			contents: 'Food rations',
		},
		b2508_013: {
			id: 'b2508_013',
			groupId: 'b2508',
			type: 'container',
			contents: 'Smithing tools',
		},
		b2508_014: {
			id: 'b2508_014',
			groupId: 'b2508',
			type: 'container',
			contents: 'Medicine',
		},
		red_2: {
			id: 'red_2',
			groupId: 'red',
			type: 'shuttle',
			playerRelation: 'friendly',
			behaviorAssignedGoal: c.possibleGoals.holdStation,
			contents: 'empty',
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
							type: c.objectiveTypes.inspected.id,
							groupId: scene001.entities.b2508_012.groupId,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.inspected.id,
							entityId: scene001.entities.b2508_014.id,
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

				entities.spawn(scene001.entities.b2508_012, {
					posX: 900,
					posY: 225,
				});

				entities.spawn(scene001.entities.b2508_013, {
					posX: 900,
					posY: 150,
				});

				entities.spawn(scene001.entities.b2508_014, {
					posX: 900,
					posY: 300,
				});
			},
		},
		{
			keyboardLayout: keyboardLayouts.play.id,
			cameraMode: c.cameraModes.gameplay,
			isTheFinalGameplayBeat: false,
			registerObjectives() {
				return {
					show: [
						{
							type: c.objectiveTypes.mustHaveSurvived.id,
							entityId: scene001.entities.b2508_014.id,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.mustHaveArrived.id,
							entityId: scene001.entities.red_2.id,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.destroyed.id,
							groupId: scene001.entities.habeen_1.groupId,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.destroyed.id,
							entityId: scene001.entities.argoon_1.id,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.destroyed.id,
							groupId: scene001.entities.habeen_1.groupId,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.destroyed.id,
							entityId: scene001.entities.argoon_1.id,
							requiredPercentage: 100,
						},
					],
				};
			},
			execute() {
				entities.spawn(
					scene001.entities.habeen_1,
					{
						posX: 9900,
						posY: 500,
					},
					{
						behaviorAssignedStationX: 980,
						behaviorAssignedStationY: 170,
					}
				);

				entities.spawn(
					scene001.entities.habeen_2,
					{
						posX: 9900,
						posY: 0,
					},
					{
						behaviorAssignedStationX: 980,
						behaviorAssignedStationY: 100,
					}
				);

				entities.spawn(
					scene001.entities.argoon_1,
					{
						posX: 9900,
						posY: -500,
					},
					{
						behaviorAssignedStationX: 980,
						behaviorAssignedStationY: 30,
					}
				);
			},
		},
		{
			keyboardLayout: keyboardLayouts.play.id,
			cameraMode: c.cameraModes.gameplay,
			isTheFinalGameplayBeat: true,
			registerObjectives() {
				return { show: [], advanceWhen: [] };
			},
			execute() {
				console.log('im heere');
				entities.spawn(
					scene001.entities.red_2,
					{
						posX: -1800,
						posY: 500,
					},
					{
						behaviorAssignedStationX: 820,
						behaviorAssignedStationY: 300,
					}
				);
			},
		},
	],
};

export default scene001;
