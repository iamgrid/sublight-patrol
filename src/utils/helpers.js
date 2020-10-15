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

	add(value) {
		this[`${value.type}s`].add(value.k);
		this.update();
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
			alertsAndWarnings.hiderTimeout = window.setTimeout(() => {
				containerDiv.style.visibility = 'hidden';
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

			let displayText = [];

			alertsAndWarnings[showing].forEach((el) =>
				displayText.push(
					`${showing.substr(0, showing.length - 1)}: ${
						c.alertsAndWarnings[el].m
					}`
				)
			);

			messageDiv.innerHTML = displayText.join('<br />');
		}

		if (containerDiv.style.opacity != '0.6') {
			warningHelper();
		} else {
			containerDiv.style.opacity = '0';
			window.setTimeout(() => {
				warningHelper();
			}, 400);
		}
	},
};
