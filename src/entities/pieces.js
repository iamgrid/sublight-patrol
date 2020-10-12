const pieces = {
	entity: {
		immutable: {
			entityType: null,
			model: null,
		},
		mutable: {
			posX: null,
			posY: null,
			id: null,
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
			model: '/ships/Fenrir',
			maxHullStrength: 125,
			hasShields: true,
			maxShieldStrength: 100,
			shieldRechargeRate: 4,
			maxEMPResistance: 4,
			hasEMP: true,
			eMPStrength: 1,
			eMPRechargeRate: 0.25,
		},
		mutable: {},
	},

	fenrir_dominator: {
		immutable: {
			model: '/ships/Fenrir',
			maxHullStrength: 150,
			maxEMPResistance: 6,
			eMPStrength: 2,
		},
		mutable: {},
	},

	valkyrie: {
		immutable: {
			model: '/ships/Valkyrie',
			maxHullStrength: 75,
			hasShields: true,
			maxShieldStrength: 150,
			shieldRechargeRate: 6,
			maxEMPResistance: 4,
			hasEMP: true,
			eMPStrength: 1,
			eMPRechargeRate: 0.25,
		},
		mutable: {},
	},
	enemy_type_1: {
		immutable: {
			model: '/ships/Fenrir',
			maxHullStrength: 75,
			hasShields: false,
			maxEMPResistance: 4,
			hasEMP: false,
		},
		mutable: {},
	},
};

export default pieces;
