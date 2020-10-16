import * as PIXI from '../pixi';
import c from './constants';

export const fromSpriteSheet = {
	defaultSpriteSheet: null, // gets its value in App.js once the spritesheet finished loading

	create(x, y, width, height, spriteSheet = this.defaultSpriteSheet) {
		if (!spriteSheet) {
			console.error('Our spritesheet seems to be missing!');
			return null;
		}
		const spriteTexture = new PIXI.Texture(spriteSheet);
		spriteTexture.frame = new PIXI.Rectangle(x, y, width, height);
		const sprite = new PIXI.Sprite(spriteTexture);
		sprite.anchor.set(0.5);

		return sprite;
	},
};

export function dialog(speaker, say, hide = false) {
	const containerDiv = document.getElementById('main__dialog');
	const speakerDiv = document.getElementById('main__dialog-speaker');
	const messageDiv = document.getElementById('main__dialog-message');

	if (hide) {
		containerDiv.style.opacity = '0';
		window.setTimeout(() => {
			containerDiv.style.visibility = 'hidden';
		}, 500);
		return;
	}

	containerDiv.style.visibility = 'visible';

	function dialogHelper(speakerH, sayH) {
		containerDiv.style.opacity = '0.7';
		speakerDiv.innerHTML = speakerH + ' :';
		messageDiv.innerHTML = sayH;
	}

	if (containerDiv.style.opacity != '0.7') {
		dialogHelper(speaker, say);
	} else {
		containerDiv.style.opacity = '0';
		window.setTimeout(() => {
			dialogHelper(speaker, say);
		}, 400);
	}
}

export const alertsAndWarnings = {
	hiderTimeout: null,
	warnings: new Set(),
	alerts: new Set(),
	isFading: false,
	isVisible: false,

	add(value) {
		this[`${value.type}s`].add(value.k);
		if (!this.isFading) {
			this.update();
		} else {
			window.setTimeout(alertsAndWarnings.update, 500);
		}
	},

	remove(value) {
		this[`${value.type}s`].delete(value.k);
		if (this.warnings.size < 1 && this.alerts.size < 1) {
			this.update(true);
		} else {
			this.update();
		}
	},

	update(hide = false) {
		const containerDiv = document.getElementById('main__warnings');
		const messageDiv = document.getElementById('main__warnings-proper');

		if (hide) {
			containerDiv.style.opacity = '0';
			this.isFading = true;
			this.hiderTimeout = window.setTimeout(() => {
				containerDiv.style.visibility = 'hidden';
				alertsAndWarnings.isFading = false;
				alertsAndWarnings.isVisible = false;
			}, 500);
			return;
		}

		window.clearTimeout(this.hiderTimeout);

		containerDiv.style.visibility = 'visible';

		function warningHelper() {
			const types = ['warnings', 'alerts'];
			const classNamePrefix = 'main__warnings-proper--';
			let showing = 'warnings';

			if (alertsAndWarnings.alerts.size > 0) showing = 'alerts';
			types.forEach((t) => messageDiv.classList.remove(classNamePrefix + t));
			messageDiv.classList.add(classNamePrefix + showing);

			containerDiv.style.opacity = '0.6';
			alertsAndWarnings.isFading = true;
			window.setTimeout(() => {
				alertsAndWarnings.isFading = false;
				alertsAndWarnings.isVisible = true;
			}, 400);

			let displayText = [];

			alertsAndWarnings[showing].forEach((el) =>
				displayText.push(
					`${showing.substr(0, showing.length - 1)}: ${
						c.alertsAndWarnings[showing][el].m
					}`
				)
			);

			messageDiv.innerHTML = displayText.join('<br />');
		}

		if (!this.isVisible) {
			warningHelper();
		} else {
			containerDiv.style.opacity = '0';
			this.isFading = true;
			window.setTimeout(() => {
				warningHelper();
			}, 400);
		}
	},

	clear() {
		this.warnings = new Set();
		this.alerts = new Set();
		this.update(true);
	},
};

export function formatElapsedTime(seconds) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor(seconds / 60);
	const secondsDisp = seconds % 60;

	function doPad(input) {
		return String(input).padStart(2, '0');
	}

	return `${doPad(hours)}:${doPad(minutes)}:${doPad(secondsDisp)}`;
}

export const status = {
	store: [],
	isHidden: true,
	hiderTimeout: null,
	startTime: null,

	add(color, text) {
		class Message {
			constructor(color, text, at) {
				this.color = color;
				this.text = text;
				this.at = at;
			}
		}

		const now = new Date().getTime();
		const atRaw = Math.trunc((now - this.startTime) / 1000);

		this.store.push(new Message(color, text, formatElapsedTime(atRaw)));

		this.update();
	},

	update() {
		const properDiv = document.getElementById('main__status-proper');

		if (this.store.length > 4) {
			properDiv.classList.add('main__status-proper--with-scrollbar');
		}

		const disp = [...this.store]
			.reverse()
			.map(
				({ color, text, at }) =>
					`<span class='time'>${at}&nbsp;</span> <span class='${color}'>${text}</span>`
			);

		properDiv.innerHTML = disp.join('<br />');

		if (this.isHidden) {
			this.toggleHide('show');
		}

		window.clearTimeout(status.hiderTimeout);
		this.hiderTimeout = window.setTimeout(status.toggleHide, 10000);
	},

	toggleHide(toggle = 'hide') {
		const mainDivClasses = document.getElementById('main__status').classList;
		if (toggle === 'hide') {
			mainDivClasses.add('main__status--hidden');
			status.isHidden = true;
			window.clearTimeout(status.hiderTimeout);
		} else {
			mainDivClasses.remove('main__status--hidden');
			status.isHidden = false;
		}
	},

	toggleStatusExpansion() {
		const mainDivClasses = document.getElementById('main__status').classList;
		mainDivClasses.toggle('main__status--expanded');
	},

	init() {
		document.getElementById('main__status').onclick =
			status.toggleStatusExpansion;

		this.startTime = new Date().getTime();
	},

	clear() {
		this.startTime = new Date().getTime();
		this.store = [];

		document.getElementById('main__status-proper').innerHTML = '';
		this.toggleHide();
	},
};
