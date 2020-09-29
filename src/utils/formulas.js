export function randomNumber(min, max, decimals = 0) {
	return Number((Math.random() * (max - min) + min).toFixed(decimals));
}
