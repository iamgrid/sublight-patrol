import c from '../../utils/constants';
import sc from '../storyConstants';
import entities from '../../entities/entities';
import controlSchemes from '../../controlSchemes';
// import plates from '../../plates';
import timing from '../../utils/timing';
import { messageLayer } from '../../utils/helpers';
import audioLibrary from '../../audio/audioLibrary';
import music from '../../audio/music';

const scene001 = {
	handlers: { checkBeatCompletion: null, storyStateFns: null }, // gets its values in story.js@advance()
	id: 'scene001', // gameplay scene ids must start with 'scene' to be recognized by story.js@advance()
	pairedTrack: audioLibrary.library.music.tensioner.id,
	titlePlate: {
		subTitle: "Welcome to space. It's time to put your big boy pants on!",
		title: 'Mission 1 of 4: Looters on Aisle 3',
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
			contents: 'Aluminium billets',
			hasBeenScanned: false,
		},
		crg_15497e: {
			id: 'crg_15497e',
			groupId: 'crg',
			type: 'freighter_l3',
			playerRelation: 'neutral',
			behaviorAssignedGoal: c.possibleGoals.maintainVelocity,
			contents: 'Titanium billets',
			hasBeenScanned: false,
		},
		habeen_1: {
			id: 'habeen_1',
			groupId: sc.zangariGroupNames.habeen,
			type: 'zangari_fighter_type_1',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: false,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		habeen_2: {
			id: 'habeen_2',
			groupId: sc.zangariGroupNames.habeen,
			type: 'zangari_fighter_type_1',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: false,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		argoon_1: {
			id: 'argoon_1',
			groupId: sc.zangariGroupNames.argoon,
			type: 'zangari_fighter_type_2',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		argoon_2: {
			id: 'argoon_2',
			groupId: sc.zangariGroupNames.argoon,
			type: 'zangari_fighter_type_1',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: false,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		argoon_3: {
			id: 'argoon_3',
			groupId: sc.zangariGroupNames.argoon,
			type: 'zangari_fighter_type_1',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		b2508_001: {
			id: 'b2508_001',
			groupId: 'b2508',
			type: 'container',
			contents: 'Steel rolls',
			contentClassification: c.entityContentClassifications.irrelevant,
		},
		b2508_002: {
			id: 'b2508_002',
			groupId: 'b2508',
			type: 'container',
			contents: 'Smithing tools',
			contentClassification: c.entityContentClassifications.irrelevant,
		},
		b2508_003: {
			id: 'b2508_003',
			groupId: 'b2508',
			type: 'container',
			contents: 'Medicine',
		},
		b2508_004: {
			id: 'b2508_004',
			groupId: 'b2508',
			type: 'container',
			contents: 'Smithing tools',
			contentClassification: c.entityContentClassifications.irrelevant,
		},
		b2508_006: {
			id: 'b2508_006',
			groupId: 'b2508',
			type: 'container',
			contents: 'Furnace components',
			contentClassification: c.entityContentClassifications.irrelevant,
		},
		b2508_007: {
			id: 'b2508_007',
			groupId: 'b2508',
			type: 'container',
			contents: 'Furnace components',
			contentClassification: c.entityContentClassifications.irrelevant,
		},
		b2508_008: {
			id: 'b2508_008',
			groupId: 'b2508',
			type: 'container',
			contents: 'Furnace components',
			contentClassification: c.entityContentClassifications.irrelevant,
		},
		b2508_009: {
			id: 'b2508_009',
			groupId: 'b2508',
			type: 'container',
			contents: 'Steel rolls',
			contentClassification: c.entityContentClassifications.irrelevant,
		},
		b2508_010: {
			id: 'b2508_010',
			groupId: 'b2508',
			type: 'container',
			contents: 'Steel rolls',
			contentClassification: c.entityContentClassifications.irrelevant,
		},
		b2507_007: {
			id: 'b2507_007',
			groupId: 'b2507',
			type: 'container',
			contents: 'Titanium billets',
			contentClassification: c.entityContentClassifications.irrelevant,
		},
		b2507_008: {
			id: 'b2507_008',
			groupId: 'b2507',
			type: 'container',
			contents: 'Aluminum billets',
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
							groupId: scene001.entities.habeen_1.groupId,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.mustHaveSurvived.id,
							groupId: scene001.entities.b2508_001.groupId,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: scene001.entities.habeen_1.groupId,
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
					scene001.entities.habeen_1,
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
					scene001.entities.habeen_2,
					{
						posX: 2900,
						posY: 300,
					},
					{
						behaviorAssignedStationX: 980,
						behaviorAssignedStationY: 175,
					}
				);

				entities.spawn(scene001.entities.b2508_001, {
					posX: 1900,
					posY: 150,
				});

				entities.spawn(scene001.entities.b2508_002, {
					posX: 1900,
					posY: 225,
				});

				entities.spawn(scene001.entities.b2508_003, {
					posX: 1900,
					posY: 300,
				});

				entities.spawn(scene001.entities.b2508_004, {
					posX: 2000,
					posY: 75,
				});

				entities.spawn(scene001.entities.b2508_006, {
					posX: 2000,
					posY: 225,
				});

				entities.spawn(scene001.entities.b2508_007, {
					posX: 2000,
					posY: 300,
				});

				entities.spawn(scene001.entities.b2508_008, {
					posX: 2000,
					posY: 375,
				});

				entities.spawn(scene001.entities.b2508_009, {
					posX: 2100,
					posY: 150,
				});

				entities.spawn(scene001.entities.b2508_010, {
					posX: 2100,
					posY: 225,
				});

				entities.spawn(scene001.entities.b2507_007, {
					posX: 2800,
					posY: 300,
				});

				entities.spawn(scene001.entities.b2507_008, {
					posX: 2800,
					posY: 375,
				});

				timing.setTimeout(
					() => {
						music.playTrack(scene001.pairedTrack);
					},
					timing.modes.play,
					5000
				);

				timing.setTimeout(
					() => {
						messageLayer.show();
						messageLayer.queueMessages([
							{
								messageType: messageLayer.MESSAGE_TYPE_IDS.dialog,
								speaker: 'Commander Harris',
								whereAndWhen: 'pre-flight briefing, 53 minutes ago',
								message:
									'<p>Good morning Lieutenant!</p><p>The Harpax Ministry of Health has tasked us with recovering a case of indispensable medicine from Container Yard H17 which has recently been overrun by the Zangari.</p>',
							},
							{
								messageType: messageLayer.MESSAGE_TYPE_IDS.dialog,
								speaker: 'Commander Harris',
								whereAndWhen: 'pre-flight briefing, 53 minutes ago',
								message:
									'<p>Your job is to chase off the enemy fighters present while making sure the remaining containers stay in one piece until our shuttle can arrive to pick up the goods.</p><p>Good hunting!</p>',
							},
							{
								messageType: messageLayer.MESSAGE_TYPE_IDS.system,
								speaker: 'Help System',
								whereAndWhen: 'here and now',
								message:
									'<p>Use the pause menu ([ESC] key) to see your current objectives and your combat log.</p><p>The list of objectives will update and expand as you progress through a mission, so remember to check back on the pause menu any time you are unsure what to do next!</p>',
							},
						]);
					},
					timing.modes.play,
					11000
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
							groupId: scene001.entities.argoon_1.groupId,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: scene001.entities.argoon_1.groupId,
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
						behaviorAssignedStationX: 2180,
						behaviorAssignedStationY: 230,
					}
				);

				entities.spawn(
					scene001.entities.argoon_2,
					{
						posX: 3900,
						posY: 0,
					},
					{
						behaviorAssignedStationX: 2240,
						behaviorAssignedStationY: 130,
					}
				);

				entities.spawn(
					scene001.entities.argoon_3,
					{
						posX: 3900,
						posY: 220,
					},
					{
						behaviorAssignedStationX: 2240,
						behaviorAssignedStationY: 320,
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
