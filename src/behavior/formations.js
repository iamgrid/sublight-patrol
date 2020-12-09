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
	longOffsetGap: 5,

	createFormation(leadEntityId, flankingEntityId, currentState) {
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
		flankingObj.latOffset = leadObj.halfWidth + formations.latOffsetGap;
		flankingObj.longOffset =
			leadObj.halfLength + formations.longOffsetGap + flankingObj.halfLength;

		formations.currentFormations.proper[formationId] = [leadObj, flankingObj];

		return true;
	},

	addEntityToFormation(formationId, idOfEntityToAdd, currentState) {
		const currentFormation = formations.currentFormations.proper[formationId];
		const currentFormationLength = currentFormation.length;

		let arrayIndexWillBeEven = true;
		if (currentFormationLength % 2 == 0) {
			arrayIndexWillBeEven = false;
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

		let firstFlankLatOffset = 0;
		let firstFlankLongOffset = 0;
		let secondFlankLatOffset = 0;
		let secondFlankLongOffset = 0;

		for (let i = 0; i < currentFormation.length; i++) {
			let inFirstFlank = false;
			let inSecondFlank = false;

			if (i === 0) {
				inFirstFlank = true;
				inSecondFlank = true;
			} else if (i % 2 === 0) {
				inFirstFlank = true;
			} else if (i % 2 !== 0) {
				inSecondFlank = true;
			}

			if (inFirstFlank) {
				firstFlankLatOffset +=
					currentFormation[i].halfWidth + formations.latOffsetGap;
				firstFlankLongOffset +=
					currentFormation[i].halfLength + formations.longOffsetGap;

				if (i > 0) {
					currentFormation[i].latOffset = firstFlankLatOffset;
					currentFormation[i].longOffset =
						firstFlankLongOffset +
						formations.longOffsetGap +
						currentFormation[i].halfLength;
				}
			}

			if (inSecondFlank) {
				secondFlankLatOffset +=
					currentFormation[i].halfWidth + formations.latOffsetGap;
				secondFlankLongOffset +=
					currentFormation[i].halfLength + formations.longOffsetGap;

				if (i > 0) {
					currentFormation[i].latOffset = secondFlankLatOffset;
					currentFormation[i].longOffset =
						secondFlankLongOffset +
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
