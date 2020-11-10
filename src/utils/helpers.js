import * as PIXI from '../pixi';
import c from './constants';
import idCreator from './idCreator';
import { fadeHexColor, easing } from './formulas';
import entities from '../entities/entities';

export const timing = {
	timingModes: {
		intro: 'intro',
		play: 'play',
		pause: 'pause',
	},
	times: {
		intro: 0,
		play: 0,
		pause: 0,
	},
	tickers: {
		intro: {},
		play: {},
		pause: {},
	},
	startTime: 0,
	currentMode: 'play',

	isPaused() {
		if (timing.currentMode === timing.timingModes.pause) return true;
		return false;
	},

	tick(mode, deltaMS) {
		timing.times[mode] += deltaMS;

		for (const tickerId in timing.tickers[mode]) {
			timing.tickers[mode][tickerId].tick(deltaMS);
		}
	},

	setTimeout(callbackFn, mode, milliseconds) {
		// based on:
		// https://github.com/brenwell/pixi-timeout/blob/master/index.js
		let progress = 0;
		const tickerId = idCreator.create();

		const tick = (deltaMS) => {
			progress += deltaMS;

			if (progress > milliseconds) end(true);
		};

		const end = (fire) => {
			// remove from tickers
			delete timing.tickers[mode][tickerId];

			// fire callback function
			if (fire) callbackFn();
		};

		const clear = () => {
			end(false);
		};

		const finish = () => {
			end(true);
		};

		// start
		timing.tickers[mode][tickerId] = { tick };

		return { clear, finish };
	},

	clearTimeout(timerObj) {
		if (timerObj) timerObj.clear();
	},
};

export function getPosition(entityId, positions) {
	if (positions.canMove[`${entityId}--posX`] !== undefined) {
		return [
			positions.canMove[`${entityId}--posX`],
			positions.canMove[`${entityId}--posY`],
		];
	}

	if (positions.cantMove[`${entityId}--posX`] !== undefined) {
		return [
			positions.cantMove[`${entityId}--posX`],
			positions.cantMove[`${entityId}--posY`],
		];
	}

	console.error(`Unable to ascertain position for ${entityId}`);
}

export function getVelocity(entityId, positions) {
	if (positions.canMove[`${entityId}--latVelocity`] !== undefined) {
		return [
			positions.canMove[`${entityId}--latVelocity`],
			positions.canMove[`${entityId}--longVelocity`],
		];
	}

	console.error(`Unable to ascertain velocity for ${entityId}`);
}

export function repositionMovedEntities(
	movedEntities,
	stageEntities,
	canMoveStore
) {
	movedEntities.forEach((entityId) => {
		const newX = canMoveStore[`${entityId}--posX`];
		const newY = canMoveStore[`${entityId}--posY`];
		stageEntities[entityId].position.set(newX, newY);

		if (
			newX < c.playVolume.minX ||
			newX > c.playVolume.maxX ||
			newY < c.playVolume.minY ||
			newY > c.playVolume.maxY
		) {
			entities.despawn(entityId);
		}
	});
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
	let re = {};
	re.TL = fromSpriteSheet.create(332, 12, 11, 11);
	re.TR = fromSpriteSheet.create(362, 12, 11, 11);
	re.BL = fromSpriteSheet.create(332, 42, 11, 11);
	re.BR = fromSpriteSheet.create(362, 42, 11, 11);
	re.TL.x = params.xl;
	re.TL.y = params.yt;
	re.TR.x = params.xr;
	re.TR.y = params.yt;
	re.BL.x = params.xl;
	re.BL.y = params.yb;
	re.BR.x = params.xr;
	re.BR.y = params.yb;
	re.TL.alpha = 0;
	re.TR.alpha = 0;
	re.BL.alpha = 0;
	re.BR.alpha = 0;

	return re;
}

export function addThrusters(params) {
	let re = {};

	for (const nozzleOrientation in params) {
		re[nozzleOrientation] = params[nozzleOrientation].map((thruster) => {
			let current;
			if (nozzleOrientation === 'main') {
				current = fromSpriteSheet.create(275, 90, 20, 12);
			} else {
				current = fromSpriteSheet.create(285, 23, 8, 16);
				switch (nozzleOrientation) {
					case 'front':
						current.rotation = Math.PI / 2;
						break;
					case 'rightSide':
						current.rotation = Math.PI;
						break;
				}
			}
			current.x = thruster.x;
			current.y = thruster.y;
			current.alpha = 0;

			return current;
		});
	}

	this.sprites['thrusters'] = re;

	this.thrusterAlphas = {
		current: {
			main: 0,
			front: 0,
			leftSide: 0,
			rightSide: 0,
		},
		required: {
			main: 0,
			front: 0,
			leftSide: 0,
			rightSide: 0,
		},
	};
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

export function flip() {
	const stepValue = Math.PI / 40;
	if (this.currentRotation !== this.targetRotation) {
		if (!this.rotationTriggered) {
			this.cRot = this.currentRotation;
			this.rotationTriggered = true;
		} else {
			if (this.currentRotation > this.targetRotation) {
				this.cRot = this.cRot - stepValue;
			} else {
				this.cRot = this.cRot + stepValue;
			}
			this.currentRotation =
				easing.easeInOutQuart(this.cRot / Math.PI) * this.cRot;
		}

		this.rotation = this.currentRotation;
	} else {
		this.rotationTriggered = false;
	}
}

export function updateStageEntityVelocities(
	entityId,
	stageEntities,
	newLatVelocity,
	newLongVelocity
) {
	stageEntities[entityId].latVelocity = newLatVelocity;
	stageEntities[entityId].longVelocity = newLongVelocity;
}

export function fireThrusters() {
	if (
		this.currentLatVelocity !== this.latVelocity ||
		this.currentLongVelocity !== this.longVelocity
	) {
		let update = {
			main: false,
			leftSide: false,
			rightSide: false,
			front: false,
		};
		if (this.facing === 1) {
			if (this.latVelocity < 0) {
				update.rightSide = true;
			} else if (this.latVelocity > 0) {
				update.leftSide = true;
			}
			if (this.longVelocity < 0) {
				update.front = true;
			} else if (this.longVelocity > 0) {
				update.main = true;
			}
		} else if (this.facing === -1) {
			if (this.latVelocity < 0) {
				update.leftSide = true;
			} else if (this.latVelocity > 0) {
				update.rightSide = true;
			}
			if (this.longVelocity < 0) {
				update.main = true;
			} else if (this.longVelocity > 0) {
				update.front = true;
			}
		}

		for (const nozzleOrientation in update) {
			if (update[nozzleOrientation]) {
				this.thrusterAlphas.required[nozzleOrientation] = 100;
			} else {
				this.thrusterAlphas.required[nozzleOrientation] = 0;
			}
		}

		this.currentLatVelocity = this.latVelocity;
		this.currentLongVelocity = this.longVelocity;
	}

	for (const orientation in this.thrusterAlphas.required) {
		let goAhead = false;
		let step = 15;
		if (orientation === 'main') step = 5;

		if (
			this.thrusterAlphas.required[orientation] >
			this.thrusterAlphas.current[orientation]
		) {
			this.thrusterAlphas.current[orientation] = Math.min(
				100,
				this.thrusterAlphas.current[orientation] + step
			);
			goAhead = true;
		} else if (
			this.thrusterAlphas.required[orientation] <
			this.thrusterAlphas.current[orientation]
		) {
			this.thrusterAlphas.current[orientation] = Math.max(
				0,
				this.thrusterAlphas.current[orientation] - step
			);
			goAhead = true;
		}

		if (goAhead) {
			this.sprites.thrusters[orientation].forEach(
				(thruster) =>
					(thruster.alpha = this.thrusterAlphas.current[orientation] / 100)
			);

			if (
				this.thrusterAlphas.required[orientation] ===
				this.thrusterAlphas.current[orientation]
			)
				this.thrusterAlphas.current[orientation] = this.thrusterAlphas.required[
					orientation
				];
		}
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
		timing.setTimeout(
			callbackFn,
			timing.timingModes.play,
			timings.explosionsDone
		);
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
	handlers: { dispatch: null, state: null, timing: null, stageEntities: null }, // gets its values in App.js
	shieldRegenInterval: null,

	shieldRegenTick() {
		if (shields.handlers.timing.isPaused()) return;

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
		timing.setTimeout(
			() => {
				containerDiv.style.visibility = 'hidden';
			},
			timing.timingModes.play,
			500
		);
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
		timing.setTimeout(
			() => {
				dialogHelper(speaker, say);
			},
			timing.timingModes.play,
			400
		);
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
			timing.setTimeout(alertsAndWarnings.update, timing.timingModes.play, 500);
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
			alertsAndWarnings.hiderTimeout = timing.setTimeout(
				() => {
					containerDiv.classList.remove('game__warnings--shown');
					alertsAndWarnings.isFading = false;
					alertsAndWarnings.isVisible = false;
				},
				timing.timingModes.play,
				900
			);
			return;
		}

		timing.clearTimeout(alertsAndWarnings.hiderTimeout);

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
			timing.setTimeout(
				() => {
					alertsAndWarnings.isFading = false;
					alertsAndWarnings.isVisible = true;
				},
				timing.timingModes.play,
				400
			);

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
			timing.setTimeout(
				() => {
					warningHelper();
				},
				timing.timingModes.play,
				400
			);
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

export function spawnBuoys(entities) {
	const buoys = [
		{ x: 0, y: 0 },
		{ x: c.playVolume.minX, y: 0 },
		{ x: c.playVolume.maxX, y: 0 },
		{ x: 0, y: c.playVolume.minY },
		{ x: 0, y: c.playVolume.maxY },
		{ x: c.playVolume.minX, y: c.playVolume.minY },
		{ x: c.playVolume.maxX, y: c.playVolume.minY },
		{ x: c.playVolume.minX, y: c.playVolume.maxY },
		{ x: c.playVolume.maxX, y: c.playVolume.maxY },
	];

	buoys.forEach(({ x, y }) => {
		entities.spawn(
			'buoy',
			{
				posX: x,
				posY: y,
			},
			{
				id: `${x}_${y}`,
				contents: '-',
			}
		);
	});
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
