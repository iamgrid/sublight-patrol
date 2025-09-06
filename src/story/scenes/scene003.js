import c from '../../utils/constants';
import sc from '../storyConstants';
import entities from '../../entities/entities';
import controlSchemes from '../../controlSchemes';
// import plates from '../../plates';
import timing from '../../utils/timing';
import { messageLayer } from '../../utils/helpers';
import audioLibrary from '../../audio/audioLibrary';
import music from '../../audio/music';

const scene003 = {
	handlers: { checkBeatCompletion: null, storyStateFns: null }, // gets its values in story.js@advance()
	id: 'scene003', // gameplay scene ids must start with 'scene' to be recognized by story.js@advance()
	pairedTrack: audioLibrary.library.music.in_a_silent_way.id,
	titlePlate: {
		subTitle: 'Dock and Awe',
		title: 'Mission 3 of 4: Capturing the Prototype',
	},
	playVolume: {
		minX: -2000,
		maxX: 6000,
		minY: -4000,
		maxY: 4000,
		softBoundary: 300,
	},
	playerStartingPosition: {
		posX: 100,
		posY: 225,
	},
	entities: {
		harpax_37188: {
			id: 'harpax_37188',
			type: 'buoy',
		},
		fuel_depot_39_617_e: {
			id: 'fuel_depot_39_617_e',
			type: 'fuel_depot',
		},
		htran_088: {
			id: 'htran_088',
			groupId: 'red',
			type: 'shuttle',
			playerRelation: 'friendly',
			behaviorAssignedGoal: c.possibleGoals.holdStation,
			contents: 'Ensign Devon',
			hasBeenScanned: true,
		},
		pakuuni_1: {
			id: 'pakuuni_1',
			groupId: sc.zangariGroupNames.pakuuni,
			type: 'zangari_fighter_type_4b',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		crg_15496e: {
			id: 'crg_15496e',
			groupId: 'crg',
			type: 'freighter_l1',
			playerRelation: 'neutral',
			behaviorAssignedGoal: c.possibleGoals.holdStation,
			behaviorAllowedToFlee: true,
			contents: 'Titanium billets',
			hasBeenScanned: false,
		},
		argoon_1: {
			id: 'argoon_1',
			groupId: sc.zangariGroupNames.argoon,
			type: 'zangari_fighter_type_3',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		argoon_2: {
			id: 'argoon_2',
			groupId: sc.zangariGroupNames.argoon,
			type: 'zangari_fighter_type_3',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		argoon_3: {
			id: 'argoon_3',
			groupId: sc.zangariGroupNames.argoon,
			type: 'zangari_fighter_type_3',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		argoon_4: {
			id: 'argoon_4',
			groupId: sc.zangariGroupNames.argoon,
			type: 'zangari_fighter_type_3',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		argoon_5: {
			id: 'argoon_5',
			groupId: sc.zangariGroupNames.argoon,
			type: 'zangari_fighter_type_3',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		mylok_1: {
			id: 'mylok_1',
			groupId: sc.zangariGroupNames.mylok,
			type: 'zangari_fighter_type_2',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		mylok_2: {
			id: 'mylok_2',
			groupId: sc.zangariGroupNames.mylok,
			type: 'zangari_fighter_type_2',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		mylok_3: {
			id: 'mylok_3',
			groupId: sc.zangariGroupNames.mylok,
			type: 'zangari_fighter_type_2',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		hurcha_1: {
			id: 'hurcha_1',
			groupId: sc.zangariGroupNames.hurcha,
			type: 'zangari_fighter_type_3',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		hurcha_2: {
			id: 'hurcha_2',
			groupId: sc.zangariGroupNames.hurcha,
			type: 'zangari_fighter_type_3',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		hurcha_3: {
			id: 'hurcha_3',
			groupId: sc.zangariGroupNames.hurcha,
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
							type: c.objectiveTypes.disabled.id,
							entityId: scene003.entities.pakuuni_1.id,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: scene003.entities.argoon_1.groupId,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: scene003.entities.argoon_1.groupId,
							requiredPercentage: 100,
						},
					],
				};
			},
			execute(options) {
				const playerId = options.playerId;
				const playerShipType = options.playerShipType;

				entities.spawn(scene003.entities.harpax_37188, {
					posX: 200,
					posY: 20,
				});

				entities.spawn(
					playerShipType,
					{
						posX: scene003.playerStartingPosition.posX,
						posY: scene003.playerStartingPosition.posY,
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

				entities.spawn(scene003.entities.fuel_depot_39_617_e, {
					posX: 3000,
					posY: 0,
				});

				entities.spawn(
					scene003.entities.pakuuni_1,
					{
						posX: 2860,
						posY: -135,
					},
					{
						behaviorAssignedStationX: 2860,
						behaviorAssignedStationY: -135,
					}
				);

				entities.spawn(
					scene003.entities.crg_15496e,
					{
						posX: 2822,
						posY: 70,
					},
					{
						behaviorAssignedStationX: 2822,
						behaviorAssignedStationY: 70,
					}
				);

				entities.spawn(
					scene003.entities.argoon_1,
					{
						posX: 2680,
						posY: 0,
						facing: -1,
					},
					{
						behaviorAssignedStationX: 2680,
						behaviorAssignedStationY: 0,
					}
				);

				entities.spawn(
					scene003.entities.argoon_2,
					{
						posX: 2700,
						posY: -160,
						facing: -1,
					},
					{
						behaviorAssignedStationX: 2700,
						behaviorAssignedStationY: -160,
					}
				);

				entities.spawn(
					scene003.entities.argoon_3,
					{
						posX: 2700,
						posY: 160,
						facing: -1,
					},
					{
						behaviorAssignedStationX: 2700,
						behaviorAssignedStationY: 160,
					}
				);

				entities.spawn(
					scene003.entities.argoon_4,
					{
						posX: 3320,
						posY: -120,
					},
					{
						behaviorAssignedStationX: 3320,
						behaviorAssignedStationY: -120,
					}
				);

				entities.spawn(
					scene003.entities.argoon_5,
					{
						posX: 3320,
						posY: 120,
					},
					{
						behaviorAssignedStationX: 3320,
						behaviorAssignedStationY: 120,
					}
				);

				timing.setTimeout(
					() => {
						music.playTrack(scene003.pairedTrack);
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
								whereAndWhen: 'pre-flight briefing, 1 hour and 27 minutes ago',
								message:
									'<p>Have a seat Lieutenant.</p><p>The recording of your debrief regarding your encounter with the Type 4 Zangari fighter prototype has been making quite the splash with Command.</p><p>Let me tell you, if the Zee figure out the right power distribution to get the shields and all four cannons working in tandem on that kitten... Our whole operation here might be in serious jeopardy.</p>',
							},
							{
								messageType: messageLayer.MESSAGE_TYPE_IDS.dialog,
								speaker: 'Commander Harris',
								whereAndWhen: 'pre-flight briefing, 1 hour and 27 minutes ago',
								message:
									'<p>Intelligence got lucky and was able to locate another T4 prototype overnighting at a moderately defended fuel depot. You my friend are going in to disable that fighter so we can purloin it and provide Engineering with the opportunity for a proper look-see.</p><p>Be advised though, the asset is reporting that the Zee went with a shields and two powered cannons combo on this T4. Remember, you need to keep those shields mostly drained for your EMP to be able to do its thing.</p><p>Happy hunting Lieutenant!</p>',
							},
							{
								messageType: messageLayer.MESSAGE_TYPE_IDS.system,
								speaker: 'Help System',
								whereAndWhen: 'here and now',
								message: `<p>Use your EMP at close range to disable the Zangari Type 4 prototype fighter. The EMP will only have an effect while the vessel's shields are drained to below ${c.shieldEMPProtectionThreshold} units.</p>`,
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
							groupId: scene003.entities.mylok_1.groupId,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: scene003.entities.mylok_1.groupId,
							requiredPercentage: 100,
						},
					],
				};
			},
			execute() {
				// const playerId = options.playerId;
				// const playerShipType = options.playerShipType;

				entities.spawn(
					scene003.entities.mylok_1,
					{
						posX: -1900,
						posY: 500,
					},
					{
						behaviorAssignedStationX: 2800,
						behaviorAssignedStationY: 0,
					}
				);

				entities.spawn(
					scene003.entities.mylok_2,
					{
						posX: -1900,
						posY: 600,
					},
					{
						behaviorAssignedStationX: 2720,
						behaviorAssignedStationY: -80,
					}
				);
				entities.spawn(
					scene003.entities.mylok_3,
					{
						posX: -1900,
						posY: 600,
					},
					{
						behaviorAssignedStationX: 2720,
						behaviorAssignedStationY: 80,
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
							groupId: scene003.entities.hurcha_1.groupId,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.mustHaveArrived.id,
							entityId: scene003.entities.htran_088.id,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: scene003.entities.hurcha_1.groupId,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.disabled.id,
							entityId: scene003.entities.pakuuni_1.id,
							requiredPercentage: 100,
						},
					],
				};
			},
			execute() {
				// const playerId = options.playerId;
				// const playerShipType = options.playerShipType;

				entities.spawn(
					scene003.entities.hurcha_1,
					{
						posX: -1900,
						posY: 500,
					},
					{
						behaviorAssignedStationX: 2800,
						behaviorAssignedStationY: 0,
					}
				);

				entities.spawn(
					scene003.entities.hurcha_2,
					{
						posX: -1900,
						posY: 600,
					},
					{
						behaviorAssignedStationX: 2720,
						behaviorAssignedStationY: -80,
					}
				);
				entities.spawn(
					scene003.entities.hurcha_3,
					{
						posX: -1900,
						posY: 600,
					},
					{
						behaviorAssignedStationX: 2720,
						behaviorAssignedStationY: 80,
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
				let holdZeroX = 2500;
				let holdZeroY = 0;

				const prototypeId = scene003.entities.pakuuni_1.id;
				const prototypePosition =
					scene003.handlers.storyStateFns.getMomentaryEntityPosition(
						prototypeId
					);

				if (
					prototypePosition.posX !== null &&
					prototypePosition.posY !== null
				) {
					holdZeroX = prototypePosition.posX;
					holdZeroY = prototypePosition.posY;
				}

				entities.spawn(
					scene003.entities.htran_088,
					{
						posX: -1800,
						posY: 0,
					},
					{
						behaviorAssignedStationX: holdZeroX - 90,
						behaviorAssignedStationY: holdZeroY,
					}
				);

				timing.setTimeout(
					() => {
						messageLayer.show();
						messageLayer.queueMessages([
							{
								messageType: messageLayer.MESSAGE_TYPE_IDS.dialog,
								speaker: 'Ensign Durrell (piloting shuttle HTran 088)',
								whereAndWhen: 'here and now',
								message:
									"<p>Excellent job clearing the hostiles and disabling the T4B Lieutenant. Me and Devon will take care of things from here!</p><p>... Devon says he'll race you back to base with the prototype. You up for a friendly wager?</p>",
							},
						]);
					},
					timing.modes.play,
					1500
				);

				// timing.setTimeout(
				// 	() => {
				// 		if (typeof scene003.handlers.checkBeatCompletion === 'function') {
				// 			scene003.handlers.checkBeatCompletion();
				// 		} else {
				// 			console.error('failed to use the checkBeatCompletion handler');
				// 		}
				// 	},
				// 	timing.modes.play,
				// 	10000
				// );
			},
		},
	],
};

export default scene003;
