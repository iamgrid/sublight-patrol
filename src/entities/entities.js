import c from '../utils/constants';
import idCreator from '../utils/idCreator';
import pieces from './pieces';
import models from './models';

const entities = {
	types: {},
	stageEntities: {},

	init() {
		this.assembleType(['fenrir', 'ship']);
		this.assembleType(['fenrir_dominator', 'fenrir', 'ship']);
		this.assembleType(['valkyrie', 'ship']);
		this.assembleType(['enemy_type_1', 'ship']);
	},

	assembleType(fromPiecesReversed) {
		const fromPieces = fromPiecesReversed.reverse();
		let re = {
			immutable: { ...pieces.entity.immutable },
			mutable: { ...pieces.entity.mutable },
		};
		const entityType = fromPieces[fromPieces.length - 1];
		re.immutable.entityType = this.makeTypeName(entityType);

		const hasMaxValue = [];

		fromPieces.forEach((piece) => {
			const currentPiece = pieces[piece];

			// composing entity with the required hasXY objects mentioned in this piece
			let doAppend = [];
			for (let prop in currentPiece.immutable) {
				if (prop.substr(0, 3) === 'has' && currentPiece.immutable[prop])
					doAppend.push(prop);
				if (prop.substr(0, 3) === 'max') hasMaxValue.push(prop);
			}

			doAppend.forEach((piece) => {
				const pieceToAppend = pieces[piece];

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
		this.checkForNullValues(`Entity types - ${entityType}`, re.immutable);

		// locking in object keys and values
		Object.freeze(re.immutable);
		Object.freeze(re.mutable);

		this.types[entityType] = re;
	},

	makeTypeName(input) {
		return input
			.split('_')
			.map((el) => `${el.substr(0, 1).toUpperCase()}${el.substr(1)}`)
			.join(' ');
	},

	checkForNullValues(identifier, object) {
		let nullWarnings = [];
		for (let prop in object) {
			if (object[prop] === null) nullWarnings.push(prop);
		}
		if (nullWarnings.length > 0)
			console.warn(
				`[${identifier}]: the following immutable properties have a null value: ${nullWarnings.join(
					', '
				)}`
			);
	},

	spawn(type, props, handlers) {
		const [dispatch, spriteSheet, stage] = handlers;
		if (!this.types[type]) {
			console.error(`Unable to find type [${type}].`);
			return null;
		}

		const newShip = { ...this.types[type].mutable, ...props };
		newShip.__proto__ = this.types[type];
		newShip.id = idCreator.create();

		this.checkForNullValues(`${newShip.id} (type)`, newShip);

		if (!models[newShip.immutable.model]) {
			console.error(`Unable to find model for [${type}].`);
			return null;
		}

		const stageEntity = Reflect.construct(models[newShip.immutable.model], [
			{
				spriteSheet: spriteSheet,
			},
		]);

		stage.addChild(stageEntity);
		stageEntity.position.set(newShip.posX, newShip.posY);

		this.stageEntities[newShip.id] = stageEntity;

		dispatch({ type: c.actions.ADD_ENTITY, newEntity: newShip });
	},
};

export default entities;
