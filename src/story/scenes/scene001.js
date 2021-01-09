import c from '../../utils/constants';
// import sc from '../storyConstants';
import entities from '../../entities/entities';
import controlSchemes from '../../controlSchemes';
// import plates from '../../plates';
// import timing from '../../utils/timing';

const scene001 = {
	handlers: { checkBeatCompletion: null }, // gets its values in story.js@advance()
	id: '001',
	titlePlate: {
		wittyText: "it's time to put your big boy pants on",
		mainText: 'Mission 1/8: Welcome to vacuum',
	},
	playVolume: {
		minX: -2000,
		maxX: 4000,
		minY: -2500,
		maxY: 2500,
		softBoundary: 300,
	},
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
		mylok_1: {
			id: 'mylok_1',
			groupId: 'mylok',
			type: 'zangari_fighter_type_1',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: false,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		mylok_2: {
			id: 'mylok_2',
			groupId: 'mylok',
			type: 'zangari_fighter_type_1',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: false,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		mylok_3: {
			id: 'mylok_3',
			groupId: 'mylok',
			type: 'zangari_fighter_type_1',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: false,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		b2508_012: {
			id: 'b2508_012',
			groupId: 'b2508',
			type: 'container',
			contents: 'Tranquilizers',
			contentClassification: c.entityContentClassifications.illicit,
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
			contentClassification: c.entityContentClassifications.missionObjective,
		},
		htran_091: {
			id: 'htran_091',
			groupId: 'red',
			type: 'shuttle',
			playerRelation: 'friendly',
			behaviorAssignedGoal: c.possibleGoals.holdStation,
			contents: 'No cargo',
			hasBeenScanned: true,
		},
		harpax_52164: {
			id: 'harpax_52164',
			type: 'buoy',
		},
	},
	storyBeats: [
		{
			keyboardLayout: controlSchemes.play.id,
			cameraMode: c.cameraModes.gameplay,
			isTheFinalGameplayBeat: false,
			registerObjectives() {
				return {
					show: [
						{
							type: c.objectiveTypes.destroyed.id,
							groupId: scene001.entities.mylok_1.groupId,
							requiredPercentage: 100,
						},
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
				entities.spawn(scene001.entities.harpax_52164, {
					posX: 300,
					posY: 225,
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

				entities.spawn(
					scene001.entities.mylok_1,
					{
						posX: 2900,
						posY: 500,
					},
					{
						behaviorAssignedStationX: 980,
						behaviorAssignedStationY: 225,
					}
				);
				entities.spawn(
					scene001.entities.mylok_2,
					{
						posX: 2900,
						posY: 300,
					},
					{
						behaviorAssignedStationX: 980,
						behaviorAssignedStationY: 100,
					}
				);
				entities.spawn(
					scene001.entities.mylok_3,
					{
						posX: 2900,
						posY: 100,
					},
					{
						behaviorAssignedStationX: 980,
						behaviorAssignedStationY: 350,
					}
				);

				entities.spawn(scene001.entities.b2508_012, {
					posX: 1900,
					posY: 225,
				});

				entities.spawn(scene001.entities.b2508_013, {
					posX: 1900,
					posY: 150,
				});

				entities.spawn(scene001.entities.b2508_014, {
					posX: 1900,
					posY: 300,
				});
			},
		},
		{
			keyboardLayout: controlSchemes.play.id,
			cameraMode: c.cameraModes.gameplay,
			isTheFinalGameplayBeat: false,
			registerObjectives() {
				return {
					show: [
						{
							type: c.objectiveTypes.destroyed.id,
							entityId: scene001.entities.b2508_012.id,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.mustHaveSurvived.id,
							entityId: scene001.entities.b2508_014.id,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.mustHaveArrived.id,
							entityId: scene001.entities.htran_091.id,
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
							entityId: scene001.entities.b2508_012.id,
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
				};
			},
			execute() {
				entities.spawn(
					scene001.entities.habeen_1,
					{
						posX: 3900,
						posY: 500,
					},
					{
						behaviorAssignedStationX: 1980,
						behaviorAssignedStationY: 170,
					}
				);

				entities.spawn(
					scene001.entities.habeen_2,
					{
						posX: 3900,
						posY: 0,
					},
					{
						behaviorAssignedStationX: 1980,
						behaviorAssignedStationY: 100,
					}
				);

				entities.spawn(
					scene001.entities.argoon_1,
					{
						posX: 3900,
						posY: -500,
					},
					{
						behaviorAssignedStationX: 1980,
						behaviorAssignedStationY: 30,
					}
				);
			},
		},
		{
			keyboardLayout: controlSchemes.play.id,
			cameraMode: c.cameraModes.gameplay,
			isTheFinalGameplayBeat: true,
			registerObjectives() {
				return { show: [], advanceWhen: [] };
			},
			execute() {
				entities.spawn(
					scene001.entities.htran_091,
					{
						posX: -1800,
						posY: 500,
					},
					{
						behaviorAssignedStationX: 1820,
						behaviorAssignedStationY: 300,
					}
				);
			},
		},
	],
};

export default scene001;
