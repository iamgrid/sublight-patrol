export function randomNumber(min, max, decimals = 0) {
	return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

export function calculateDistance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function calculateAngle(x1, y1, x2, y2) {
	return Math.atan2(y1 - y2, x1 - x2) - Math.PI / 2;
}

export function fadeHexColor(input, fadeAmount = 0x6, direction = 'to white') {
	if (input >= 0xffffff) return 0xffffff;

	let spreadColor = [0, 0, 0];
	spreadColor[0] = Math.trunc(input / 0x10000);
	spreadColor[1] = Math.trunc((input - spreadColor[0] * 0x10000) / 0x100);
	spreadColor[2] = input - spreadColor[0] * 0x10000 - spreadColor[1] * 0x100;

	spreadColor = spreadColor.map((el) => {
		let newC;
		if (direction === 'to white') {
			newC = el < 0xff ? el + fadeAmount : el;
			return Math.min(newC, 0xff);
		} else {
			newC = el > 0x40 ? el - fadeAmount : el;
			return Math.max(newC, 0x40);
		}
	});

	return spreadColor[0] * 0x10000 + spreadColor[1] * 0x100 + spreadColor[2];
}
