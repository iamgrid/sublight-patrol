export function randomNumber(min, max, decimals = 0) {
	return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

export function decreaseNumberBy(num, by) {
	let isNegative = false;
	if (num < 0) isNegative = true;
	let re = Math.abs(num) - by;
	if (re < 0) re = 0;
	if (isNegative) re = -1 * re;

	// console.log('decreaseNumberBy', { num, by, re });

	return re;
}

export function numberToLetter(num) {
	if (!Number.isInteger(num)) {
		console.error(
			'numberToLetter() - expected integer, got this instead:',
			num,
			"...returning 'a'"
		);
		return 'a';
	}
	// fromCharCode: 97 = a, 122 = z
	return String.fromCharCode((num % 26) + 97);
}

export function letterToNumber(letter) {
	const letterRegexp = RegExp(/^[a-z]$/);
	if (!letterRegexp.test(letter)) {
		console.error(
			'numberToLetter() - expected a lowercase letter of the alphabet got this instead:',
			letter
		);
	} else {
		return letter.charCodeAt(0) - 97;
	}
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

// source: https://gist.github.com/gre/1650294
export const easing = {
	// no easing, no acceleration
	linear: function (t) {
		return t;
	},
	// accelerating from zero velocity
	easeInQuad: function (t) {
		return t * t;
	},
	// decelerating to zero velocity
	easeOutQuad: function (t) {
		return t * (2 - t);
	},
	// acceleration until halfway, then deceleration
	easeInOutQuad: function (t) {
		return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
	},
	// accelerating from zero velocity
	easeInCubic: function (t) {
		return t * t * t;
	},
	// decelerating to zero velocity
	easeOutCubic: function (t) {
		return --t * t * t + 1;
	},
	// acceleration until halfway, then deceleration
	easeInOutCubic: function (t) {
		return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
	},
	// accelerating from zero velocity
	easeInQuart: function (t) {
		return t * t * t * t;
	},
	// decelerating to zero velocity
	easeOutQuart: function (t) {
		return 1 - --t * t * t * t;
	},
	// acceleration until halfway, then deceleration
	easeInOutQuart: function (t) {
		return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
	},
	// accelerating from zero velocity
	easeInQuint: function (t) {
		return t * t * t * t * t;
	},
	// decelerating to zero velocity
	easeOutQuint: function (t) {
		return 1 + --t * t * t * t * t;
	},
	// acceleration until halfway, then deceleration
	easeInOutQuint: function (t) {
		return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
	},
	// elastic bounce effect at the beginning
	easeInElastic: function (t) {
		return (0.04 - 0.04 / t) * Math.sin(25 * t) + 1;
	},
	// elastic bounce effect at the end
	easeOutElastic: function (t) {
		return ((0.04 * t) / --t) * Math.sin(25 * t);
	},
	// elastic bounce effect at the beginning and end
	easeInOutElastic: function (t) {
		return (t -= 0.5) < 0
			? (0.02 + 0.01 / t) * Math.sin(50 * t)
			: (0.02 - 0.01 / t) * Math.sin(50 * t) + 1;
	},
};
