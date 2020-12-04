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
			typeShorthand: 'E-1',
			maxHullStrength: 75,
			hasShields: false,
			maxSystemStrength: 75,
			hasEMP: false,
			width: 49,
			length: 38,
		},
		mutable: {},
	},
};

export default pieces;
