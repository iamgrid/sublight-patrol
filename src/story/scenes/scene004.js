import c from '../../utils/constants';
import sc from '../storyConstants';
import entities from '../../entities/entities';
import controlSchemes from '../../controlSchemes';
// import plates from '../../plates';
import timing from '../../utils/timing';
import { messageLayer } from '../../utils/helpers';
import audioLibrary from '../../audio/audioLibrary';
import music from '../../audio/music';

const scene004 = {
	handlers: { checkBeatCompletion: null, storyStateFns: null }, // gets its values in story.js@advance()
	id: 'scene004', // gameplay scene ids must start with 'scene' to be recognized by story.js@advance()
	pairedTrack: audioLibrary.library.music.mission_override.id,
	titlePlate: {
		subTitle: 'Meow or Never',
		title: sc.finalMissionTitle,
	},
	playVolume: {
		minX: -12000,
		maxX: 12000,
		minY: -4000,
		maxY: 4000,
		softBoundary: 300,
	},
	playerStartingPosition: {
		posX: -11000,
		posY: 0,
	},
	entities: {
		htran_091: {
			id: 'htran_091',
			groupId: 'red',
			type: 'shuttle',
			playerRelation: 'friendly',
			behaviorAllowedToFlee: false,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
			hasBeenScanned: true,
		},
		gold_1: {
			id: 'gold_1',
			groupId: 'gold',
			type: 'valkyrie',
			playerRelation: 'friendly',
			behaviorAllowedToFlee: false,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
			hasBeenScanned: true,
		},
		gold_2: {
			id: 'gold_2',
			groupId: 'gold',
			type: 'fenrir_dominator',
			playerRelation: 'friendly',
			behaviorAllowedToFlee: false,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
			hasBeenScanned: true,
		},
		gold_3: {
			id: 'gold_3',
			groupId: 'gold',
			type: 'fenrir_dominator',
			playerRelation: 'friendly',
			behaviorAllowedToFlee: false,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
			hasBeenScanned: true,
		},
		harpax_80946: {
			id: 'harpax_80946',
			type: 'buoy',
		},
		lsb_1901235789: {
			id: 'lsb_1901235789',
			type: 'buoy',
		},
		crg_11811e: {
			id: 'crg_11811e',
			groupId: 'crg',
			type: 'freighter_l2a',
			playerRelation: 'neutral',
			behaviorAssignedGoal: c.possibleGoals.maintainVelocity,
			behaviorAllowedToFlee: false,
			contents: 'Princess Nia & retinue',
			hasBeenScanned: false,
		},
		nazaar_1: {
			id: 'nazaar_1',
			groupId: sc.zangariGroupNames.nazaar,
			type: 'zangari_fighter_type_3',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		nazaar_2: {
			id: 'nazaar_2',
			groupId: sc.zangariGroupNames.nazaar,
			type: 'zangari_fighter_type_3',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		nazaar_3: {
			id: 'nazaar_3',
			groupId: sc.zangariGroupNames.nazaar,
			type: 'zangari_fighter_type_3',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		pakuuni_1: {
			id: 'pakuuni_1',
			groupId: sc.zangariGroupNames.pakuuni,
			type: 'zangari_fighter_type_4',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		pakuuni_2: {
			id: 'pakuuni_2',
			groupId: sc.zangariGroupNames.pakuuni,
			type: 'zangari_fighter_type_4',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		argoon_1: {
			id: 'argoon_1',
			groupId: sc.zangariGroupNames.argoon,
			type: 'zangari_fighter_type_4',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		argoon_2: {
			id: 'argoon_2',
			groupId: sc.zangariGroupNames.argoon,
			type: 'zangari_fighter_type_4',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		argoon_3: {
			id: 'argoon_3',
			groupId: sc.zangariGroupNames.argoon,
			type: 'zangari_fighter_type_4',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		habeen_1: {
			id: 'habeen_1',
			groupId: sc.zangariGroupNames.habeen,
			type: 'zangari_fighter_type_4',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		habeen_2: {
			id: 'habeen_2',
			groupId: sc.zangariGroupNames.habeen,
			type: 'zangari_fighter_type_4',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		habeen_3: {
			id: 'habeen_3',
			groupId: sc.zangariGroupNames.habeen,
			type: 'zangari_fighter_type_4',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		mylok_1: {
			id: 'mylok_1',
			groupId: sc.zangariGroupNames.mylok,
			type: 'zangari_fighter_type_3',
			playerRelation: 'hostile',
			behaviorAllowedToFlee: true,
			behaviorAssignedGoal: c.possibleGoals.holdStation,
		},
		mylok_2: {
			id: 'mylok_2',
			groupId: sc.zangariGroupNames.mylok,
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
							entityId: scene004.entities.crg_11811e.id,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: sc.zangariGroupNames.nazaar,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: sc.zangariGroupNames.pakuuni,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.disabled.id,
							entityId: scene004.entities.crg_11811e.id,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: sc.zangariGroupNames.nazaar,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: sc.zangariGroupNames.pakuuni,
							requiredPercentage: 100,
						},
					],
				};
			},
			execute(options) {
				scene004.handlers.storyStateFns.addFighterToPlayerHangar(
					c.playableFighterTypeIds.zangari_fighter_type_4,
					true
				);

				const playerId = options.playerId;
				const playerShipType = options.playerShipType;

				entities.spawn(scene004.entities.harpax_80946, {
					posX: -10000,
					posY: 160,
				});

				entities.spawn(scene004.entities.lsb_1901235789, {
					posX: 11500,
					posY: 160,
				});

				entities.spawn(
					playerShipType,
					{
						posX: scene004.playerStartingPosition.posX,
						posY: scene004.playerStartingPosition.posY,
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

				entities.spawn(scene004.entities.crg_11811e, {
					posX: -8000,
					posY: 0,
					latVelocity: 0,
					longVelocity: 3,
				});

				entities.spawn(
					scene004.entities.nazaar_1,
					{
						posX: -9600,
						posY: 0,
					},
					{
						behaviorAssignedStationX: -10600,
						behaviorAssignedStationY: 0,
					}
				);

				entities.spawn(
					scene004.entities.nazaar_2,
					{
						posX: -9600,
						posY: 80,
					},
					{
						behaviorAssignedStationX: -10680,
						behaviorAssignedStationY: 80,
					}
				);

				entities.spawn(
					scene004.entities.nazaar_3,
					{
						posX: -9600,
						posY: -80,
					},
					{
						behaviorAssignedStationX: -10680,
						behaviorAssignedStationY: -80,
					}
				);

				entities.spawn(
					scene004.entities.pakuuni_1,
					{
						posX: 8000,
						posY: 0,
					},
					{
						behaviorAssignedStationX: 4000,
						behaviorAssignedStationY: 0,
					}
				);

				entities.spawn(
					scene004.entities.pakuuni_2,
					{
						posX: 8000,
						posY: 80,
					},
					{
						behaviorAssignedStationX: 4080,
						behaviorAssignedStationY: 80,
					}
				);

				timing.setTimeout(
					() => {
						music.playTrack(scene004.pairedTrack);
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
								whereAndWhen:
									'briefing received while en route, 17 minutes ago',
								message:
									"<p>Captain, I apologize for cutting your shore leave short and making you dash back out there like this. We've scrambled Gold group as well, but it looks like they are too far behind you to make a difference.</p>",
							},
							{
								messageType: messageLayer.MESSAGE_TYPE_IDS.dialog,
								speaker: 'Commander Harris',
								whereAndWhen:
									'briefing received while en route, 17 minutes ago',
								message:
									"<p>Here's what you're in for:<br/>The Harpax Palace was trying to see Princess Nia and her retinue safe by sneaking them to the Nim system in an unmarked freighter. Turns out the Zangari have a spy in the palace... Or had a spy there I should say. Long story short, the freighter is now under their control, burning away from our system at full thrust.</p><p>It's not looking good, son. The Zee have their best and brightest covering that vessel. Chasing all of them off solo and disabling the freighter before it reaches the edge of the gravity well and jumps to lightspeed would be a feat beyond most—but perhaps not beyond you.</p>",
							},
							{
								messageType: messageLayer.MESSAGE_TYPE_IDS.dialog,
								speaker: 'Commander Harris',
								whereAndWhen:
									'briefing received while en route, 17 minutes ago',
								message:
									"<p>One bit of good news: to give you an edge, Command made the call to temporarily add the Zangari T4 you helped pilfer to your mobile hangar complement.</p><p>Engineering made quick work of the power systems issue, but as you can imagine, they're also quite protective of their shiny new green murder kitten... Could turn our understanding of starship design on its head and all that nonsense... As I told the Head of Engineering, fretting about a piece of machinery when the life of a future head of state is on the line...<br/>Ok, I really ought to get out of your ear right now.</p>",
							},
							{
								messageType: messageLayer.MESSAGE_TYPE_IDS.dialog,
								speaker: 'Commander Harris',
								whereAndWhen:
									'briefing received while en route, 17 minutes ago',
								message:
									"<p>Ahem, Godspeed, Captain! I don't have to tell you how much the Princess means to people around here. I trust that you'll see her home safe! Harris out.</p>",
							},
						]);
					},
					timing.modes.play,
					9500
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
							groupId: sc.zangariGroupNames.argoon,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: sc.zangariGroupNames.argoon,
							requiredPercentage: 100,
						},
					],
				};
			},
			execute() {
				let holdZeroX = -1600;
				let holdZeroY = 0;

				const cargoShipId = scene004.entities.crg_11811e.id;
				const cargoShipPosition =
					scene004.handlers.storyStateFns.getMomentaryEntityPosition(
						cargoShipId
					);

				if (
					cargoShipPosition.posX !== null &&
					cargoShipPosition.posY !== null
				) {
					holdZeroX = cargoShipPosition.posX;
					holdZeroY = cargoShipPosition.posY;
				}

				entities.spawn(
					scene004.entities.argoon_1,
					{
						posX: 11900,
						posY: 0,
					},
					{
						behaviorAssignedStationX: holdZeroX - 120,
						behaviorAssignedStationY: holdZeroY,
					}
				);

				entities.spawn(
					scene004.entities.argoon_2,
					{
						posX: 11900,
						posY: 80,
					},
					{
						behaviorAssignedStationX: holdZeroX - 20,
						behaviorAssignedStationY: holdZeroY + 100,
					}
				);

				entities.spawn(
					scene004.entities.argoon_3,
					{
						posX: 11900,
						posY: -80,
					},
					{
						behaviorAssignedStationX: holdZeroX - 20,
						behaviorAssignedStationY: holdZeroY - 100,
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
							groupId: sc.zangariGroupNames.habeen,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: sc.zangariGroupNames.mylok,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.mustHaveArrived.id,
							entityId: scene004.entities.htran_091.id,
							requiredPercentage: 100,
						},
					],
					advanceWhen: [
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: sc.zangariGroupNames.habeen,
							requiredPercentage: 100,
						},
						{
							type: c.objectiveTypes.forcedToFleeOrDestroyed.id,
							groupId: sc.zangariGroupNames.mylok,
							requiredPercentage: 100,
						},
					],
				};
			},
			execute() {
				let holdZeroX = -600;
				let holdZeroY = 0;

				const cargoShipId = scene004.entities.crg_11811e.id;
				const cargoShipPosition =
					scene004.handlers.storyStateFns.getMomentaryEntityPosition(
						cargoShipId
					);

				if (
					cargoShipPosition.posX !== null &&
					cargoShipPosition.posY !== null
				) {
					holdZeroX = cargoShipPosition.posX;
					holdZeroY = cargoShipPosition.posY;
				}

				entities.spawn(
					scene004.entities.habeen_1,
					{
						posX: 11900,
						posY: 0,
					},
					{
						behaviorAssignedStationX: holdZeroX - 100,
						behaviorAssignedStationY: holdZeroY,
					}
				);

				entities.spawn(
					scene004.entities.habeen_2,
					{
						posX: 11900,
						posY: 80,
					},
					{
						behaviorAssignedStationX: holdZeroX - 20,
						behaviorAssignedStationY: holdZeroY + 100,
					}
				);

				entities.spawn(
					scene004.entities.habeen_3,
					{
						posX: 11900,
						posY: -80,
					},
					{
						behaviorAssignedStationX: holdZeroX - 20,
						behaviorAssignedStationY: holdZeroY - 100,
					}
				);

				entities.spawn(
					scene004.entities.mylok_1,
					{
						posX: 11900,
						posY: 0,
					},
					{
						behaviorAssignedStationX: holdZeroX - 200,
						behaviorAssignedStationY: holdZeroY,
					}
				);

				entities.spawn(
					scene004.entities.mylok_2,
					{
						posX: 11900,
						posY: 80,
					},
					{
						behaviorAssignedStationX: holdZeroX - 20,
						behaviorAssignedStationY: holdZeroY + 200,
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
				let holdZeroX = -900;
				let holdZeroY = 0;

				const cargoShipId = scene004.entities.crg_11811e.id;
				const cargoShipPosition =
					scene004.handlers.storyStateFns.getMomentaryEntityPosition(
						cargoShipId
					);

				if (
					cargoShipPosition.posX !== null &&
					cargoShipPosition.posY !== null
				) {
					holdZeroX = cargoShipPosition.posX;
					holdZeroY = cargoShipPosition.posY;
				}

				entities.spawn(
					scene004.entities.htran_091,
					{
						posX: -11000,
						posY: 0,
					},
					{
						behaviorAssignedStationX: holdZeroX - 130,
						behaviorAssignedStationY: holdZeroY,
					}
				);

				entities.spawn(
					scene004.entities.gold_1,
					{
						posX: -11000,
						posY: 0,
					},
					{
						behaviorAssignedStationX: holdZeroX - 280,
						behaviorAssignedStationY: holdZeroY,
					}
				);
				entities.spawn(
					scene004.entities.gold_2,
					{
						posX: -11000,
						posY: 0,
					},
					{
						behaviorAssignedStationX: holdZeroX - 20,
						behaviorAssignedStationY: holdZeroY - 100,
					}
				);
				entities.spawn(
					scene004.entities.gold_3,
					{
						posX: -11000,
						posY: 0,
					},
					{
						behaviorAssignedStationX: holdZeroX - 20,
						behaviorAssignedStationY: holdZeroY + 100,
					}
				);

				timing.setTimeout(
					() => {
						messageLayer.show();
						messageLayer.queueMessages([
							{
								messageType: messageLayer.MESSAGE_TYPE_IDS.dialog,
								speaker: 'Ensign Devon (piloting shuttle HTran 091)',
								whereAndWhen: 'here and now',
								message:
									"<p>That was quite a show, Captain!</p><p>Gold group made it here just now, they sound quite disappointed to have missed out on all the action! Still, I'm glad they're here to make sure all of us get home safe.</p><p>Wanna take point on the escort?</p>",
							},
						]);
					},
					timing.modes.play,
					5000
				);
			},
		},
	],
};

export default scene004;
