import * as PIXI from '../pixi';
import c from './constants';

export function getPosition(entityId, positions) {
	if (positions.canMove[`${entityId}--posX`]) {
		return [
			positions.canMove[`${entityId}--posX`],
			positions.canMove[`${entityId}--posY`],
		];
	}

	if (positions.cantMove[`${entityId}--posX`]) {
		return [
			positions.cantMove[`${entityId}--posX`],
			positions.cantMove[`${entityId}--posY`],
		];
	}

	console.error(`Unable to ascertain position for ${entityId}`);
	// console.log(positions);
}

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
				containerDiv.classList.remove('game__warnings--shown');
				alertsAndWarnings.isFading = false;
				alertsAndWarnings.isVisible = false;
			}, 900);
			return;
		}

		window.clearTimeout(this.hiderTimeout);

		containerDiv.classList.add('game__warnings--shown');

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
	currentDisplay: {},
	maximums: {},

	toggle(show = false) {
		const hudDiv = document.getElementById('game__hud');
		if (show) {
			hudDiv.classList.add('game__hud--visible');
		} else {
			hudDiv.classList.remove('game__hud--visible');
		}
	},

	update(targeting, allEntities) {
		let newDisplay = hud.assembleDisplayObject('player', allEntities.player);

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
				targetPlayerRelation: null,
				targetHasBeenScanned: null,
			};
		} else {
			const targetIdx = allEntities.targetable.findIndex(
				(entity) => entity.id === targeting
			);

			if (targetIdx === -1) {
				console.error(`Unable to find target: ${targeting}`);
				return;
			}

			newTargetDisplay = hud.assembleDisplayObject(
				'target',
				allEntities.targetable[targetIdx]
			);
			newTargetDisplay.targetExists = true;
			newTargetDisplay.targetPlayerRelation =
				allEntities.targetable[targetIdx].playerRelation;
			newTargetDisplay.targetHasBeenScanned =
				allEntities.targetable[targetIdx].hasBeenScanned;
		}
		Object.assign(newDisplay, newTargetDisplay);

		for (const key in newDisplay) {
			if (newDisplay[key] !== hud.currentDisplay[key])
				hud.updateReadout(key, newDisplay[key], newDisplay);
		}

		hud.currentDisplay = newDisplay;
	},

	assembleDisplayObject(entityName, entity) {
		const re = {};

		re[entityName + 'Shield'] = entity.shieldStrength;
		re[entityName + 'Hull'] = entity.hullStrength;
		re[entityName + 'System'] = entity.systemStrength;
		re[entityName + 'IsDisabled'] = entity.isDisabled;
		re[entityName + 'Contents'] = entity.contents;

		const name = `${entity.immutable.typeShorthand} ${entity.displayId}`;
		re[entityName + 'Id'] = name;

		if (name !== hud.currentDisplay[entityName + 'Id']) {
			// console.log(`updating maximums on ${entityName}`);
			hud.maximums[entityName + 'Shield'] = entity.immutable.maxShieldStrength;
			hud.maximums[entityName + 'Hull'] = entity.immutable.maxHullStrength;
			hud.maximums[entityName + 'System'] = entity.immutable.maxSystemStrength;
		}

		return re;
	},

	updateReadout(id, newValue, completeDisplayObj) {
		const entity = id.substr(0, 6);
		// console.log(id, entity, newValue, completeDisplayObj);
		switch (id) {
			case entity + 'Id':
				document.getElementById(`game__hud-${entity}-id`).innerText = newValue;
				break;
			case entity + 'HasBeenScanned':
			case entity + 'Contents': {
				let contentsDisp = '';
				if (entity === 'target') {
					const targetContentsDivClasses = document.getElementById(
						'game__hud-target-contents'
					).classList;
					targetContentsDivClasses.remove('game__hud-contents-text--unknown');
					if (
						completeDisplayObj.targetExists &&
						!completeDisplayObj.targetHasBeenScanned
					) {
						contentsDisp = '- unknown -';
						targetContentsDivClasses.add('game__hud-contents-text--unknown');
					}
				}

				if (entity === 'player' || completeDisplayObj.targetHasBeenScanned)
					contentsDisp = completeDisplayObj[`${entity}Contents`];

				document.getElementById(
					`game__hud-${entity}-contents`
				).innerText = contentsDisp;
				break;
			}
			case entity + 'Shield':
				hud.updateMeter(entity, 'Shield', newValue);
				break;
			case entity + 'Hull':
				hud.updateMeter(entity, 'Hull', newValue);
				break;
			case entity + 'System':
				hud.updateMeter(entity, 'System', newValue);
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
			case entity + 'PlayerRelation': {
				const targetNameDivClasses = document.getElementById(
					'game__hud-target-id'
				).classList;
				const possibleRelations = ['friendly', 'neutral', 'hostile'];
				possibleRelations.forEach((rel) =>
					targetNameDivClasses.remove(`game__hud-target-id--${rel}`)
				);
				targetNameDivClasses.add(`game__hud-target-id--${newValue}`);
			}
		}
	},

	updateMeter(entity, key, newValue) {
		// console.log(entity, key, newValue);
		let meterValue;
		let meterText = newValue;
		if (newValue === 0 || newValue === undefined) {
			meterText = '';
			meterValue = 0;
		} else {
			const maxValue = hud.maximums[`${entity}${key}`];
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
