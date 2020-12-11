import c from '../utils/constants';
import { randomNumber } from '../utils/formulas';
import idCreator from '../utils/idCreator';
import pieces from './pieces';
import models from './models';
import behavior from '../behavior/behavior';
import soundEffects from '../audio/soundEffects';
import formations from '../behavior/formations';

const entities = {
	handlers: {
		dispatch: null,
		state: null,
		stage: null,
		pixiHUD: null,
		stagePointers: null,
	}, // gets its values in App.js
	types: {},
	stageEntities: {},
	zIndexIterator: c.zIndices.entities,

	init() {
		this.assembleType(['container']);
		this.assembleType(['buoy']);
		this.assembleType(['fenrir', 'ship']);
		this.assembleType(['fenrir_dominator', 'fenrir', 'ship']);
		this.assembleType(['valkyrie', 'ship']);
		this.assembleType(['zangari_fighter_type_1', 'ship']);
	},

	assembleType(fromPiecesReversed) {
		const fromPieces = fromPiecesReversed.reverse();
		let re = {
			immutable: { ...pieces.entity.immutable },
			mutable: { ...pieces.entity.mutable },
		};
		const entityType = fromPieces[fromPieces.length - 1];
		re.immutable.entityType = this.makeName(entityType);

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

	makeName(input) {
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
				`[${identifier}] The following properties have a null value: ${nullWarnings.join(
					', '
				)}`
			);
	},

	spawn(type, pos, props, storeIn = 'targetable') {
		if (!this.types[type]) {
			console.error(`Unable to find type [${type}].`);
			return null;
		}

		// entity object creation
		const newEntity = { ...this.types[type].mutable, ...props };

		// facing
		let facing = 1;
		if (pos.facing !== undefined) facing = pos.facing;
		newEntity.facing = facing;

		// adding prototype
		newEntity.__proto__ = this.types[type];

		// assigning entity store
		let doStoreIn = storeIn;
		if (!newEntity.immutable.isTargetable) doStoreIn = 'other';

		newEntity.store = doStoreIn;

		// assigning entity id, creating display name
		if (newEntity.id !== null) {
			newEntity.displayId = this.makeName(newEntity.id);
		} else {
			newEntity.id = idCreator.create();
			newEntity.displayId = '-';
		}

		// behavior logic
		newEntity.assignedPlayerRelation = props.playerRelation;
		if (newEntity.immutable.hasBehavior) {
			newEntity.behaviorCurrentGoal = newEntity.behaviorAssignedGoal;
			if (
				newEntity.behaviorAssignedGoal ===
				behavior.possibleGoals.maintainVelocity
			) {
				newEntity.behaviorAssignedDirection = facing;
				newEntity.behaviorAssignedLongVelocity = pos.longVelocity;
			}
			newEntity.behaviorHitsSuffered = 0;
			newEntity.behaviorLastHitOrigin = '';
			newEntity.behaviorPreferredAttackDistance = randomNumber(300, 600);
		}

		// null value warnings
		this.checkForNullValues(`${newEntity.id} (type ${type})`, newEntity);

		// position store
		let positionStore = 'canMove';
		if (!newEntity.immutable.canMove) positionStore = 'cantMove';

		let positionArray = [pos.posX, pos.posY, pos.latVelocity, pos.longVelocity];

		// model availability
		if (!models[newEntity.immutable.model]) {
			console.error(
				`Unable to find model for [${type}]. (Have you updated /entities/models.js?)`
			);
			return null;
		}

		// initial props for the stage entity
		let stageEntityProps = {
			entityId: newEntity.id,
			entityStore: doStoreIn,
			facing: facing,
		};
		if (type === 'buoy') {
			stageEntityProps.coordX = pos.posX;
			stageEntityProps.coordY = pos.posY;
		}

		if (newEntity.immutable.thrusters !== undefined) {
			stageEntityProps.latVelocity = pos.latVelocity;
			stageEntityProps.longVelocity = pos.longVelocity;
		}

		// adding entity to stage
		const stageEntity = Reflect.construct(models[newEntity.immutable.model], [
			stageEntityProps,
		]);

		entities.handlers.stage.addChild(stageEntity);

		if (newEntity.immutable.isTargetable)
			stageEntity.reticuleRelation(newEntity.playerRelation);

		stageEntity.position.set(pos.posX, pos.posY);
		stageEntity.zIndex = this.zIndexIterator;

		this.stageEntities[newEntity.id] = stageEntity;

		// adding entity to state
		entities.handlers.dispatch({
			type: c.actions.ADD_ENTITY,
			storeIn: doStoreIn,
			newEntity: newEntity,
			positionStore: positionStore,
			positionArray: positionArray,
		});

		this.zIndexIterator++;
	},

	despawn(entityId, removeFromState = true) {
		if (entities.stageEntities[entityId] === undefined) return;
		let currentState = entities.handlers.state();

		if (entityId !== currentState.entities.player.id) {
			if (!entities.stageEntities[entityId].despawnTriggered) {
				entities.stageEntities[entityId].despawnTriggered = true;
			}
		} else {
			// console.log('We are not despawning the player for the time being.');
			return;
		}

		const partOfFormationId = formations.isInFormation(entityId);
		if (partOfFormationId) {
			formations.removeEntityFromFormation(partOfFormationId, entityId);
		}
		soundEffects.removeAllSoundInstancesForEntity(entityId);

		console.info(`removing ${entityId} from stage`);
		const stageEntity = entities.stageEntities[entityId];
		const entityStore = entities.stageEntities[entityId].entityStore;
		entities.handlers.stage.removeChild(stageEntity);
		stageEntity.destroy();
		delete entities.stageEntities[entityId];

		const stagePointer = entities.handlers.stagePointers[entityId];
		entities.handlers.pixiHUD.removeChild(stagePointer);
		stagePointer.destroy();
		delete entities.handlers.stagePointers[entityId];

		if (removeFromState) {
			console.info(`removing ${entityId} from state`);
			entities.handlers.dispatch({
				type: c.actions.REMOVE_ENTITY,
				id: entityId,
				store: entityStore,
			});
		}
	},
};

export default entities;
