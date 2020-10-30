import * as PIXI from '../pixi';
import c from './constants';
import { fadeHexColor } from './formulas';

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

export function getStoreEntity(entityId, currentState) {
	// console.log('LF ', entityId);
	if (entityId === currentState.entities.player.id) {
		return currentState.entities.player;
	} else {
		const storeEntity = currentState.entities.targetable.find(
			(entity) => entity.id === entityId
		);
		if (!storeEntity)
			console.info(`Couldn't find ${entityId}, it probably blew up.`);
		return storeEntity;
	}
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

	this.sprites['targetingReticule'].TL.alpha = newValue;
	this.sprites['targetingReticule'].TR.alpha = newValue;
	this.sprites['targetingReticule'].BL.alpha = newValue;
	this.sprites['targetingReticule'].BR.alpha = newValue;
}

export function reticuleRelation(playerRelation) {
	const tints = {
		friendly: 0x37d837,
		neutral: 0xe6b632,
		hostile: 0xe63232,
	};

	const newTint = tints[playerRelation];

	this.sprites['targetingReticule'].TL.tint = newTint;
	this.sprites['targetingReticule'].TR.tint = newTint;
	this.sprites['targetingReticule'].BL.tint = newTint;
	this.sprites['targetingReticule'].BR.tint = newTint;
}

export function moveTargetingReticule(newTarget, stageEntities) {
	for (const p in stageEntities) {
		if (stageEntities[p].entityStore === 'other') continue;
		stageEntities[p].toggleTargetingReticule(false);
	}

	if (newTarget) stageEntities[newTarget].toggleTargetingReticule(true);
}

export function showDamageTint(damagableSprites = []) {
	if (this.currentTint !== 0xffffff) {
		if (damagableSprites.length < 0) return;

		const newTint = fadeHexColor(this.currentTint, 0x8);

		damagableSprites.forEach((sprite) => (this.sprites[sprite].tint = newTint));
		this.currentTint = newTint;
	}
}

export function blowUp(callbackFn = null) {
	// console.log(`blowing up`, this);
	const timings = {
		explosionsDone: 1500,
		s1: 0,
		s2: 50,
		s3: 120,
		h1: 175,
		h2: 400,
		peak: 300,
	};

	this.explosionTimings = timings;
	this.bubbleAttributes = [0.1, 0.1, 0.1, 0.1, 0.5];
	this.bubbleHolder = [];
	this.explosionTimer = 0;
	this.explosionStep = 1;
	this.showingExplosion = true;

	// remove targeting reticule
	for (const trKey in this.sprites['targetingReticule'])
		this.removeChild(this.sprites['targetingReticule'][trKey]);

	// delete stage entity
	if (typeof callbackFn === 'function') {
		window.setTimeout(callbackFn, timings.explosionsDone);
	}
}

function makeBubble(x, y, size, fill = true) {
	const explosionColor = Math.trunc(0xb05353 * (1 + Math.random() / 750));
	// console.log(explosionColor.toString(16));

	const bubble = new PIXI.Graphics();
	if (fill) {
		bubble.lineStyle(0);
		bubble.beginFill(explosionColor);
	} else {
		bubble.lineStyle(1, 0xffffff);
		bubble.beginFill(0x000000, 0);
	}
	bubble.drawCircle(x, y, size);
	bubble.endFill();
	bubble.alpha = 0;

	return bubble;
}

function modifyBubble(bubble, newVal) {
	bubble.alpha = newVal;
	bubble.scale.x = newVal;
	bubble.scale.y = newVal;
}

export function animateExplosion(delta) {
	if (!this.showingExplosion) return;

	this.explosionTimer = this.explosionTimer + delta * 16;

	if (
		this.explosionTimer > this.explosionTimings.s1 &&
		this.explosionStep === 1
	) {
		// making b1
		this.bubbleHolder[0] = makeBubble(-20, -15, 20);
		this.addChild(this.bubbleHolder[0]);
		this.explosionStep++;
	}

	if (
		this.explosionStep > 1 &&
		this.explosionTimer < this.explosionTimings.peak
	) {
		// growing b1
		this.bubbleAttributes[0] = Math.min(1, this.bubbleAttributes[0] + 0.1);
		modifyBubble(this.bubbleHolder[0], this.bubbleAttributes[0]);
	}

	if (
		this.explosionTimer > this.explosionTimings.s2 &&
		this.explosionStep === 2
	) {
		// making b2
		this.bubbleHolder[1] = makeBubble(20, 15, 17);
		this.addChild(this.bubbleHolder[1]);
		this.explosionStep++;
	}

	if (
		this.explosionStep > 2 &&
		this.explosionTimer < this.explosionTimings.peak
	) {
		// growing b2
		this.bubbleAttributes[1] = Math.min(1, this.bubbleAttributes[1] + 0.1);
		modifyBubble(this.bubbleHolder[1], this.bubbleAttributes[1]);
	}

	if (
		this.explosionTimer > this.explosionTimings.s3 &&
		this.explosionStep === 3
	) {
		// making b3
		this.bubbleHolder[2] = makeBubble(0, 0, 35);
		this.addChild(this.bubbleHolder[2]);
		this.explosionStep++;
	}

	if (
		this.explosionStep > 3 &&
		this.explosionTimer < this.explosionTimings.peak
	) {
		// growing b3
		this.bubbleAttributes[2] = Math.min(1, this.bubbleAttributes[2] + 0.1);
		modifyBubble(this.bubbleHolder[2], this.bubbleAttributes[2]);
	}

	if (this.explosionTimer > this.explosionTimings.h1) {
		// shrinking b1
		this.bubbleAttributes[0] = Math.max(0, this.bubbleAttributes[0] - 0.7);
		modifyBubble(this.bubbleHolder[0], this.bubbleAttributes[0]);
	}

	if (this.explosionTimer > this.explosionTimings.h2) {
		// shrinking b2
		this.bubbleAttributes[1] = Math.max(0, this.bubbleAttributes[1] - 0.4);
		modifyBubble(this.bubbleHolder[1], this.bubbleAttributes[1]);
	}

	if (
		this.explosionTimer > this.explosionTimings.peak &&
		this.explosionStep < 5
	) {
		// removing entity sprites
		for (const sKey in this.sprites) {
			if (sKey !== 'targetingReticule') {
				this.removeChild(this.sprites[sKey]);
			}
		}

		this.bubbleHolder[3] = makeBubble(0, 0, 85, false);
		this.bubbleHolder[3].alpha = this.bubbleAttributes[4];
		this.addChild(this.bubbleHolder[3]);

		this.explosionStep++;
	}

	if (this.explosionStep > 4) {
		// shrinking b3
		this.bubbleAttributes[2] = Math.max(0, this.bubbleAttributes[2] - 0.05);
		modifyBubble(this.bubbleHolder[2], this.bubbleAttributes[2]);

		// animating b4
		this.bubbleAttributes[3] = Math.min(1, this.bubbleAttributes[3] + 0.02);
		this.bubbleHolder[3].scale.x = this.bubbleAttributes[3];
		this.bubbleHolder[3].scale.y = this.bubbleAttributes[3];
		this.bubbleAttributes[4] = Math.max(0, this.bubbleAttributes[4] - 0.01);
		this.bubbleHolder[3].alpha = this.bubbleAttributes[4];
	}
}

export const shields = {
	handlers: { dispatch: null, state: null, paused: null, stageEntities: null }, // gets its values in App.js
	shieldRegenInterval: null,

	shieldRegenTick() {
		if (shields.handlers.paused.proper) return;

		const currentState = shields.handlers.state();
		// console.log(shields.handlers.stageEntities);
		for (const sEKey in shields.handlers.stageEntities) {
			if (shields.handlers.stageEntities[sEKey].entityStore === 'other')
				continue;

			let storeEntity = getStoreEntity(sEKey, currentState);

			if (!storeEntity) continue;
			if (!storeEntity.immutable.hasShields) continue;
			if (storeEntity.isDisabled) continue;

			// console.log(sEKey, storeEntity);

			const maxShieldStrength = storeEntity.immutable.maxShieldStrength;
			const shieldStrength = storeEntity.shieldStrength;

			if (shieldStrength < maxShieldStrength) {
				const shieldRechargeRate = storeEntity.immutable.shieldRechargeRate;

				shields.handlers.dispatch({
					type: c.actions.SHIELD_REGEN,
					id: sEKey,
					store: storeEntity.store,
					amount: shieldRechargeRate,
				});
			}
		}
	},

	init() {
		shields.shieldRegenInterval = window.setInterval(
			shields.shieldRegenTick,
			1000
		);
	},
};

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
				// console.error(`Unable to find target: ${targeting}`);
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

export function spawnBuoys(entities, handlers) {
	const density = 500;
	for (
		let x = c.playVolume.minX / density;
		x <= c.playVolume.maxX / density;
		x++
	) {
		for (
			let y = c.playVolume.minY / density;
			y <= c.playVolume.maxY / density;
			y++
		) {
			const coordX = x * density;
			const coordY = y * density;
			entities.spawn(
				handlers,
				'buoy',
				{
					posX: coordX,
					posY: coordY,
				},
				{
					id: `${coordX}_${coordY}`,
					contents: '-',
				}
			);
		}
	}
}

export function hello() {
	let helloPadding = '\n';
	if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
		helloPadding = '';
	}
	console.info(
		`\n %c %c  🚀 Sublight Patrol %c - ${c.gameVersion} %c \n${helloPadding}`,
		'background: #32ade6; padding: 5px 3px',
		'background: #003030; color: #32ade6; padding: 5px 0',
		'background: #003030; color: #2e769e; padding: 5px 0',
		''
	);
}
