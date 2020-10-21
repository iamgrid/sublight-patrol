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

export function createTargetingReticule(params) {
	let obj = {};
	obj.TL = fromSpriteSheet.create(332, 12, 11, 11);
	obj.TR = fromSpriteSheet.create(362, 12, 11, 11);
	obj.BL = fromSpriteSheet.create(332, 42, 11, 11);
	obj.BR = fromSpriteSheet.create(362, 42, 11, 11);
	obj.TL.x = params.xl;
	obj.TL.y = params.yt;
	obj.TR.x = params.xr;
	obj.TR.y = params.yt;
	obj.BL.x = params.xl;
	obj.BL.y = params.yb;
	obj.BR.x = params.xr;
	obj.BR.y = params.yb;
	obj.TL.alpha = 0;
	obj.TR.alpha = 0;
	obj.BL.alpha = 0;
	obj.BR.alpha = 0;

	return obj;
}

export function toggleTargetingReticule(toggle) {
	let newValue = 1;
	if (!toggle) newValue = 0;

	this.targetingReticule.TL.alpha = newValue;
	this.targetingReticule.TR.alpha = newValue;
	this.targetingReticule.BL.alpha = newValue;
	this.targetingReticule.BR.alpha = newValue;
}

export function reticuleRelation(playerRelation) {
	const tints = {
		friendly: 0x37d837,
		neutral: 0xe6b632,
		hostile: 0xe63232,
	};

	const newTint = tints[playerRelation];

	this.targetingReticule.TL.tint = newTint;
	this.targetingReticule.TR.tint = newTint;
	this.targetingReticule.BL.tint = newTint;
	this.targetingReticule.BR.tint = newTint;
}

export function moveTargetingReticule(newTarget, stageEntities) {
	for (const p in stageEntities) {
		stageEntities[p].toggleTargetingReticule(false);
	}

	if (newTarget) stageEntities[newTarget].toggleTargetingReticule(true);
}

export function dialog(speaker, say, hide = false) {
	const containerDiv = document.getElementById('game__dialog');
	const speakerDiv = document.getElementById('game__dialog-speaker');
	const messageDiv = document.getElementById('game__dialog-message');

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
		const containerDiv = document.getElementById('game__warnings');
		const messageDiv = document.getElementById('game__warnings-proper');

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
			const classNamePrefix = 'game__warnings-proper--';
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
	isExpanded: false,
	hiderTimeout: null,
	startTime: null,

	add(color, text, atRaw) {
		class Message {
			constructor(color, text, at) {
				this.color = color;
				this.text = text;
				this.at = at;
			}
		}

		const atRawTrunc = Math.trunc(atRaw / 1000);

		this.store.push(new Message(color, text, formatElapsedTime(atRawTrunc)));

		this.update();
	},

	update() {
		const properDiv = document.getElementById('game__status-proper');

		if (this.store.length > 4) {
			properDiv.classList.add('game__status-proper--with-scrollbar');
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
		const mainDivClasses = document.getElementById('game__status').classList;
		if (toggle === 'hide') {
			mainDivClasses.add('game__status--hidden');
			status.isHidden = true;
			window.clearTimeout(status.hiderTimeout);
		} else {
			mainDivClasses.remove('game__status--hidden');
			status.isHidden = false;
		}
	},

	toggleStatusExpansion(event, toggle) {
		const mainDivClasses = document.getElementById('game__status').classList;

		let doExpand = !this.isExpanded;
		switch (toggle) {
			case 'show':
				doExpand = true;
				break;
			case 'hide':
				doExpand = false;
				break;
		}

		if (doExpand) {
			mainDivClasses.add('game__status--expanded');
			this.isExpanded = true;
		} else {
			document.getElementById('game__status-proper').scrollTo(0, 0);
			this.isExpanded = false;
			window.setTimeout(() => {
				mainDivClasses.remove('game__status--expanded');
			}, 50);
		}
	},

	init() {
		document.getElementById(
			'game__status'
		).onclick = status.toggleStatusExpansion.bind(status);
	},

	clear() {
		this.store = [];

		document.getElementById('game__status-proper').innerHTML = '';
		this.toggleHide();
	},
};

export const hud = {
	currentDisplay: {
		playerShield: null,
		playerHull: null,
		playerSystem: null,
		playerIsDisabled: null,
		playerContents: null,
		playerId: null,
		targetExists: false,
		targetShield: null,
		targetHull: null,
		targetSystem: null,
		targetIsDisabled: null,
		targetContents: null,
		targetId: null,
	},

	toggle(show = false) {
		const hudDiv = document.getElementById('game__hud');
		if (show) {
			hudDiv.classList.add('game__hud--visible');
		} else {
			hudDiv.classList.remove('game__hud--visible');
		}
	},

	update(targeting, allEntities) {
		let newDisplay = {
			playerShield: allEntities.player.shieldStrength,
			playerHull: allEntities.player.hullStrength,
			playerSystem: allEntities.player.systemStrength,
			playerIsDisabled: allEntities.player.isDisabled,
			playerContents: allEntities.player.contents,
			playerId: `${allEntities.player.immutable.typeShorthand} ${allEntities.player.displayId}`,
		};

		let newTargetDisplay = {};

		if (!targeting) {
			newTargetDisplay = {
				targetExists: false,
				targetShield: 0,
				targetHull: 0,
				targetSystem: 0,
				targetIsDisabled: 0,
				targetContains: '',
				targetId: '',
			};
		} else {
			const targetIdx = allEntities.targetable.findIndex(
				(entity) => entity.id === targeting
			);

			if (targetIdx === -1) {
				console.error(`Unable to find target: ${targeting}`);
				return;
			}

			newTargetDisplay = {
				targetShield: allEntities.targetable[targetIdx].shieldStrength,
				targetHull: allEntities.targetable[targetIdx].hullStrength,
				targetSystem: allEntities.targetable[targetIdx].systemStrength,
				targetIsDisabled: allEntities.targetable[targetIdx].isDisabled,
				targetContents: allEntities.targetable[targetIdx].contents,
				targetId: `${allEntities.targetable[targetIdx].immutable.typeShorthand} ${allEntities.targetable[targetIdx].displayId}`,
			};
		}
		Object.assign(newDisplay, newTargetDisplay);

		for (const key in newDisplay) {
			if (newDisplay[key] !== hud.currentDisplay[key])
				hud.updateReadout(key, newDisplay[key], allEntities, targeting);
		}

		hud.currentDisplay = newDisplay;
	},

	updateReadout(id, newValue, allEntities, targeting) {
		const entity = id.substr(0, 6);
		// console.log(id, entity, newValue);
		switch (id) {
			case entity + 'Id':
				document.getElementById(`game__hud-${entity}-id`).innerText = newValue;
				break;
			case entity + 'Contents':
				document.getElementById(
					`game__hud-${entity}-contents`
				).innerText = newValue;
				break;
			case entity + 'Shield':
				hud.updateMeter(entity, 'Shield', newValue, allEntities, targeting);
				break;
			case entity + 'Hull':
				hud.updateMeter(entity, 'Hull', newValue, allEntities, targeting);
				break;
			case entity + 'System':
				hud.updateMeter(entity, 'System', newValue, allEntities, targeting);
				break;
			case entity + 'IsDisabled': {
				const meterDiv = document.getElementById(
					`game__hud-meter-${entity}-system-text`
				);
				if (newValue) {
					meterDiv.classList.add('meter-text--disabled');
				} else {
					meterDiv.classList.remove('meter-text--disabled');
				}
				break;
			}
		}
	},

	updateMeter(entity, key, newValue, allEntities, targeting) {
		// console.log(entity, key, newValue, targeting);
		let meterValue;
		let meterText = newValue;
		if (newValue === 0 || newValue === undefined) {
			meterText = '';
			meterValue = 0;
		} else {
			let maxValue = -1;
			if (entity === 'player') {
				maxValue = allEntities.player.immutable[`max${key}Strength`];
			} else {
				const targetIdx = allEntities.targetable.findIndex(
					(entity) => entity.id === targeting
				);
				maxValue =
					allEntities.targetable[targetIdx].immutable[`max${key}Strength`];
			}
			meterValue = Math.round((newValue / maxValue) * 100);
			// console.log({ maxValue, meterValue });
		}

		const meter = key.toLowerCase();

		document.getElementById(
			`game__hud-meter-${entity}-${meter}-text`
		).innerText = meterText;
		document.getElementById(
			`game__hud-meter-${entity}-${meter}-bar`
		).style.width = `${meterValue}px`;
	},
};
