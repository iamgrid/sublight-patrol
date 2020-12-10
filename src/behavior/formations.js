import idCreator from '../utils/idCreator';
import { getStoreEntity, getPosition } from '../utils/helpers';

const formations = {
	currentFormations: {
		leadEntities: {},
		flankingEntities: {},
		proper: {},
	},
	entityTemplate: {
		id: null,
		halfLength: null,
		halfWidth: null,
		latOffset: 0,
		longOffset: 0,
	},
	latOffsetGap: 5,
	longOffsetGap: 10,

	createFormation(leadEntityId, flankingEntityId, currentState) {
		console.log(
			'creating new formation with',
			leadEntityId,
			'as lead and',
			flankingEntityId,
			'on flankOne'
		);
		if (formations.isInFormation(leadEntityId)) {
			console.log(
				'attempt to add',
				leadEntityId,
				'as lead to a new formation prevented, its already part of another one'
			);
			return false;
		}

		if (formations.isInFormation(flankingEntityId)) {
			console.log(
				'attempt to add',
				flankingEntityId,
				'as follower to a new formation prevented, its already part of another one'
			);
			return false;
		}

		const formationId = idCreator.create();
		formations.currentFormations.leadEntities[leadEntityId] = formationId;
		formations.currentFormations.flankingEntities[
			flankingEntityId
		] = formationId;

		const leadObj = { ...formations.entityTemplate, id: leadEntityId };
		const flankingObj = { ...formations.entityTemplate, id: flankingEntityId };

		const leadStoreEntity = getStoreEntity(leadEntityId, currentState);
		const flankingStoreEntity = getStoreEntity(leadEntityId, currentState);

		if (!leadStoreEntity || !flankingStoreEntity) return false;

		leadObj.halfLength = Math.ceil(leadStoreEntity.immutable.length / 2);
		leadObj.halfWidth = Math.ceil(leadStoreEntity.immutable.width / 2);
		flankingObj.halfLength = Math.ceil(
			flankingStoreEntity.immutable.length / 2
		);
		flankingObj.halfWidth = Math.ceil(flankingStoreEntity.immutable.width / 2);

		let currentFormation = [leadObj, flankingObj];

		currentFormation = formations.assignOffsets(currentFormation);

		formations.currentFormations.proper[formationId] = currentFormation;

		return true;
	},

	addEntityToFormation(formationId, idOfEntityToAdd, currentState) {
		let currentFormation = formations.currentFormations.proper[formationId];
		const existingFormationId = formations.isInFormation(idOfEntityToAdd);

		if (existingFormationId === formationId) {
			console.log(
				idOfEntityToAdd,
				'is already in the formation that its now trying to join -> canceling operation.'
			);
			return false;
		}

		let solvedByMergingFormations = false;
		if (existingFormationId) {
			const existingFormation =
				formations.currentFormations.proper[existingFormationId];
			currentFormation = currentFormation.concat(existingFormation);
			console.log(
				idOfEntityToAdd,
				'is already in another formation, merging it with this one'
			);
			console.log(currentFormation);
			formations.dissolveFormation(existingFormationId);
			solvedByMergingFormations = true;
		}

		if (!solvedByMergingFormations) {
			const newEntityObj = {
				...formations.entityTemplate,
				id: idOfEntityToAdd,
			};

			const storeEntity = getStoreEntity(idOfEntityToAdd, currentState);

			if (!storeEntity) return false;

			newEntityObj.halfLength = Math.ceil(storeEntity.immutable.length / 2);
			newEntityObj.halfWidth = Math.ceil(storeEntity.immutable.width / 2);

			currentFormation.push(newEntityObj);
		}

		currentFormation = formations.assignOffsets(currentFormation);

		formations.currentFormations.proper[formationId] = currentFormation;

		formations.currentFormations.flankingEntities[
			idOfEntityToAdd
		] = formationId;

		return true;
	},

	removeEntityFromFormation(formationId, idOfEntityToRemove) {
		console.log('removing', idOfEntityToRemove, 'from formation');
		let currentFormation = formations.currentFormations.proper[formationId];
		let wasTheLeadEntity = false;

		const arrayIndex = currentFormation.findIndex(
			(el) => el.id === idOfEntityToRemove
		);

		if (arrayIndex === 0) wasTheLeadEntity = true;

		currentFormation = currentFormation.filter(
			(el) => el.id !== idOfEntityToRemove
		);

		if (currentFormation.length < 2) {
			formations.dissolveFormation(formationId);
			return;
		}

		if (wasTheLeadEntity) {
			// new lead entity
			let newLeadId = currentFormation[0].id;
			formations.currentFormations.leadEntities[newLeadId] = formationId;
		}

		if (
			formations.currentFormations.leadEntities[idOfEntityToRemove] !==
			undefined
		)
			delete formations.currentFormations.leadEntities[idOfEntityToRemove];
		if (
			formations.currentFormations.flankingEntities[idOfEntityToRemove] !==
			undefined
		)
			delete formations.currentFormations.flankingEntities[idOfEntityToRemove];

		currentFormation = formations.assignOffsets(currentFormation);

		formations.currentFormations.proper[formationId] = currentFormation;

		return true;
	},

	assignOffsets(currentFormation) {
		// lead entity
		currentFormation[0].latOffset = 0;
		currentFormation[0].longOffset = 0;

		let flankOneLatOffset = 0; // entities w odd indices
		let flankOneLongOffset = 0;
		let flankTwoLatOffset = 0; // entities w even indices
		let flankTwoLongOffset = 0;

		for (let i = 0; i < currentFormation.length; i++) {
			let inFlankOne = false;
			let inFlankTwo = false;

			if (i === 0) {
				inFlankOne = true;
				inFlankTwo = true;
			} else if (i % 2 !== 0) {
				inFlankOne = true;
			} else if (i % 2 === 0) {
				inFlankTwo = true;
			}

			if (inFlankOne) {
				flankOneLatOffset +=
					currentFormation[i].halfWidth + formations.latOffsetGap;
				flankOneLongOffset +=
					currentFormation[i].halfLength + formations.longOffsetGap;

				if (i > 0) {
					currentFormation[i].latOffset = flankOneLatOffset;
					currentFormation[i].longOffset =
						flankOneLongOffset +
						formations.longOffsetGap +
						currentFormation[i].halfLength;
				}
			}

			if (inFlankTwo) {
				flankTwoLatOffset +=
					currentFormation[i].halfWidth + formations.latOffsetGap;
				flankTwoLongOffset +=
					currentFormation[i].halfLength + formations.longOffsetGap;

				if (i > 0) {
					currentFormation[i].latOffset = flankTwoLatOffset;
					currentFormation[i].longOffset =
						flankTwoLongOffset +
						formations.longOffsetGap +
						currentFormation[i].halfLength;
				}
			}
		}

		return currentFormation;
	},

	dissolveFormation(formationId) {
		console.log('dissolving formation', formationId);
		formations.currentFormations.proper[formationId].forEach((el) => {
			if (formations.currentFormations.leadEntities[el.id] !== undefined)
				delete formations.currentFormations.leadEntities[el.id];
			if (formations.currentFormations.flankingEntities[el.id] !== undefined)
				delete formations.currentFormations.flankingEntities[el.id];
		});

		delete formations.currentFormations.proper[formationId];
	},

	isInFormation(entityId) {
		if (formations.currentFormations.leadEntities[entityId] !== undefined)
			return formations.currentFormations.leadEntities[entityId];
		if (formations.currentFormations.flankingEntities[entityId] !== undefined)
			return formations.currentFormations.flankingEntities[entityId];

		return false;
	},

	isLeadInAFormation(entityId) {
		if (formations.currentFormations.leadEntities[entityId] !== undefined) {
			return true;
		} else {
			return false;
		}
	},

	returnFormationFacingAndCoords(formationId, currentState) {
		const currentFormation = formations.currentFormations.proper[formationId];
		const leadEntityId = currentFormation[0].id;
		const leadStoreEntity = getStoreEntity(leadEntityId, currentState);

		if (!leadStoreEntity) return false;

		const facing = leadStoreEntity.facing;
		const [leadX, leadY] = getPosition(leadEntityId, currentState.positions);

		return { facing, leadX, leadY, formation: currentFormation };
	},
};

export default formations;
