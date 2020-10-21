const pieces = {
	entity: {
		immutable: {
			entityType: null,
			typeShorthand: null,
			model: null,
			width: null,
			length: null,
		},
		mutable: {
			posX: null,
			posY: null,
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
			maxEMPResistance: null,
		},
		mutable: {
			latVelocity: null,
			longVelocity: null,
			isDisabled: false,
			eMPResistance: null,
			playerRelation: 'neutral',
			contents: 'Fuselage',
		},
	},

	container: {
		immutable: {
			typeShorthand: 'CNT',
			model: '/other/GContainer',
			hasHull: true,
			maxHullStrength: 75,
			width: 40,
			length: 60,
		},
		mutable: {
			playerRelation: 'neutral',
			contents: null,
			hullStrength: null,
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

	fenrir: {
		immutable: {
			typeShorthand: 'F/R',
			model: '/ships/Fenrir',
			maxHullStrength: 125,
			hasShields: true,
			maxShieldStrength: 100,
			shieldRechargeRate: 4,
			maxEMPResistance: 4,
			hasEMP: true,
			eMPStrength: 1,
			eMPRechargeRate: 0.25,
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
			maxEMPResistance: 6,
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
			maxEMPResistance: 4,
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
			maxEMPResistance: 4,
			hasEMP: false,
			width: 49,
			length: 38,
		},
		mutable: {},
	},
};

export default pieces;
