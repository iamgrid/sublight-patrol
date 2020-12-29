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
			playerRelation: 'neutral',
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		habeen_2: {
			id: 'habeen_2',
			groupId: 'habeen',
			type: 'zangari_fighter_type_2',
			playerRelation: 'neutral',
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		habeen_3: {
			id: 'habeen_3',
			groupId: 'habeen',
			type: 'zangari_fighter_type_3',
			playerRelation: 'neutral',
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		habeen_4: {
			id: 'habeen_4',
			groupId: 'habeen',
			type: 'zangari_fighter_type_4',
			playerRelation: 'neutral',
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
						{
							type: c.objectiveTypes.disabled.id,
							groupId: scene001.entities.habeen_2.groupId,
							requiredPercentage: 50,
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

				entities.spawn(scene001.entities.habeen_1, {
					posX: 600,
					posY: 0,
				});

				entities.spawn(scene001.entities.habeen_2, {
					posX: 600,
					posY: 200,
				});

				entities.spawn(scene001.entities.habeen_3, {
					posX: 600,
					posY: -200,
					facing: -1,
				});

				entities.spawn(scene001.entities.habeen_4, {
					posX: 600,
					posY: 400,
				});

				entities.spawn(scene001.entities.b2508_012, {
					posX: 900,
					posY: 350,
				});

				entities.spawn(scene001.entities.b2508_013, {
					posX: 1800,
					posY: 350,
				});

				entities.spawn(scene001.entities.b2508_014, {
					posX: 900,
					posY: -200,
				});
			},
		},
		{
			keyboardLayout: keyboardLayouts.play.id,
			cameraMode: c.cameraModes.gameplay,
			isTheFinalGameplayBeat: true,
			registerObjectives() {
				return {
					show: [
						{
							type: c.objectiveTypes.forcedToFlee.id,
							entityId: scene001.entities.habeen_3.id,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [],
				};
			},
			execute() {
				console.log('storyBeat 2');
			},
		},
	],
};

export default scene001;
