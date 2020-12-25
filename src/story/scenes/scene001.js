import c from '../../utils/constants';
import sc from '../storyConstants';
import behavior from '../../behavior/behavior';
import entities from '../../entities/entities';
import keyboardLayouts from '../../keyboardLayouts';
// import plates from '../../plates';
// import timing from '../../utils/timing';
// import hud from '../../hud';

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
