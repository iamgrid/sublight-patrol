export function randomNumber(min, max, decimals = 0) {
	return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

export function calculateDistance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function fadeHexColor(input, fadeAmount = 0x6) {
	if (input >= 0xffffff) return 0xffffff;

	let spreadColor = [0, 0, 0];
	spreadColor[0] = Math.trunc(input / 0x10000);
	spreadColor[1] = Math.trunc((input - spreadColor[0] * 0x10000) / 0x100);
	spreadColor[2] = input - spreadColor[0] * 0x10000 - spreadColor[1] * 0x100;

	spreadColor = spreadColor.map((el) => {
		const newC = el < 0xff ? el + fadeAmount : el;
		return Math.min(newC, 0xff);
	});

	return spreadColor[0] * 0x10000 + spreadColor[1] * 0x100 + spreadColor[2];
}
