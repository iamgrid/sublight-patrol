export function randomNumber(min, max, decimals = 0) {
	return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

export function calculateDistance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
