import idCreator from '../utils/idCreator';
import { getStoreEntity, getPosition } from '../utils/helpers';

const formations = {
	currentFormations: {},
	entityTemplate: {
		id: null,
		halfLength: null,
		halfWidth: null,
		latOffset: 0,
		longOffset: 0,
	},
	latOffsetGap: 16,
	longOffsetGap: 15,

	createFormation(leadEntityId, flankingEntityId, currentState) {
		console.log(
			'creating new formation with',
			leadEntityId,
			'as lead and',
			flankingEntityId,
			'on flank one'
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

		formations.currentFormations[formationId] = currentFormation;

		return true;
	},

	addEntityToFormation(
		formationId,
		idOfEntityToAdd,
		currentState,
		promoteToNewLeader = false
	) {
		let currentFormation = formations.currentFormations[formationId];
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
				formations.currentFormations[existingFormationId];
			currentFormation = currentFormation.concat(existingFormation);
			console.log(
				idOfEntityToAdd,
				'is already in another formation, merging it with this one'
			);
			// console.log(currentFormation);
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

			if (promoteToNewLeader) {
				currentFormation.unshift(newEntityObj);
			} else {
				currentFormation.push(newEntityObj);
			}
		}

		// remove duplicate objects
		currentFormation = currentFormation.filter(
			(el, ix, arr) => ix === arr.findIndex((el2) => el2.id === el.id)
		);

		// recalculate offsets
		currentFormation = formations.assignOffsets(currentFormation);

		// add updated formation to currentFormations
		formations.currentFormations[formationId] = currentFormation;

		return true;
	},

	removeEntityFromFormation(formationId, idOfEntityToRemove) {
		let currentFormation = formations.currentFormations[formationId];

		if (!currentFormation.some((el) => el.id === idOfEntityToRemove))
			return false;

		console.log('removing', idOfEntityToRemove, 'from formation');

		currentFormation = currentFormation.filter(
			(el) => el.id !== idOfEntityToRemove
		);

		if (currentFormation.length < 2) {
			formations.dissolveFormation(formationId);
			return true;
		}

		currentFormation = formations.assignOffsets(currentFormation);

		formations.currentFormations[formationId] = currentFormation;

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
				if (i > 0) {
					flankOneLongOffset +=
						currentFormation[i - 1].halfLength +
						currentFormation[i].halfLength +
						formations.longOffsetGap;
					currentFormation[i].latOffset = flankOneLatOffset;
					currentFormation[i].longOffset = flankOneLongOffset;
				}

				flankOneLatOffset +=
					currentFormation[i].halfWidth + formations.latOffsetGap;
			}

			if (inFlankTwo) {
				if (i > 0) {
					flankTwoLongOffset +=
						currentFormation[i - 1].halfLength +
						currentFormation[i].halfLength +
						formations.longOffsetGap;
					currentFormation[i].latOffset = flankTwoLatOffset;
					currentFormation[i].longOffset = flankTwoLongOffset;
				}

				flankTwoLatOffset +=
					currentFormation[i].halfWidth + formations.latOffsetGap;
			}
		}

		return currentFormation;
	},

	dissolveFormation(formationId) {
		console.log('dissolving formation', formationId);

		delete formations.currentFormations[formationId];
	},

	isInFormation(entityId) {
		for (const formationId in formations.currentFormations) {
			if (
				formations.currentFormations[formationId].some(
					(el) => el.id === entityId
				)
			) {
				return formationId;
			}
		}
		return false;
	},

	isLeadInAFormation(entityId) {
		for (const formationId in formations.currentFormations) {
			if (formations.currentFormations[formationId][0].id === entityId) {
				return true;
			}
		}
		return false;
	},

	returnFormationFacingAndCoords(formationId, currentState) {
		const currentFormation = formations.currentFormations[formationId];
		const leadEntityId = currentFormation[0].id;
		const leadStoreEntity = getStoreEntity(leadEntityId, currentState);

		if (!leadStoreEntity) return false;

		const facing = leadStoreEntity.facing;
		const [leadX, leadY] = getPosition(leadEntityId, currentState.positions);

		return { facing, leadX, leadY };
	},

	clearAll() {
		console.log('formations.clearAll() called');
		for (const formationId in formations.currentFormations) {
			formations.dissolveFormation(formationId);
		}
	},
};

export default formations;
