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
		},
		mutable: {
			id: null,
			displayId: null,
			hasBeenScanned: false,
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
			hasBehavior: true,
		},
		mutable: {
			isDisabled: false,
			systemStrength: null,
			assignedPlayerRelation: null,
			playerRelation: null,
			contents: 'No cargo',
			facing: 1,
		},
	},

	container: {
		immutable: {
			typeShorthand: 'CNT',
			model: '/other/GContainer',
			hasHull: true,
			isTargetable: true,
			maxHullStrength: 75,
			maxSystemStrength: 5,
			width: 34,
			length: 44,
		},
		mutable: {
			playerRelation: 'neutral',
			contents: null,
			hullStrength: null,
			systemStrength: null,
		},
	},

	buoy: {
		immutable: {
			typeShorthand: 'BUO',
			model: '/other/Buoy',
			width: 10,
			length: 10,
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
			eMPRechargeRate: null,
		},
		mutable: {
			eMPIsCharging: false,
		},
	},

	hasCannons: {
		immutable: {
			cannonColor: null,
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

	fenrir: {
		immutable: {
			typeShorthand: 'F/R',
			model: '/ships/Fenrir',
			maxHullStrength: 125,
			hasShields: true,
			maxShieldStrength: 100,
			shieldRechargeRate: 4,
			maxSystemStrength: 100,
			thrusters: {
				main: 8,
				side: 4,
				front: 6,
			},
			hasEMP: true,
			eMPStrength: 1,
			eMPRechargeRate: 0.25,
			hasCannons: true,
			cannonColor: c.races.humans.laserColor,
			cannonPower: 4,
			cannonFiringSpeed: 0.2,
			cannonShots: 20,
			cannonCooldown: 0.8,
			cannonSoundEffect: audioLibrary.library.laser_type1.id,
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
			model: '/ships/Fenrir',
			maxHullStrength: 150,
			maxSystemStrength: 150,
			thrusters: {
				main: 9,
				side: 4,
				front: 6,
			},
			eMPStrength: 2,
			cannonPower: 5,
			cannonFiringSpeed: 0.18,
		},
		mutable: {},
	},

	valkyrie: {
		immutable: {
			typeShorthand: 'V/E',
			model: '/ships/Valkyrie',
			maxHullStrength: 75,
			hasShields: true,
			maxShieldStrength: 150,
			shieldRechargeRate: 6,
			maxSystemStrength: 100,
			thrusters: {
				main: 8,
				side: 6,
				front: 7,
			},
			hasEMP: true,
			eMPStrength: 1,
			eMPRechargeRate: 0.25,
			hasCannons: true,
			cannonColor: c.races.humans.laserColor,
			cannonPower: 4,
			cannonFiringSpeed: 0.16,
			cannonShots: 32,
			cannonCooldown: 1,
			cannonSoundEffect: audioLibrary.library.laser_type1.id,
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
			typeShorthand: 'Z/1',
			model: '/ships/ZangariFighterType1',
			maxHullStrength: 50,
			hasShields: false,
			maxSystemStrength: 25,
			thrusters: {
				main: 5,
				side: 2,
				front: 2,
			},
			hasEMP: false,
			hasCannons: true,
			cannonColor: c.races.zangari.laserColor,
			cannonPower: 4,
			cannonFiringSpeed: 0.4,
			cannonShots: 12,
			cannonCooldown: 1,
			cannonSoundEffect: audioLibrary.library.laser_type2.id,
			cannonPositions: [
				{ lengthWise: 17, widthWise: 4 },
				{ lengthWise: 17, widthWise: -4 },
			],
			width: 52,
			length: 48,
		},
		mutable: {
			behaviorAllowedToFlee: false,
		},
	},
	zangari_fighter_type_2: {
		immutable: {
			typeShorthand: 'Z/2',
			model: '/ships/ZangariFighterType2',
			maxHullStrength: 125,
			hasShields: false,
			maxSystemStrength: 50,
			thrusters: {
				main: 6,
				side: 2,
				front: 2,
			},
			hasEMP: false,
			hasCannons: true,
			cannonColor: c.races.zangari.laserColor,
			cannonPower: 4,
			cannonFiringSpeed: 0.3,
			cannonShots: 16,
			cannonCooldown: 1,
			cannonSoundEffect: audioLibrary.library.laser_type2.id,
			cannonPositions: [
				{ lengthWise: 17, widthWise: 4 },
				{ lengthWise: 17, widthWise: -4 },
			],
			width: 52,
			length: 40,
		},
		mutable: {
			behaviorAllowedToFlee: false,
		},
	},
	zangari_fighter_type_3: {
		immutable: {
			typeShorthand: 'Z/3',
			model: '/ships/ZangariFighterType3',
			maxHullStrength: 75,
			hasShields: true,
			maxShieldStrength: 100,
			shieldRechargeRate: 4,
			maxSystemStrength: 50,
			thrusters: {
				main: 8,
				side: 5,
				front: 5,
			},
			hasEMP: false,
			hasCannons: true,
			cannonColor: c.races.zangari.laserColor,
			cannonPower: 4,
			cannonFiringSpeed: 0.2,
			cannonShots: 24,
			cannonCooldown: 0.8,
			cannonSoundEffect: audioLibrary.library.laser_type2.id,
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
			typeShorthand: 'Z/4',
			model: '/ships/ZangariFighterType4',
			maxHullStrength: 125,
			hasShields: true,
			maxShieldStrength: 175,
			shieldRechargeRate: 6,
			maxSystemStrength: 40,
			thrusters: {
				main: 10,
				side: 7,
				front: 7,
			},
			hasEMP: false,
			hasCannons: true,
			cannonColor: c.races.zangari.laserColor,
			cannonPower: 6,
			cannonFiringSpeed: 0.14,
			cannonShots: 32,
			cannonCooldown: 0.6,
			cannonSoundEffect: audioLibrary.library.laser_type2.id,
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
};

export default pieces;
