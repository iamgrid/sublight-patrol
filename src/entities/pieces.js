import c from '../utils/constants';
import audioLibrary from '../audio/audioLibrary';

const pieces = {
	entity: {
		immutable: {
			entityType: null,
			typeShorthand: null,
			model: null,
			width: null,
			length: null,
			canMove: false,
			fancyEffects: false,
			hasShields: false,
			isTargetable: false,
			isBackgroundEntity: false, // set to true for buoys, stations and other non-shootable entities
			targetingPriority: 10,
			colors: c.groups.general.groupId,
		},
		mutable: {
			id: null,
			displayId: null,
			hasBeenScanned: false,
			isDamaged: false,
		},
	},

	ship: {
		immutable: {
			hasHull: true,
			hasEMP: false,
			hasCannons: false,
			thrusters: null,
			maxSystemStrength: null,
			canMove: true,
			fancyEffects: true,
			isTargetable: true,
			targetingPriority: 5,
			hasBehavior: true,
		},
		mutable: {
			isDisabled: false,
			systemStrength: null,
			assignedPlayerRelation: null,
			playerRelation: null,
			contents: 'No cargo',
			contentClassification: c.entityContentClassifications.irrelevant,
			facing: 1,
		},
	},

	container: {
		immutable: {
			typeShorthand: 'CNT',
			model: '/other/GContainer',
			hasHull: true,
			isTargetable: true,
			targetingPriority: 9,
			maxHullStrength: 75,
			maxSystemStrength: 50,
			width: 34,
			length: 44,
		},
		mutable: {
			playerRelation: 'neutral',
			contents: null,
			hullStrength: null,
			systemStrength: null,
			contentClassification: c.entityContentClassifications.irrelevant,
		},
	},

	buoy: {
		immutable: {
			typeShorthand: 'BUO',
			model: '/other/Buoy',
			width: 10,
			length: 10,
			isBackgroundEntity: true,
		},
		mutable: {},
	},

	fuel_depot: {
		immutable: {
			typeShorthand: 'DEP',
			model: '/other/FuelDepot',
			width: 1128,
			length: 272,
			isBackgroundEntity: true,
		},
		mutable: {},
	},

	hasHull: {
		immutable: {
			maxHullStrength: null,
		},
		mutable: {
			hullStrength: null,
		},
	},

	hasShields: {
		immutable: {
			maxShieldStrength: null,
			shieldRechargeRate: null,
		},
		mutable: {
			shieldStrength: null,
		},
	},

	hasEMP: {
		immutable: {
			eMPStrength: null,
		},
		mutable: {},
	},

	hasCannons: {
		immutable: {
			targetingPriority: 1,
			colors: null,
			cannonPower: null,
			cannonFiringSpeed: null,
			cannonPositions: null,
			cannonShots: null,
			cannonCooldown: null,
			cannonSoundEffect: null,
		},
		mutable: {},
	},

	hasBehavior: {
		immutable: {},
		mutable: {
			behaviorCurrentGoal: null,
			behaviorGuarding: '',
			behaviorAttacking: '',
			behaviorPreferredAttackDistance: null,
			behaviorAllowedToAvoidShots: true,
			behaviorAllowedToFlee: true,
		},
	},

	shuttle: {
		immutable: {
			typeShorthand: 'SH',
			model: '/ships/Shuttle',
			maxHullStrength: 100,
			hasShields: true,
			maxShieldStrength: 50,
			shieldRechargeRate: 4,
			maxSystemStrength: 200,
			thrusters: {
				main: 5,
				side: 3,
				front: 3,
			},
			hasEMP: false,
			hasCannons: false,
			colors: c.groups.human_empire.groupId,
			width: 36,
			length: 86,
		},
		mutable: {},
	},
	zangari_shuttle: {
		immutable: {
			typeShorthand: 'ZS',
			model: '/ships/ZangariShuttle',
			colors: c.groups.zangari.groupId,
		},
		mutable: {},
	},

	freighter_l1: {
		immutable: {
			typeShorthand: 'FR',
			model: '/ships/FreighterL1',
			maxHullStrength: 100,
			hasShields: false,
			maxSystemStrength: 200,
			thrusters: {
				main: 4,
				side: 3,
				front: 3,
			},
			hasEMP: false,
			hasCannons: false,
			colors: c.groups.human_empire.groupId,
			width: 34,
			length: 88,
		},
		mutable: {},
	},
	freighter_l2: {
		immutable: {
			model: '/ships/FreighterL2',
			thrusters: {
				main: 4,
				side: 3,
				front: 3,
			},
			width: 34,
			length: 130,
		},
		mutable: {},
	},
	freighter_l2a: {
		immutable: {
			maxSystemStrength: 1500,
			thrusters: {
				main: 3,
				side: 2,
				front: 2,
			},
		},
		mutable: {},
	},
	freighter_l3: {
		immutable: {
			model: '/ships/FreighterL3',
			thrusters: {
				main: 4,
				side: 3,
				front: 3,
			},
			width: 34,
			length: 172,
		},
		mutable: {},
	},

	fenrir: {
		immutable: {
			typeShorthand: 'F/R',
			model: '/ships/Fenrir',
			maxHullStrength: 125,
			hasShields: true,
			maxShieldStrength: 100,
			shieldRechargeRate: 4,
			maxSystemStrength: 1000,
			thrusters: {
				main: 8,
				side: 4,
				front: 6,
			},
			hasEMP: true,
			eMPStrength: 2,
			hasCannons: true,
			colors: c.groups.human_empire.groupId,
			cannonPower: 4,
			cannonFiringSpeed: 0.2,
			cannonShots: 20,
			cannonCooldown: 0.8,
			cannonSoundEffect: audioLibrary.library.soundEffects.laser_type1.id,
			cannonPositions: [
				{ lengthWise: 15, widthWise: 4 },
				{ lengthWise: 15, widthWise: -4 },
			],
			width: 49,
			length: 50,
		},
		mutable: {},
	},

	fenrir_dominator: {
		immutable: {
			typeShorthand: 'F/D',
			model: '/ships/FenrirDominator',
			maxHullStrength: 150,
			maxSystemStrength: 1500,
			thrusters: {
				main: 9,
				side: 4,
				front: 6,
			},
			eMPStrength: 3,
			cannonPower: 5,
			cannonFiringSpeed: 0.18,
			cannonShots: 24,
			cannonCooldown: 0.7,
		},
		mutable: {},
	},

	valkyrie: {
		immutable: {
			typeShorthand: 'V/E',
			model: '/ships/Valkyrie',
			maxHullStrength: 125,
			hasShields: true,
			maxShieldStrength: 150,
			shieldRechargeRate: 6,
			maxSystemStrength: 1000,
			thrusters: {
				main: 8,
				side: 6,
				front: 7,
			},
			hasEMP: true,
			eMPStrength: 5,
			hasCannons: true,
			colors: c.groups.human_empire.groupId,
			cannonPower: 4,
			cannonFiringSpeed: 0.16,
			cannonShots: 32,
			cannonCooldown: 1,
			cannonSoundEffect: audioLibrary.library.soundEffects.laser_type1.id,
			cannonPositions: [
				{ lengthWise: 17, widthWise: 4 },
				{ lengthWise: 17, widthWise: -4 },
				{ lengthWise: 18, widthWise: 18 },
				{ lengthWise: 18, widthWise: -18 },
			],
			width: 49,
			length: 52,
		},
		mutable: {},
	},
	zangari_fighter_type_1: {
		immutable: {
			typeShorthand: 'Z1',
			model: '/ships/ZangariFighterType1',
			maxHullStrength: 100,
			hasShields: false,
			maxSystemStrength: 250,
			thrusters: {
				main: 5,
				side: 2,
				front: 2,
			},
			hasEMP: false,
			hasCannons: true,
			colors: c.groups.zangari.groupId,
			cannonPower: 5,
			cannonFiringSpeed: 0.3,
			cannonShots: 16,
			cannonCooldown: 1,
			cannonSoundEffect: audioLibrary.library.soundEffects.laser_type2.id,
			cannonPositions: [
				{ lengthWise: 17, widthWise: 4 },
				{ lengthWise: 17, widthWise: -4 },
			],
			width: 52,
			length: 48,
		},
		mutable: {},
	},
	zangari_fighter_type_1__EASY: {
		immutable: {
			cannonPower: 3,
			maxHullStrength: 60,
		},
		mutable: {},
	},
	zangari_fighter_type_1__NORMAL: {
		immutable: {
			cannonPower: 4,
			maxHullStrength: 80,
		},
		mutable: {},
	},
	zangari_fighter_type_2: {
		immutable: {
			typeShorthand: 'Z2',
			model: '/ships/ZangariFighterType2',
			maxHullStrength: 150,
			hasShields: false,
			maxSystemStrength: 250,
			thrusters: {
				main: 6,
				side: 2,
				front: 2,
			},
			hasEMP: false,
			hasCannons: true,
			colors: c.groups.zangari.groupId,
			cannonPower: 4,
			cannonFiringSpeed: 0.25,
			cannonShots: 16,
			cannonCooldown: 1,
			cannonSoundEffect: audioLibrary.library.soundEffects.laser_type2.id,
			cannonPositions: [
				{ lengthWise: 17, widthWise: 4 },
				{ lengthWise: 17, widthWise: -4 },
			],
			width: 52,
			length: 40,
		},
		mutable: {},
	},
	zangari_fighter_type_3: {
		immutable: {
			typeShorthand: 'Z3',
			model: '/ships/ZangariFighterType3',
			maxHullStrength: 75,
			hasShields: true,
			maxShieldStrength: 100,
			shieldRechargeRate: 4,
			maxSystemStrength: 500,
			thrusters: {
				main: 8,
				side: 6,
				front: 5,
			},
			hasEMP: false,
			hasCannons: true,
			colors: c.groups.zangari.groupId,
			cannonPower: 4,
			cannonFiringSpeed: 0.2,
			cannonShots: 24,
			cannonCooldown: 0.8,
			cannonSoundEffect: audioLibrary.library.soundEffects.laser_type2.id,
			cannonPositions: [
				{ lengthWise: 17, widthWise: 4 },
				{ lengthWise: 17, widthWise: -4 },
				{ lengthWise: 8, widthWise: 10 },
				{ lengthWise: 8, widthWise: -10 },
			],
			width: 52,
			length: 58,
		},
		mutable: {},
	},
	zangari_fighter_type_4: {
		immutable: {
			typeShorthand: 'Z4',
			model: '/ships/ZangariFighterType4',
			maxHullStrength: 125,
			hasShields: true,
			maxShieldStrength: 175,
			shieldRechargeRate: 6,
			maxSystemStrength: 250,
			thrusters: {
				main: 8,
				side: 7,
				front: 7,
			},
			hasEMP: true,
			eMPStrength: 5,
			hasCannons: true,
			colors: c.groups.zangari.groupId,
			cannonPower: 6,
			cannonFiringSpeed: 0.14,
			cannonShots: 32,
			cannonCooldown: 0.6,
			cannonSoundEffect: audioLibrary.library.soundEffects.laser_type2.id,
			cannonPositions: [
				{ lengthWise: 17, widthWise: 4 },
				{ lengthWise: 17, widthWise: -4 },
				{ lengthWise: 8, widthWise: 10 },
				{ lengthWise: 8, widthWise: -10 },
			],
			width: 52,
			length: 44,
		},
		mutable: {},
	},
	zangari_fighter_type_4a: {
		immutable: {
			typeShorthand: 'Z4A',
			hasShields: false,
			maxHullStrength: 175,
			maxShieldStrength: 0,
			shieldRechargeRate: 0,
			thrusters: {
				main: 8,
				side: 6,
				front: 6,
			},
		},
		mutable: {},
	},
	zangari_fighter_type_4b: {
		immutable: {
			typeShorthand: 'Z4B',
			cannonShots: 24,
			cannonPositions: [
				{ lengthWise: 17, widthWise: 4 },
				{ lengthWise: 17, widthWise: -4 },
			],
		},
		mutable: {},
	},
};

export default pieces;
