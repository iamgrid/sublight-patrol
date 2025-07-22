import c from '../../utils/constants';
// import sc from '../storyConstants';
import entities from '../../entities/entities';
import controlSchemes from '../../controlSchemes';
// import plates from '../../plates';
import timing from '../../utils/timing';
import { dialog } from '../../utils/helpers';

const scene001 = {
	handlers: { checkBeatCompletion: null }, // gets its values in story.js@advance()
	id: 'scene001', // gameplay scene ids must start with 'scene' to be recognized by story.js@advance()
	titlePlate: {
		wittyText: "It's time to put your big boy pants on",
		mainText: 'Mission 1 of 2: Welcome to Space!',
	},
	playVolume: {
		minX: -2000,
		maxX: 4000,
		minY: -2500,
		maxY: 2500,
		softBoundary: 300,
	},
	playerStartingPosition: {
		posX: 100,
		posY: 225,
	},
	entities: {
		crg_15496e: {
			id: 'crg_15496e',
			groupId: 'crg',
			type: 'freighter_l1',
			playerRelation: 'neutral',
			behaviorAssignedGoal: c.possibleGoals.maintainVelocity,
			contents: 'Empty',
			hasBeenScanned: false,
		},
		crg_15497e: {
			id: 'crg_15497e',
			groupId: 'crg',
			type: 'freighter_l1',
			playerRelation: 'neutral',
			behaviorAssignedGoal: c.possibleGoals.maintainVelocity,
			contents: 'Empty',
			hasBeenScanned: false,
		},
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
			behaviorAllowedToFlee: true,
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
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		b2508_012: {
			id: 'b2508_012',
			groupId: 'b2508',
			type: 'container',
			contents: 'Steel rolls',
			contentClassification: c.entityContentClassifications.irrelevant,
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
			contentClassification: c.entityContentClassifications.irrelevant,
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
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: scene001.entities.mylok_1.groupId,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.mustHaveSurvived.id,
							groupId: scene001.entities.b2508_013.groupId,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: scene001.entities.mylok_1.groupId,
							requiredPercentage: 100,
						},
					],
				};
			},
			execute(options) {
				const playerId = options.playerId;
				const playerShipType = options.playerShipType;
				entities.spawn(scene001.entities.harpax_52164, {
					posX: 300,
					posY: 225,
				});

				entities.spawn(
					playerShipType,
					{
						posX: scene001.playerStartingPosition.posX,
						posY: scene001.playerStartingPosition.posY,
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
					scene001.entities.crg_15496e,
					{
						posX: 1600,
						posY: 375,
						latVelocity: 0,
						longVelocity: -4,
						facing: -1,
					},
					{}
				);

				entities.spawn(
					scene001.entities.crg_15497e,
					{
						posX: 3900,
						posY: 90,
						latVelocity: 0,
						longVelocity: -4,
						facing: -1,
					},
					{}
				);

				entities.spawn(
					scene001.entities.mylok_1,
					{
						posX: 2900, // where the enemy fighter spawns
						posY: 500,
					},
					{
						behaviorAssignedStationX: 980, // where the enemy fighter will move to hold station
						behaviorAssignedStationY: 275,
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
						behaviorAssignedStationY: 175,
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

				timing.setTimeout(
					() => {
						dialog.say('Test Speaker', 'This is a test');
					},
					timing.modes.play,
					8000
				);

				timing.setTimeout(
					() => {
						dialog.say('', '', true);
					},
					timing.modes.play,
					12000
				);
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
							type: c.objectiveTypes.mustHaveArrived.id,
							entityId: scene001.entities.htran_091.id,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: scene001.entities.habeen_1.groupId,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							entityId: scene001.entities.argoon_1.id,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: scene001.entities.habeen_1.groupId,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							entityId: scene001.entities.argoon_1.id,
							requiredPercentage: 100,
						},
					],
				};
			},
			execute() {
				entities.spawn(
					scene001.entities.argoon_1,
					{
						posX: 3900,
						posY: 170,
					},
					{
						behaviorAssignedStationX: 1980,
						behaviorAssignedStationY: 170,
					}
				);

				entities.spawn(
					scene001.entities.habeen_1,
					{
						posX: 3900,
						posY: 0,
					},
					{
						behaviorAssignedStationX: 2030,
						behaviorAssignedStationY: 120,
					}
				);

				entities.spawn(
					scene001.entities.habeen_2,
					{
						posX: 3900,
						posY: 220,
					},
					{
						behaviorAssignedStationX: 2030,
						behaviorAssignedStationY: 220,
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
