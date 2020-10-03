const pieces = {
	entity: {
		immutable: {
			entityType: null,
		},
		mutable: {
			posX: null,
			posY: null,
		},
	},

	ship: {
		immutable: {
			hasHull: true,
			hasShields: false,
		},
		mutable: {
			latVelocity: null,
			longVelocity: null,
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

	fenrir: {
		immutable: {
			maxHullStrength: 125,
			hasShields: true,
			maxShieldStrength: 100,
			shieldRechargeRate: 4,
		},
		mutable: {},
	},

	fenrir_dominator: {
		immutable: {
			maxHullStrength: 150,
		},
		mutable: {},
	},

	valkyrie: {
		immutable: {
			maxHullStrength: 75,
			hasShields: true,
			maxShieldStrength: 150,
			shieldRechargeRate: 2,
		},
		mutable: {},
	},
};

export default pieces;
