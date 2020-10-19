export function randomNumber(min, max, decimals = 0) {
	return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

export function targetPointedOrNearest(from, entities) {
	//pointed
	let current = null;

	const pointerY = from.y;
	const facing = from.facing;

	const candidates = entities.filter((entity) => {
		const rangeTop = pointerY - entity.immutable.width / 2;
		const rangeBottom = pointerY + entity.immutable.width / 2;
		if (entity.posY >= rangeTop && entity.posY <= rangeBottom) {
			if (
				(facing === 'right' && from.x < entity.posX) ||
				(facing === 'left' && from.x > entity.posX)
			)
				return true;
		}
	});

	let bestDistance = Infinity;
	candidates.forEach((entity) => {
		const currentDistance = Math.abs(from.x - entity.posX);
		if (currentDistance < bestDistance) {
			bestDistance = currentDistance;
			current = entity.id;
		}
	});

	if (current !== null) {
		console.log(`Found pointed entity: ${current}`);
		return current;
	}

	// nearest
	let bestDistance2 = Infinity;
	entities.forEach((entity) => {
		const currentDistance = Math.sqrt(
			Math.pow(from.x - entity.posX, 2) + Math.pow(from.x - entity.posX, 2)
		);
		if (currentDistance < bestDistance2) {
			bestDistance2 = currentDistance;
			current = entity.id;
		}
	});

	return current;
}

export function cycleTargets(current, direction, entities) {
	if (current === null) return entities[0].id;

	const currentIdx = entities.findIndex((entity) => entity.id === current);

	let newIdx;
	if (direction === 'next') {
		newIdx = currentIdx + 1;
		if (newIdx > entities.length - 1) newIdx = 0;
	} else if (direction === 'previous') {
		newIdx = currentIdx - 1;
		if (newIdx < 0) newIdx = entities.length - 1;
	}

	return entities[newIdx].id;
}
