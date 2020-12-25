import c from '../../utils/constants';
import sc from '../storyConstants';
import behavior from '../../behavior/behavior';
import entities from '../../entities/entities';
import keyboardLayouts from '../../keyboardLayouts';
// import plates from '../../plates';
// import timing from '../../utils/timing';

const scene001 = {
	id: '001',
	storyBeats: [
		{
			id: '01',
			keyboardLayout: keyboardLayouts.play.id,
			cameraMode: c.cameraModes.gameplay,
			objectives: [
				{
					type: sc.objectiveTypes.scan,
					entityId: 'b2508-014',
					text: 'all containers in the area',
				},
			],
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
						behaviorAssignedGoal: behavior.possibleGoals.playerDetermined,
						id: playerId,
					},
					'player'
				);

				entities.spawn(
					'zangari_fighter_type_1',
					{
						posX: 600,
						posY: 0,
					},
					{
						playerRelation: 'neutral',
						behaviorAssignedGoal: behavior.possibleGoals.holdStation,
						id: 'zf_1',
					}
				);

				entities.spawn(
					'zangari_fighter_type_2',
					{
						posX: 600,
						posY: 200,
					},
					{
						playerRelation: 'neutral',
						behaviorAssignedGoal: behavior.possibleGoals.holdStation,
						id: 'zf_2',
					}
				);

				entities.spawn(
					'zangari_fighter_type_3',
					{
						posX: 600,
						posY: -200,
					},
					{
						playerRelation: 'neutral',
						behaviorAssignedGoal: behavior.possibleGoals.holdStation,
						id: 'zf_3',
					}
				);

				entities.spawn(
					'zangari_fighter_type_4',
					{
						posX: 600,
						posY: 400,
					},
					{
						playerRelation: 'neutral',
						behaviorAssignedGoal: behavior.possibleGoals.holdStation,
						id: 'zf_4',
					}
				);

				entities.spawn(
					'container',
					{
						posX: 900,
						posY: 350,
					},
					{
						id: 'b2508-012',
						contents: 'Food rations',
					}
				);

				entities.spawn(
					'container',
					{
						posX: 1800,
						posY: 350,
					},
					{
						id: 'b2508-013',
						contents: 'Medicine',
					}
				);

				entities.spawn(
					'container',
					{
						posX: 900,
						posY: -200,
					},
					{
						id: 'b2508-014',
						contents: 'Smithing tools',
					}
				);
			},
		},
		{
			id: '02',
			keyboardLayout: keyboardLayouts.cutscene.id,
			cameraMode: c.cameraModes.centeredEntity,
			cameraCenteredEntity: '!playerId',
			objectives: [],
			execute() {
				console.log('storyBeat 02');
			},
		},
	],
};

export default scene001;