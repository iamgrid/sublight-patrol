import pieces from './pieces';

const entitySystem = {
	prototypes: {},

	prototypeFactory: {
		pieces: pieces,

		assemble(fromPiecesReversed) {
			const fromPieces = fromPiecesReversed.reverse();
			let re = {
				immutable: { ...this.pieces.entity.immutable },
				mutable: { ...this.pieces.entity.mutable },
			};
			const entityType = fromPieces[fromPieces.length - 1];
			re.immutable.entityType = entityType;

			const hasMaxValue = [];

			fromPieces.forEach((piece) => {
				const currentPiece = this.pieces[piece];

				// composing entity with the required hasXY objects mentioned in this piece
				let doAppend = [];
				for (let prop in currentPiece.immutable) {
					if (prop.substr(0, 3) === 'has' && currentPiece.immutable[prop])
						doAppend.push(prop);
					if (prop.substr(0, 3) === 'max') hasMaxValue.push(prop);
				}

				doAppend.forEach((piece) => {
					const pieceToAppend = this.pieces[piece];

					Object.assign(re.immutable, pieceToAppend.immutable);
					Object.assign(re.mutable, pieceToAppend.mutable);
				});

				// composing entity with the current piece
				Object.assign(re.immutable, currentPiece.immutable);
				Object.assign(re.mutable, currentPiece.mutable);
			});

			// setting mutables to maximum where available
			hasMaxValue.forEach((el) => {
				const actualName = el.substr(3, 1).toLowerCase() + el.substr(4);
				if (re.mutable[actualName] !== 'undefined')
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

			// locking in object keys and values
			Object.freeze(re.immutable);
			Object.freeze(re.mutable);

			entitySystem.prototypes[entityType] = re;
		},
	},
};

export default entitySystem;
