import audioLibrary from './audioLibrary';
import { randomNumber, calculateDistance } from '../utils/formulas';
import { getPosition } from '../utils/helpers';

const soundEffects = {
	handlers: { state: null, resources: null }, // gets its values in App.js
	manifest: audioLibrary.manifest,
	library: audioLibrary.library,
	COS_FLIP: (4 * Math.PI) / 7,

	loops: {},

	playOnce(entityId, libraryItemId, variant = -1) {
		if (soundEffects.handlers.resources === null) return;

		const libraryItem = soundEffects.library[libraryItemId];

		let effectId = `${libraryItem.id}`;
		if (libraryItem.variants > 1) {
			let effectVariant = variant;
			if (effectVariant === -1)
				effectVariant = randomNumber(1, libraryItem.variants);

			effectId = `${libraryItem.id}_${effectVariant}`;
		}
		// console.log(effectId);

		const currentState = soundEffects.handlers.state();
		const playerId = currentState.entities.player.id;
		const newVolume = soundEffects.volumeBasedOnEntityDistance(
			entityId,
			playerId,
			currentState.positions
		);
		// console.log(libraryItemId, newVolume);

		soundEffects.handlers.resources[effectId].sound.play({
			loop: false,
			singleInstance: false,
			volume: newVolume,
		});
	},

	startLoop(entityId, libraryItemId, emitterId = 0) {
		if (soundEffects.loops[entityId] === undefined) {
			soundEffects.loops[entityId] = {};
		}
		if (soundEffects.loops[entityId][libraryItemId] === undefined) {
			soundEffects.loops[entityId][libraryItemId] = {};
		}

		if (soundEffects.loops[entityId][libraryItemId][emitterId] === undefined) {
			soundEffects.loops[entityId][libraryItemId][
				emitterId
			] = soundEffects.handlers.resources[libraryItemId].sound.play({
				loop: true,
				singleInstance: false,
			});

			// console.log(
			// 	'sound instance created for',
			// 	entityId,
			// 	libraryItemId,
			// 	emitterId,
			// 	soundEffects.loops[entityId][libraryItemId][emitterId]
			// );
		}

		if (soundEffects.loops[entityId][libraryItemId][emitterId].paused) {
			soundEffects.loops[entityId][libraryItemId][emitterId].set(
				'paused',
				false
			);
		}

		const currentState = soundEffects.handlers.state();
		const playerId = currentState.entities.player.id;
		const newVolume = soundEffects.volumeBasedOnEntityDistance(
			entityId,
			playerId,
			currentState.positions
		);
		soundEffects.loops[entityId][libraryItemId][emitterId].set(
			'volume',
			newVolume
		);
	},

	stopLoop(entityId, libraryItemId, emitterId = 0) {
		if (soundEffects.loops[entityId] === undefined) return;
		if (soundEffects.loops[entityId][libraryItemId] === undefined) return;
		if (soundEffects.loops[entityId][libraryItemId][emitterId] === undefined)
			return;

		soundEffects.loops[entityId][libraryItemId][emitterId].set('paused', true);
	},

	adjustLoopVolumes(playerId, positions) {
		for (const entityId in soundEffects.loops) {
			const newVolume = soundEffects.volumeBasedOnEntityDistance(
				entityId,
				playerId,
				positions
			);

			for (const libraryItemId in soundEffects.loops[entityId]) {
				for (const emitterId in soundEffects.loops[entityId][libraryItemId]) {
					soundEffects.loops[entityId][libraryItemId][emitterId].set(
						'volume',
						newVolume
					);
				}
			}
		}
	},

	volumeBasedOnEntityDistance(entityId, playerId, positions) {
		if (entityId === playerId) return 1;

		const [playerX, playerY] = getPosition(playerId, positions);
		const [entityX, entityY] = getPosition(entityId, positions);
		let distance = calculateDistance(playerX, playerY, entityX, entityY);

		// return Number(Math.max(1 - distance / 2500, 0).toFixed(2));

		// https://www.desmos.com/calculator/njp5madui1
		if (distance / 1000 >= soundEffects.COS_FLIP) {
			return 0;
		} else {
			return Number((Math.cos((distance / 1000) * 1.75) / 2 + 0.5).toFixed(2));
		}
	},

	removeAllSoundInstancesFromEntity(entityId) {
		// removes all loops (e.g. thruster sounds, emp tone) related to the entity
		if (soundEffects.loops[entityId] === undefined) return;

		for (const libraryItemId in soundEffects.loops[entityId]) {
			for (const emitterId in soundEffects.loops[entityId][libraryItemId]) {
				soundEffects.loops[entityId][libraryItemId][emitterId].stop();
			}
		}

		delete soundEffects.loops[entityId];
	},
};

export default soundEffects;
