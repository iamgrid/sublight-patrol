const pieces = {
	entity: {
		immutable: {
			entityType: null,
			typeShorthand: null,
			model: null,
			width: null,
			length: null,
			canMove: false,
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
			hasShields: false,
			hasEMP: false,
			hasCannons: false,
			maxSystemStrength: null,
			canMove: true,
		},
		mutable: {
			isDisabled: false,
			systemStrength: null,
			playerRelation: 'neutral',
			contents: 'No cargo',
		},
	},

	container: {
		immutable: {
			typeShorthand: 'CNT',
			model: '/other/GContainer',
			hasHull: true,
			maxHullStrength: 75,
			maxSystemStrength: 5,
			width: 40,
			length: 60,
		},
		mutable: {
			playerRelation: 'neutral',
			contents: null,
			hullStrength: null,
			systemStrength: null,
		},
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
			cannonPower: null,
			cannonPositions: null,
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
			hasEMP: true,
			eMPStrength: 1,
			eMPRechargeRate: 0.25,
			hasCannons: true,
			cannonPower: 4,
			cannonPositions: [
				{ lengthWise: 15, widthWise: 20 },
				{ lengthWise: 15, widthWise: -20 },
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
			eMPStrength: 2,
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
			hasEMP: true,
			eMPStrength: 1,
			eMPRechargeRate: 0.25,
			width: 49,
			length: 52,
		},
		mutable: {},
	},
	enemy_fighter_type_1: {
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
