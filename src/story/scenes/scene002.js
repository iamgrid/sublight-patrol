import c from '../../utils/constants';
// import sc from '../storyConstants';
import entities from '../../entities/entities';
import controlSchemes from '../../controlSchemes';
// import plates from '../../plates';
import timing from '../../utils/timing';
import { messageLayer } from '../../utils/helpers';

const scene002 = {
	handlers: { checkBeatCompletion: null, storyStateFns: null }, // gets its values in story.js@advance()
	id: 'scene002', // gameplay scene ids must start with 'scene' to be recognized by story.js@advance()
	titlePlate: {
		wittyText: 'Wait, the Zee were after the meds?',
		mainText: 'Mission 2 of 4: Escaping the Hunting Party',
	},
	playVolume: {
		minX: -2000,
		maxX: 6000,
		minY: -2500,
		maxY: 2500,
		softBoundary: 300,
	},
	playerStartingPosition: {
		posX: 100,
		posY: 225,
	},
	entities: {
		htran_091: {
			id: 'htran_091',
			groupId: 'red',
			type: 'shuttle',
			playerRelation: 'friendly',
			behaviorAllowedToFlee: false,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
			contents: 'Medicine',
			contentClassification: c.entityContentClassifications.missionObjective,
			hasBeenScanned: true,
		},
		harpax_00097: {
			id: 'harpax_00097',
			type: 'buoy',
		},
		fuel_depot_39_617_e: {
			id: 'fuel_depot_39_617_e',
			type: 'fuel_depot',
		},
		mylok_1: {
			id: 'mylok_1',
			groupId: 'mylok',
			type: 'zangari_fighter_type_4a',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		nazaar_1: {
			id: 'nazaar_1',
			groupId: 'nazaar',
			type: 'zangari_fighter_type_3',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		nazaar_2: {
			id: 'nazaar_2',
			groupId: 'nazaar',
			type: 'zangari_fighter_type_3',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		nazaar_3: {
			id: 'nazaar_3',
			groupId: 'nazaar',
			type: 'zangari_fighter_type_3',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: false,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		pakuuni_1: {
			id: 'pakuuni_1',
			groupId: 'pakuuni',
			type: 'zangari_fighter_type_4',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		hurcha_1: {
			id: 'hurcha_1',
			groupId: 'hurcha',
			type: 'zangari_fighter_type_4',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		hurcha_2: {
			id: 'hurcha_2',
			groupId: 'hurcha',
			type: 'zangari_fighter_type_3',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
	},
	storyBeats: [
		{
			// Beat 1
			keyboardLayout: controlSchemes.play.id,
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
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							entityId: scene002.entities.mylok_1.id,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							entityId: scene002.entities.mylok_1.id,
							requiredPercentage: 100,
						},
					],
				};
			},
			execute(options) {
				scene002.handlers.storyStateFns.addFighterToPlayerHangar(
					c.playableFighterTypeIds.zangari_fighter_type_4,
					true
				);

				const playerId = options.playerId;
				const playerShipType = options.playerShipType;

				entities.spawn(scene002.entities.harpax_00097, {
					posX: 1000,
					posY: 345,
				});

				entities.spawn(scene002.entities.fuel_depot_39_617_e, {
					posX: -1000,
					posY: 0,
				});

				entities.spawn(
					playerShipType,
					{
						posX: scene002.playerStartingPosition.posX,
						posY: scene002.playerStartingPosition.posY,
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
						posX: 2900,
						posY: 500,
					},
					{
						behaviorAssignedStationX: 980,
						behaviorAssignedStationY: 170,
					}
				);

				timing.setTimeout(
					() => {
						messageLayer.show();
						messageLayer.queueMessages([
							{
								messageType: messageLayer.MESSAGE_TYPE_IDS.dialog,
								speaker: 'Ensign Devon (Shuttle pilot)',
								whereAndWhen: 'here and now',
								message:
									'<p>Drat, I guess the Zee are much more interested in these medical supplies than we assumed.</p><p>Get ready for a fight Lieutenant!</p>',
							},
						]);
					},
					timing.modes.play,
					11000
				);
			},
		},
		{
			// Beat 2
			keyboardLayout: controlSchemes.play.id,
			cameraMode: c.cameraModes.gameplay,
			isTheFinalGameplayBeat: false,
			registerObjectives() {
				return {
					show: [
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: scene002.entities.nazaar_1.groupId,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: scene002.entities.nazaar_1.groupId,
							requiredPercentage: 100,
						},
					],
				};
			},
			execute() {
				// const playerId = options.playerId;
				// const playerShipType = options.playerShipType;

				entities.spawn(
					scene002.entities.nazaar_1,
					{
						posX: 2900,
						posY: 500,
					},
					{
						behaviorAssignedStationX: 700,
						behaviorAssignedStationY: 170,
					}
				);

				entities.spawn(
					scene002.entities.nazaar_2,
					{
						posX: 2900,
						posY: 600,
					},
					{
						behaviorAssignedStationX: 620,
						behaviorAssignedStationY: 250,
					}
				);
				entities.spawn(
					scene002.entities.nazaar_3,
					{
						posX: 2900,
						posY: 600,
					},
					{
						behaviorAssignedStationX: 400,
						behaviorAssignedStationY: 0,
					}
				);
			},
		},
		{
			// Beat 3
			keyboardLayout: controlSchemes.play.id,
			cameraMode: c.cameraModes.gameplay,
			isTheFinalGameplayBeat: false,
			registerObjectives() {
				return {
					show: [
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							entityId: scene002.entities.pakuuni_1.id,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							entityId: scene002.entities.pakuuni_1.id,
							requiredPercentage: 100,
						},
					],
				};
			},
			execute() {
				// const playerId = options.playerId;
				// const playerShipType = options.playerShipType;

				entities.spawn(
					scene002.entities.pakuuni_1,
					{
						posX: 2900,
						posY: 500,
					},
					{
						behaviorAssignedStationX: 500,
						behaviorAssignedStationY: 0,
					}
				);
			},
		},
		{
			// Beat 4
			keyboardLayout: controlSchemes.play.id,
			cameraMode: c.cameraModes.gameplay,
			isTheFinalGameplayBeat: false,
			registerObjectives() {
				return {
					show: [
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: scene002.entities.hurcha_1.groupId,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: scene002.entities.hurcha_1.groupId,
							requiredPercentage: 100,
						},
					],
				};
			},
			execute() {
				// const playerId = options.playerId;
				// const playerShipType = options.playerShipType;

				entities.spawn(
					scene002.entities.hurcha_1,
					{
						posX: 2900,
						posY: 500,
					},
					{
						behaviorAssignedStationX: 700,
						behaviorAssignedStationY: 170,
					}
				);

				entities.spawn(
					scene002.entities.hurcha_2,
					{
						posX: 2900,
						posY: 600,
					},
					{
						behaviorAssignedStationX: 620,
						behaviorAssignedStationY: 250,
					}
				);
			},
		},
		{
			// Final beat
			keyboardLayout: controlSchemes.play.id,
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
