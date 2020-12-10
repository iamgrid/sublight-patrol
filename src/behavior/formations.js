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
				'attempt to add ',
				leadEntityId,
				'to a new formation prevented, its already part of another one'
			);
			return false;
		}

		if (formations.isInFormation(flankingEntityId)) {
			console.log(
				'attempt to add ',
				flankingEntityId,
				'to a new formation prevented, its already part of another one'
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
		// the flanking entity will be in flankOne (odd indices)
		flankingObj.latOffset = leadObj.halfWidth + formations.latOffsetGap;
		flankingObj.longOffset =
			leadObj.halfLength + formations.longOffsetGap + flankingObj.halfLength;

		formations.currentFormations.proper[formationId] = [leadObj, flankingObj];

		return true;
	},

	addEntityToFormation(formationId, idOfEntityToAdd, currentState) {
		const existingFormation = formations.isInFormation(idOfEntityToAdd);
		if (existingFormation) {
			console.log(
				'attempt to add ',
				idOfEntityToAdd,
				'to an existing formation, its already part of another one'
			);
			if (formations.isLeadInAFormation(idOfEntityToAdd)) {
				console.log(
					idOfEntityToAdd,
					'is the lead of another formation, we ought to join those two'
				);
				// TODO !!!!!!!!!!!!!!!!
				return false;
			}
			return false;
		}

		const currentFormation = formations.currentFormations.proper[formationId];
		const currentFormationLength = currentFormation.length;

		let arrayIndexWillBeEven = true; // new entity will be in flankTwo (even indices)
		if (currentFormationLength % 2 == 0) {
			arrayIndexWillBeEven = false; // new entity will be in flankOne (odd indices)
		}

		const newEntityObj = { ...formations.entityTemplate, id: idOfEntityToAdd };

		const storeEntity = getStoreEntity(idOfEntityToAdd, currentState);

		if (!storeEntity) return false;

		newEntityObj.halfLength = Math.ceil(storeEntity.immutable.length / 2);
		newEntityObj.halfWidth = Math.ceil(storeEntity.immutable.width / 2);

		let currentLatOffset = 0;
		let currentLongOffset = 0;

		for (let i = 0; i < currentFormationLength; i++) {
			if (
				i > 0 &&
				((arrayIndexWillBeEven && i % 2 !== 0) ||
					(!arrayIndexWillBeEven && i % 2 === 0))
			) {
				// ignore entities that aren't on the same flank
				continue;
			}

			currentLatOffset +=
				currentFormation[i].halfWidth + formations.latOffsetGap;
			currentLongOffset +=
				currentFormation[i].halfLength + formations.longOffsetGap;
		}

		newEntityObj.latOffset = currentLatOffset;
		newEntityObj.longOffset =
			currentLongOffset + newEntityObj.halfLength + formations.longOffsetGap;

		formations.currentFormations.proper[formationId].push(newEntityObj);

		formations.currentFormations.flankingEntities[
			idOfEntityToAdd
		] = formationId;

		return true;
	},

	removeEntityFromFormation(formationId, idOfEntityToRemove) {
		let currentFormation = formations.currentFormations.proper[formationId];
		let wasTheLeadEntity = false;

		const arrayIndex = currentFormation.findIndex(
			(el) => el.id === idOfEntityToRemove
		);

		if (arrayIndex === 0) wasTheLeadEntity = true;

		if (wasTheLeadEntity && currentFormation.length > 1) {
			// new lead entity
			currentFormation[1].latOffset = 0;
			currentFormation[1].longOffset = 0;
			let newLeadId = currentFormation[1].id;
			formations.currentFormations.leadEntities[newLeadId] = formationId;
		}

		currentFormation = currentFormation.filter(
			(el) => el.id !== idOfEntityToRemove
		);

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

		formations.currentFormations.proper[formationId] = currentFormation;

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

		return true;
	},

	dissolveFormation(formationId) {
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
