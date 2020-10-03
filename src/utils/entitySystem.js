const entitySystem = {
	prototypes: {},

	prototypeFactory: {
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
				maxHullStrength: 75,
				hasShields: true,
				maxShieldStrength: 150,
				shieldRechargeRate: 4,
			},
			mutable: {},
		},

		valkyrie: {
			immutable: {
				maxHullStrength: 125,
				hasShields: true,
				maxShieldStrength: 100,
				shieldRechargeRate: 2,
			},
			mutable: {},
		},

		assemble(fromPartsReversed) {
			const fromParts = fromPartsReversed.reverse();
			let re = {
				immutable: { ...this.entity.immutable },
				mutable: { ...this.entity.mutable },
			};
			const entityType = fromParts[fromParts.length - 1];
			re.immutable.entityType = entityType;

			const hasMaxValue = [];

			fromParts.forEach((part) => {
				const currentPart = this[part];

				// composing entity with the required has... objects
				let doAppend = [];
				for (let prop in currentPart.immutable) {
					if (prop.substr(0, 3) === 'has' && currentPart.immutable[prop])
						doAppend.push(prop);
					if (prop.substr(0, 3) === 'max') hasMaxValue.push(prop);
				}

				doAppend.forEach((part) => {
					const partToAppend = this[part];

					Object.assign(re.immutable, partToAppend.immutable);
					Object.assign(re.mutable, partToAppend.mutable);
				});

				// composing entity with the property values
				Object.assign(re.immutable, currentPart.immutable);
				Object.assign(re.mutable, currentPart.mutable);
			});

			// setting mutables to maximum where available
			hasMaxValue.forEach((el) => {
				const actualName = el.substr(3, 1).toLowerCase() + el.substr(4);
				re.mutable[actualName] = re.immutable[el];
			});

			// emitting warning about immutables with a null value
			let nullWarnings = [];
			for (let prop in re.immutable) {
				if (re.immutable[prop] === null) nullWarnings.push(prop);
			}
			if (nullWarnings.length > 0)
				console.warn(
					`EntitySystem [${entityType}]: the following immutable properties have a null value: ${nullWarnings.join(
						', '
					)}`
				);

			Object.freeze(re.immutable);
			Object.freeze(re.mutable);

			entitySystem.prototypes[entityType] = re;
		},
	},
};

export default entitySystem;
