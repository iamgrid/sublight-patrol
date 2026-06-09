import * as PIXI from '../pixi';
import c from './constants';
import { fadeHexColor, easing, decreaseNumberBy } from './formulas';
import timing from './timing';
import entities from '../entities/entities';
import soundEffects from '../audio/soundEffects';
import storyConstants from '../story/storyConstants';

export function isEmptyObject(obj) {
	return Object.keys(obj).length < 1;
}

export function makeName(input) {
	return input
		.split('_')
		.map((el) => {
			if (el === 'htran') {
				return 'HTran';
			} else if (el === 'lsb') {
				return 'LsB';
			} else {
				return `${el.substr(0, 1).toUpperCase()}${el.substr(1)}`;
			}
		})
		.join(' ');
}

/**
 *
 * @param {*} entityId
 * @param {*} positions
 * @returns an array containing position of the entity like so: [x, y]
 */

export function getPosition(entityId, positions) {
	if (positions.canMove[`${entityId}--posX`] !== undefined) {
		const reX = positions.canMove[`${entityId}--posX`];
		const reY = positions.canMove[`${entityId}--posY`];
		if (!Number.isInteger(reX) || !Number.isInteger(reY)) {
			console.error({ entityId, reX, reY, positions });
		}
		return [reX, reY];
	}

	if (positions.cantMove[`${entityId}--posX`] !== undefined) {
		const reX = positions.cantMove[`${entityId}--posX`];
		const reY = positions.cantMove[`${entityId}--posY`];
		if (!Number.isInteger(reX) || !Number.isInteger(reY)) {
			console.error({ entityId, reX, reY, positions });
		}
		return [reX, reY];
	}

	console.error(`Unable to ascertain position for ${entityId}`, positions);
	return [false, false];
}

export function getVelocity(entityId, velocities) {
	if (velocities[`${entityId}--latVelocity`] !== undefined) {
		return [
			velocities[`${entityId}--latVelocity`],
			velocities[`${entityId}--longVelocity`],
		];
	}

	console.error(`Unable to ascertain velocity for ${entityId}`);
}

/**
 *
 * @returns an array like this: [cameraTLX, cameraTLY]
 */
export function getCameraTLBasedOnPlayerPosition(
	playerX,
	playerY,
	playerFacing,
) {
	let cameraTLX = 0 - playerX + 100;
	if (playerFacing === -1) {
		cameraTLX = 0 - playerX + (c.gameCanvas.width - 100);
	}

	const cameraTLY = 0 - playerY + 225;

	return [cameraTLX, cameraTLY];
}

export function repositionMovedEntities(
	movedEntities,
	stageEntities,
	canMoveStore,
	playerId,
	playVolume,
) {
	movedEntities.forEach((entityId) => {
		const newX = canMoveStore[`${entityId}--posX`];
		const newY = canMoveStore[`${entityId}--posY`];
		stageEntities[entityId].position.set(newX, newY);

		if (
			newX < playVolume.minX ||
			newX > playVolume.maxX ||
			newY < playVolume.minY ||
			newY > playVolume.maxY
		) {
			if (entityId === playerId) return;

			if (entities.stageEntities[entityId].triggeredFading === undefined)
				entities.stageEntities[entityId].triggeredFading = false;

			// entities that aren't the player will fade out and despawn
			// when they move outside the playarea
			if (entities.stageEntities[entityId].triggeredFading === false) {
				timing.setTrigger(
					`${entityId}_exited-volume-fader`,
					() => {
						if (entities.stageEntities[entityId] === undefined) return;

						if (entities.stageEntities[entityId].alpha > 0) {
							entities.stageEntities[entityId].alpha = Math.max(
								0,
								entities.stageEntities[entityId].alpha - 0.02,
							);
						} else {
							entities.despawn(entityId);
						}
					},
					timing.modes.play,
					30,
					true,
					55,
					30,
				);
				entities.stageEntities[entityId].triggeredFading = true;
			}
		}
	});
}

export function getStoreEntity(entityId, currentState) {
	// console.log('LF ', entityId);
	if (entityId === currentState.entities.player.id) {
		return currentState.entities.player;
	} else {
		const storeEntity = currentState.entities.targetable.find(
			(entity) => entity.id === entityId,
		);
		if (!storeEntity) {
			// console.info(`Couldn't find ${entityId}, it probably blew up.`);
			console.warn(`Couldn't find ${entityId}, it probably blew up.`);
			return false;
		}
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

export function recalculateSoftBoundaries() {
	for (const side in this.current) {
		if (side === 'softBoundary') continue;
		this.softBoundaries[side] = decreaseNumberBy(
			this.current[side],
			c.showWarningWhenThisCloseToTheBoundary,
		);
	}
}

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

export function createThrusters(params) {
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

export function createThrusterSprites() {
	for (const thKey in this.sprites['thrusters'])
		this.sprites['thrusters'][thKey].forEach((thruster) =>
			this.addChild(thruster),
		);
}

export function addTargetingReticuleSprites() {
	for (const tRKey in this.sprites['targetingReticule'])
		this.addChild(this.sprites['targetingReticule'][tRKey]);
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

export function addEMPSprite() {
	// console.log('addEMPSprite', this.entityId, this.hasEMP);
	const spriteId = 'emp_bubble';
	this.sprites[spriteId] = new PIXI.Graphics();

	this.sprites[spriteId].lineStyle();
	this.sprites[spriteId].beginFill(0xff9000);
	this.sprites[spriteId].drawCircle(0, 0, c.empReach);
	this.sprites[spriteId].endFill();
	this.sprites[spriteId].alpha = 0;
	this.addChild(this.sprites[spriteId]);
}

export function toggleEMP(toggle = true) {
	// console.log('toggleEMP', this.entityId, toggle);
	if (!this.hasEMP) return;

	this.empIsToggled = toggle;
}

export function updateEMP() {
	if (!this.hasEMP) return;

	const stepValue = 1;

	const currentAlpha = this.sprites['emp_bubble'].alpha * 100;

	if (!this.empIsToggled && currentAlpha === 0) return;

	let newAlpha = currentAlpha;
	if (this.empIsToggled) {
		if (this.empUpswing === undefined) this.empUpswing = true;

		if (currentAlpha < 5) {
			this.empUpswing = true;
		} else if (currentAlpha > 10) {
			this.empUpswing = false;
		}

		if (this.empUpswing) {
			newAlpha = currentAlpha + stepValue;
		} else {
			newAlpha = currentAlpha - stepValue;
		}
	} else if (!this.empIsToggled) {
		if (currentAlpha > 0) newAlpha = currentAlpha - stepValue;
	}

	// console.log({ newAlpha });

	this.sprites['emp_bubble'].alpha = newAlpha / 100;
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

	if (this.isDisabled) {
		if (
			(this.facing === 1 && this.currentRotation < (-1 * Math.PI) / 10) ||
			(this.facing === -1 && this.currentRotation < (9 * Math.PI) / 10)
		) {
			return;
		}

		this.currentRotation = this.currentRotation - Math.PI / 3141;
		this.rotation = this.currentRotation;
		// console.log(this.entityId, this.facing, this.currentRotation);
		return;
	}

	if (this.currentRotation !== this.targetRotation) {
		// console.log('2', this.entityId, this.currentRotation, this.targetRotation);
		this.isFlipping = true;
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
		if (this.isFlipping) this.isFlipping = false;
		this.rotationTriggered = false;
	}
}

export function updateStageEntityVelocities(
	entityId,
	stageEntities,
	newLatVelocity,
	newLongVelocity,
) {
	stageEntities[entityId].latVelocity = newLatVelocity;
	stageEntities[entityId].longVelocity = newLongVelocity;
}

export function flipStageEntity(entityId, stageEntities, newFacing) {
	stageEntities[entityId].facing = newFacing;
	if (newFacing === 1) {
		stageEntities[entityId].targetRotation = 0;
	} else {
		stageEntities[entityId].targetRotation = Math.PI;
	}
}

export function fireThrusters() {
	if (this.showingExplosion || this.isDisabled) {
		for (const orientation in this.thrusterAlphas.current) {
			this.sprites.thrusters[orientation].forEach((thruster) => {
				thruster.alpha = 0;
			});
		}
		return;
	}

	// which thrusters need to be updated?
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

				// start audio loop on this emitter
				if (nozzleOrientation === 'main') {
					soundEffects.startLoop(
						this.entityId,
						soundEffects.library.main_thruster.id,
					);
				} else {
					soundEffects.startLoop(
						this.entityId,
						soundEffects.library.side_thruster.id,
						nozzleOrientation,
					);
				}
			} else {
				this.thrusterAlphas.required[nozzleOrientation] = 0;

				// stop audio loop on this emitter
				if (nozzleOrientation === 'main') {
					soundEffects.stopLoop(
						this.entityId,
						soundEffects.library.main_thruster.id,
					);
				} else {
					soundEffects.stopLoop(
						this.entityId,
						soundEffects.library.side_thruster.id,
						nozzleOrientation,
					);
				}
			}
		}

		this.currentLatVelocity = this.latVelocity;
		this.currentLongVelocity = this.longVelocity;
	}

	for (const orientation in this.thrusterAlphas.required) {
		// do not mess with the thrusters if the entity is executing a flip
		if (this.currentRotation !== this.targetRotation) continue;

		// visual updates (with fading)
		let goAhead = false;
		let step = 15;
		if (orientation === 'main') step = 5;

		if (
			this.thrusterAlphas.required[orientation] >
			this.thrusterAlphas.current[orientation]
		) {
			this.thrusterAlphas.current[orientation] = Math.min(
				100,
				this.thrusterAlphas.current[orientation] + step,
			);
			goAhead = true;
		} else if (
			this.thrusterAlphas.required[orientation] <
			this.thrusterAlphas.current[orientation]
		) {
			this.thrusterAlphas.current[orientation] = Math.max(
				0,
				this.thrusterAlphas.current[orientation] - step,
			);
			goAhead = true;
		}

		if (goAhead) {
			this.sprites.thrusters[orientation].forEach(
				(thruster) =>
					(thruster.alpha = this.thrusterAlphas.current[orientation] / 100),
			);

			if (
				this.thrusterAlphas.required[orientation] ===
				this.thrusterAlphas.current[orientation]
			)
				this.thrusterAlphas.current[orientation] =
					this.thrusterAlphas.required[orientation];
		}
	}
}

export function blowUp(callbackFn = null) {
	console.log(`blowing up`, this.entityId);
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
		timing.setTimeout(callbackFn, timing.modes.play, timings.explosionsDone);
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
	handlers: { dispatch: null, state: null }, // gets its values in App.js
	entitiesWithShields: [],
	shieldRegenInterval: null,

	shieldRegenTick() {
		if (timing.isPaused()) return;
		if (!timing.isEntityMovementEnabled()) return;

		if (typeof shields.handlers.state !== 'function') return;

		const currentState = shields.handlers.state();

		shields.entitiesWithShields.forEach((shieldObj) => {
			let storeEntity = getStoreEntity(shieldObj.id, currentState);
			if (!storeEntity) return;

			if (storeEntity.isDisabled) {
				shields.removeEntity(shieldObj.id);
				return;
			}

			const maxShieldStrength = shieldObj.maxShieldStrength;
			const shieldStrength = storeEntity.shieldStrength;

			if (shieldStrength < maxShieldStrength) {
				const shieldRechargeRate = shieldObj.shieldRechargeRate;

				shields.handlers.dispatch({
					type: c.actions.SHIELD_REGEN,
					id: shieldObj.id,
					store: storeEntity.store,
					amount: shieldRechargeRate,
				});
			}
		});
	},

	addEntity(entityId) {
		const currentState = shields.handlers.state();

		let storeEntity = getStoreEntity(entityId, currentState);
		if (!storeEntity) return;

		const shieldObj = {
			id: entityId,
			maxShieldStrength: storeEntity.immutable.maxShieldStrength,
			shieldRechargeRate: storeEntity.immutable.shieldRechargeRate,
		};
		shields.entitiesWithShields.push(shieldObj);
	},

	removeEntity(entityId) {
		shields.entitiesWithShields = shields.entitiesWithShields.filter(
			(el) => el.id !== entityId,
		);
	},

	init() {
		shields.shieldRegenInterval = window.setInterval(
			shields.shieldRegenTick,
			1000,
		);
	},

	cleanUp() {
		shields.entitiesWithShields = [];
	},
};

function stripTags(str) {
	return str.replace(/<\/?[^>]+(>|$)/g, '');
}

export const messageLayer = {
	messageIsShowing: false,
	MESSAGE_TYPE_IDS: {
		system: 'system',
		dialog: 'dialog',
	},
	queuedMessages: [],
	_showMessage(queueIndex) {
		const { speaker, message, whereAndWhen, messageType } =
			messageLayer.queuedMessages[queueIndex];

		document.getElementById(
			'game__messagelayer-message-queue-readout',
		).innerHTML = `${queueIndex + 1} / ${messageLayer.queuedMessages.length}`;
		document.getElementById('game__messagelayer-speaker').innerHTML =
			speaker + ' :';
		document.getElementById('game__messagelayer-where-and-when').innerHTML =
			`(${whereAndWhen})`;
		document.getElementById('game__messagelayer-message-text').innerHTML =
			message.replace(/\t/g, '');

		if (messageType === messageLayer.MESSAGE_TYPE_IDS.system) {
			document
				.getElementById('game__messagelayer-proper')
				.classList.add('game__messagelayer-proper--system');
			document
				.getElementById('game__messagelayer-proper')
				.classList.remove('game__messagelayer-proper--dialog');
		} else if (messageType === messageLayer.MESSAGE_TYPE_IDS.dialog) {
			document
				.getElementById('game__messagelayer-proper')
				.classList.add('game__messagelayer-proper--dialog');
			document
				.getElementById('game__messagelayer-proper')
				.classList.remove('game__messagelayer-proper--system');
		}

		document.getElementById('game__messagelayer-proper').style.opacity = '1';
		messageLayer.messageIsShowing = true;
		messageLayer.queuedMessages[queueIndex].messageWasShown = true;

		messageLayer.addMessageToGameLog(
			speaker,
			message,
			whereAndWhen,
			messageType,
		);
	},

	addMessageToGameLog(speaker, message, whereAndWhen, messageType) {
		let gameLogColor = gameLog.ENTRY_COLORS.aqua;
		if (messageType === messageLayer.MESSAGE_TYPE_IDS.system) {
			gameLogColor = gameLog.ENTRY_COLORS.gray;
		}

		const messageParagraphs = message.split('</p><p>');

		messageParagraphs.forEach((paragraph, ix) => {
			gameLog.add(
				gameLogColor,
				`[${speaker}]:${
					ix === 0 ? ` <i>(${whereAndWhen})</i> ` : ''
				} ${stripTags(paragraph)}`,
				timing.times.play,
			);
		});
	},

	advance() {
		const functionSignature = 'helpers.js@messageLayer.advance()';

		// fade current message
		document.getElementById('game__messagelayer-proper').style.opacity = '0';
		messageLayer.messageIsShowing = false;

		// if (messageLayer.queuedMessages.length > 0) {
		const nextMessageIndex = messageLayer.queuedMessages.findIndex(
			(el) => !el.messageWasShown,
		);
		if (nextMessageIndex !== -1) {
			// Show the next queued message
			timing.setTimeout(
				() => {
					messageLayer._showMessage(nextMessageIndex);
				},
				timing.modes.play,
				800,
			);
		} else {
			timing.toggleEntityMovement(true, functionSignature);
		}
		// }
	},

	skipDialog() {
		const functionSignature = 'helpers.js@messageLayer.skipDialog()';
		console.log(functionSignature, 'Skipping dialog...');

		messageLayer.queuedMessages.forEach((el) => {
			if (el.messageWasShown) return;

			messageLayer.addMessageToGameLog(
				el.speaker,
				el.message,
				el.whereAndWhen,
				el.messageType,
			);

			el.messageWasShown = true;
		});

		// fade current message
		document.getElementById('game__messagelayer-proper').style.opacity = '0';
		messageLayer.messageIsShowing = false;

		timing.toggleEntityMovement(true, functionSignature);
	},

	queueMessages(messages) {
		const functionSignature = 'helpers.js@messageLayer.queueMessages()';
		messageLayer.queuedMessages = [...messages];
		messageLayer.queuedMessages.forEach((el) => (el.messageWasShown = false));

		timing.toggleEntityMovement(false, functionSignature);
		messageLayer._showMessage(0);
	},

	hide() {
		document.getElementById('game__messagelayer').style.display = 'none';
	},

	show() {
		document.getElementById('game__messagelayer').style.display = 'flex';
	},
};

export const alertsAndWarnings = {
	prevMessageSum: 0,
	messageTypes: {
		warnings: {
			isVisible: false,
			proper: new Set(),
		},
		alerts: {
			isVisible: false,
			proper: new Set(),
		},
	},

	add(value) {
		alertsAndWarnings.messageTypes[`${value.type}s`].proper.add(value.k);
		// console.log(
		// 	'added',
		// 	value.type,
		// 	alertsAndWarnings.messageTypes[`${value.type}s`].proper
		// );
		alertsAndWarnings.updateDisplay();
	},

	remove(value) {
		alertsAndWarnings.messageTypes[`${value.type}s`].proper.delete(value.k);
		// console.log(
		// 	'removed',
		// 	value.type,
		// 	alertsAndWarnings.messageTypes[`${value.type}s`].proper
		// );
		alertsAndWarnings.updateDisplay();
	},

	updateDisplay() {
		let messageSum =
			alertsAndWarnings.messageTypes.warnings.proper.size +
			alertsAndWarnings.messageTypes.alerts.proper.size;
		// console.log(
		// 	'alertsAndWarnings.prevMessageSum:',
		// 	alertsAndWarnings.prevMessageSum,
		// 	'messageSum:',
		// 	messageSum
		// );
		let waitForFade = false;
		if (alertsAndWarnings.prevMessageSum > 0 && messageSum === 0) {
			waitForFade = true;
		}

		if (waitForFade) {
			timing.setTimeout(
				() => {
					alertsAndWarnings.updateDisplayProper();
				},
				timing.modes.play,
				1000,
			);
		} else {
			alertsAndWarnings.updateDisplayProper();
		}

		document.getElementById('game__alertsAndWarnings').style.display = 'flex';
		if (messageSum === 0) {
			document
				.getElementById('game__alertsAndWarnings')
				.classList.remove('game__alertsAndWarnings--shown');
		} else {
			document
				.getElementById('game__alertsAndWarnings')
				.classList.add('game__alertsAndWarnings--shown');
		}

		alertsAndWarnings.prevMessageSum = messageSum;
	},

	updateDisplayProper() {
		for (const messageType in alertsAndWarnings.messageTypes) {
			const thisType = alertsAndWarnings.messageTypes[messageType];

			let newText = [];

			for (let el of thisType.proper) {
				newText.push(c.alertsAndWarnings[messageType][el].m);
			}

			document.getElementById(
				`game__alertsAndWarnings-${messageType}`,
			).innerHTML = newText.reverse().join('<br />');

			if (thisType.proper.size > 0 && !thisType.isVisible) {
				document
					.getElementById(`game__alertsAndWarnings-${messageType}`)
					.classList.add(`game__alertsAndWarnings-${messageType}--shown`);
				alertsAndWarnings.messageTypes[messageType].isVisible = true;
			} else if (thisType.proper.size === 0 && thisType.isVisible) {
				document
					.getElementById(`game__alertsAndWarnings-${messageType}`)
					.classList.remove(`game__alertsAndWarnings-${messageType}--shown`);
				alertsAndWarnings.messageTypes[messageType].isVisible = false;
			}
		}
	},

	clear() {
		alertsAndWarnings.warnings = new Set();
		alertsAndWarnings.alerts = new Set();
		alertsAndWarnings.updateDisplay();
		// console.log(
		// 	'helpers.js@alertsAndWarnings.clear()',
		// 	alertsAndWarnings.warnings,
		// 	alertsAndWarnings.alerts
		// );
	},

	hide() {
		document.getElementById('game__alertsAndWarnings').style.display = 'none';
	},

	show() {
		document.getElementById('game__alertsAndWarnings').style.display = 'flex';
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

export const gameLog = {
	ENTRY_COLORS: {
		white: 'white',
		aqua: 'aqua',
		gray: 'gray',
		red: 'red',
		yellow: 'yellow',
		green: 'green',
		dark_green: 'dark_green',
	},
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
		const properDiv = document.getElementById('game__log-proper');

		if (this.store.length > 4) {
			properDiv.classList.add('game__log-proper--with-scrollbar');
		}

		const disp = [...this.store].map(
			({ color, text, at }) =>
				`<span class='time'>${at}&nbsp;</span> <span class='${color}'>${text}</span>`,
		);

		properDiv.innerHTML = disp.join('<br />');

		gameLog.scrollToBottom();

		if (this.isHidden) {
			this.toggleHide('show');
		}

		window.clearTimeout(gameLog.hiderTimeout);
		this.hiderTimeout = window.setTimeout(gameLog.toggleHide, 10000);
	},

	scrollToBottom() {
		const domElement = document.getElementById('game__log-proper');
		document.getElementById('game__log-proper').scrollTop =
			domElement.scrollHeight - domElement.clientHeight;
	},

	toggleHide(mode = 'hide') {
		const mainDivClasses = document.getElementById('game__log').classList;
		if (mode === 'hide') {
			mainDivClasses.add('game__log--hidden');
			gameLog.isHidden = true;
			window.clearTimeout(gameLog.hiderTimeout);
		} else {
			mainDivClasses.remove('game__log--hidden');
			gameLog.isHidden = false;
		}
	},

	toggleStatusExpansion(mode) {
		const mainDivClasses = document.getElementById('game__log').classList;

		let doExpand = !this.isExpanded;
		switch (mode) {
			case 'show':
				doExpand = true;
				break;
			case 'hide':
				doExpand = false;
				break;
		}

		if (doExpand) {
			mainDivClasses.add('game__log--expanded');
			this.isExpanded = true;
			gameLog.scrollToBottom();
		} else {
			this.isExpanded = false;
			window.setTimeout(() => {
				mainDivClasses.remove('game__log--expanded');
				gameLog.scrollToBottom();
			}, 50);
		}
	},

	clear() {
		this.store = [];

		document.getElementById('game__log-proper').innerHTML = '';
	},
};

export function storePlayerProgress(calledBy, state, bestSceneId) {
	const functionSignature = 'helpers.js@storePlayerProgress()';

	if (c.debug.localStorage) console.log(functionSignature, { calledBy });

	if (bestSceneId === null) {
		console.warn(
			functionSignature,
			{ calledBy },
			`bestSceneId is null, returning early.`,
		);
		return;
	}

	const currentState = state();
	const statePlayerShips = currentState.game.playerShips;
	const playerProgress = {
		gameDifficulty: currentState.game.gameDifficulty,
		bestSceneId: bestSceneId,
		playerShips: {
			current: statePlayerShips.current,
			currentIdSuffix: statePlayerShips.currentIdSuffix,
			hangarBerths: statePlayerShips.hangarBerths,
			hangarContents: [...statePlayerShips.hangarContents],
		},
		playerHasCompletedTheGame: currentState.game.playerHasCompletedTheGame,
		dataTS: Date.now(),
	};
	const playerProgressStr = JSON.stringify(playerProgress);
	localStorage.setItem('sublightPatrol', playerProgressStr);
	if (c.debug.localStorage)
		console.log(functionSignature, { calledBy, playerProgress });
}

/**
 *
 * @returns {Object|null} Returns the player progress from localStorage as an object, or null if no value was found or the found object is invalid.
 */
export function readPlayerProgress(validate = false) {
	const functionSignature = 'helpers.js@readPlayerProgress()';
	if (c.debug.localStorage) console.log(functionSignature);
	const playerProgressStr = localStorage.getItem('sublightPatrol');
	if (playerProgressStr === null) {
		return null;
	} else {
		let parsedPlayerProgress = null;

		try {
			parsedPlayerProgress = JSON.parse(playerProgressStr);
		} catch (e) {
			console.error(`${functionSignature} - Error parsing player progress:`, e);
			return null;
		}

		// Validate the parsed data

		let playerProgressIsValid = true;
		if (!(parsedPlayerProgress instanceof Object)) {
			console.error(
				`${functionSignature} - Parsed player progress is not an object.`,
			);
			playerProgressIsValid = false;
		}

		if (!validate && playerProgressIsValid) {
			return parsedPlayerProgress;
		}

		if (
			!('bestSceneId' in parsedPlayerProgress) ||
			!('gameDifficulty' in parsedPlayerProgress) ||
			!('playerShips' in parsedPlayerProgress) ||
			!('dataTS' in parsedPlayerProgress) ||
			!('playerHasCompletedTheGame' in parsedPlayerProgress)
		) {
			console.error(
				`${functionSignature} - Parsed player progress does not contain the required keys.`,
			);
			playerProgressIsValid = false;
		}

		if (typeof parsedPlayerProgress.playerHasCompletedTheGame !== 'boolean') {
			console.error(
				`${functionSignature} - playerHasCompletedTheGame is not a boolean.`,
			);
			playerProgressIsValid = false;
		}

		if (typeof parsedPlayerProgress.dataTS !== 'number') {
			console.error(`${functionSignature} - dataTS is not a number.`);
			playerProgressIsValid = false;
		}

		const latestLocalStorageVersionDateObj = new Date(
			c.latestLocalStorageVersionDate,
		);
		const dataTSDateObj = new Date(parsedPlayerProgress.dataTS);
		console.log(
			functionSignature,
			'dataTS value:',
			dataTSDateObj.toUTCString(),
			'latestLocalStorageVersionDate:',
			latestLocalStorageVersionDateObj.toUTCString(),
		);

		let storedDataIsOutOfDate = false;

		if (dataTSDateObj < latestLocalStorageVersionDateObj) {
			console.error(
				`${functionSignature} - dataTS is older than the latest local storage version date.`,
			);
			playerProgressIsValid = false;
			storedDataIsOutOfDate = true;
		}

		if (typeof parsedPlayerProgress.bestSceneId !== 'string') {
			console.error(`${functionSignature} - bestSceneId is not a string.`);
			playerProgressIsValid = false;
		}

		let bestSceneIsValid = false;
		for (const scene in storyConstants.scenes) {
			if (scene === parsedPlayerProgress.bestSceneId) {
				bestSceneIsValid = true;
				break;
			}
		}

		if (!bestSceneIsValid) {
			console.error(
				`${functionSignature} - bestSceneId is not a valid scene ID.`,
			);
			playerProgressIsValid = false;
		}

		if (typeof parsedPlayerProgress.gameDifficulty !== 'string') {
			console.error(`${functionSignature} - gameDifficulty is not a string.`);
			playerProgressIsValid = false;
		}

		if (
			!Object.keys(c.gameDifficulty).includes(
				parsedPlayerProgress.gameDifficulty,
			)
		) {
			console.error(
				`${functionSignature} - gameDifficulty is not a valid difficulty ID.`,
			);
			playerProgressIsValid = false;
		}

		if (!(parsedPlayerProgress.playerShips instanceof Object)) {
			console.error(`${functionSignature} - playerShips is not an object.`);
			playerProgressIsValid = false;
		}

		if (typeof parsedPlayerProgress.playerShips.hangarBerths !== 'number') {
			console.error(
				`${functionSignature} - playerShips.hangarBerths is not a number.`,
			);
			playerProgressIsValid = false;
		}

		if (
			typeof parsedPlayerProgress.playerShips.currentIdSuffix !== 'string' ||
			parsedPlayerProgress.playerShips.currentIdSuffix.length !== 1
		) {
			console.error(
				`${functionSignature} - playerShips.currentIdSuffix is not a valid string.`,
			);
			playerProgressIsValid = false;
		}

		if (
			typeof parsedPlayerProgress.playerShips.current !== 'string' ||
			!Object.keys(c.playableFighterTypeIds).includes(
				parsedPlayerProgress.playerShips.current,
			)
		) {
			console.error(
				`${functionSignature} - playerShips.current is not a valid fighter type ID.`,
			);
			playerProgressIsValid = false;
		}

		if (!Array.isArray(parsedPlayerProgress.playerShips.hangarContents)) {
			console.error(
				`${functionSignature} - playerShips.hangarContents is not an array.`,
			);
			playerProgressIsValid = false;
		}

		for (const ship of parsedPlayerProgress.playerShips.hangarContents) {
			if (
				typeof ship !== 'string' ||
				!Object.keys(c.playableFighterTypeIds).includes(ship)
			) {
				console.error(
					`${functionSignature} - playerShips.hangarContents contains an invalid fighter type ID: ${ship}`,
				);
				playerProgressIsValid = false;
			}
		}

		if (!playerProgressIsValid) {
			console.error(
				`${functionSignature} - Local storage player progress is invalid our out of date, alerting player and returning null.`,
			);

			console.error(functionSignature, { parsedPlayerProgress });

			if (storedDataIsOutOfDate) {
				alert(
					"According to your browser's storage, you have played Sublight Patrol before, but your progress can not be taken into account as it happened in an out of date version of the game. I apologize for making you start over!",
				);
			} else {
				alert(
					"According to your browser's storage, you have played Sublight Patrol before, but your progress can not be taken into account as the object storing it looks to have been corrupted. I apologize for making you start over!",
				);
			}

			return null;
		} else {
			return parsedPlayerProgress;
		}
	}
}

export function getHasThePlayerMadeProgress(localStoragePlayerProgress) {
	if (
		localStoragePlayerProgress === null ||
		localStoragePlayerProgress.bestSceneId === 'intro' ||
		localStoragePlayerProgress.bestSceneId === 'scene001'
	) {
		return false;
	} else {
		return true;
	}
}

export function getHasThePlayerCompletedTheGame(localStoragePlayerProgress) {
	if (
		localStoragePlayerProgress === null ||
		!localStoragePlayerProgress.playerHasCompletedTheGame
	) {
		return false;
	} else {
		return true;
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
		'',
	);
}

export function shortenGameVersion(gameVersion) {
	return gameVersion.substring(0, c.gameVersion.lastIndexOf(',')) + ')';
}

export function shortenDisplayUrl(displayUrl, maxLength = 30) {
	if (displayUrl.length > maxLength) {
		return displayUrl.substring(0, maxLength) + '...';
	}
	return displayUrl;
}

export function showConfirmationDialog(
	message,
	onConfirm,
	onCancel = null,
	controlSchemesHandler = null,
	addArrowKeyHandler = true,
) {
	const functionSignature = 'helpers.js@showConfirmationDialog()';

	function arrowKeyHandler(event) {
		// const functionSignature =
		// 	'helpers.js@showConfirmationDialog()@arrowKeyHandler()';
		// console.log(
		// 	functionSignature,
		// 	'key pressed:',
		// 	event.key,
		// 	'confirmation dialog is showing:',
		// 	window.spConfirmationDialogIsShowing
		// );

		if (!window.spConfirmationDialogIsShowing) return;

		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			if (
				document.activeElement.id === 'game__dialog--confirm__confirm-button'
			) {
				document.getElementById('game__dialog--confirm__cancel-button').focus();
			} else {
				document
					.getElementById('game__dialog--confirm__confirm-button')
					.focus();
			}
		}
	}

	if (controlSchemesHandler !== null) {
		controlSchemesHandler.suspendCurrentLayout();
	} else {
		console.log(functionSignature, 'controlSchemesHandler is null');
	}

	if (addArrowKeyHandler) {
		if (!window.spConfirmationDialogArrowKeyHandlerAdded) {
			window.addEventListener('keydown', arrowKeyHandler);
			window.spConfirmationDialogArrowKeyHandlerAdded = true;
		}
	}

	document.getElementById('game__dialog--confirm__message').innerHTML = message;

	document.getElementById('game__dialog--confirm__confirm-button').onclick =
		() => {
			onConfirm();
			document.getElementById('game__dialog--confirm').close();
			if (controlSchemesHandler !== null) {
				controlSchemesHandler.restoreSuspendedLayout();
			}
		};

	function dialogCancelEventFn() {
		if (controlSchemesHandler !== null) {
			controlSchemesHandler.restoreSuspendedLayout();

			window.spConfirmationDialogIsShowing = false;
		}
	}

	function onCancelProper() {
		if (typeof onCancel === 'function') {
			onCancel();
		}
		document.getElementById('game__dialog--confirm').close();
		dialogCancelEventFn();
	}

	document.getElementById('game__dialog--confirm__cancel-button').onclick =
		onCancelProper;

	// handle dialog cancel event, which is triggered when the user uses the [escape] key
	document
		.getElementById('game__dialog--confirm')
		.addEventListener('cancel', dialogCancelEventFn, { once: true });

	document.getElementById('game__dialog--confirm').showModal();
	window.spConfirmationDialogIsShowing = true;
	document.getElementById('game__dialog--confirm__confirm-button').focus();
}

export function showContinueDialog(
	message,
	dialogColor = 'yellow',
	onContinue = null,
	controlSchemesHandler = null,
) {
	const functionSignature = 'helpers.js@showContinueDialog()';
	if (controlSchemesHandler !== null) {
		controlSchemesHandler.suspendCurrentLayout();
	} else {
		console.log(functionSignature, 'controlSchemesHandler is null');
	}

	document.getElementById('game__dialog--continue__message').innerHTML =
		message;

	document
		.getElementById('game__dialog--continue')
		.classList.add(`game__dialog--${dialogColor}`);
	document.getElementById('game__dialog--continue__continue-button').onclick =
		() => {
			if (onContinue !== null) {
				onContinue();
			}
			document.getElementById('game__dialog--continue').close();
			if (controlSchemesHandler !== null) {
				controlSchemesHandler.restoreSuspendedLayout();
			}
		};

	function dialogCancelEventFn() {
		if (controlSchemesHandler !== null) {
			controlSchemesHandler.restoreSuspendedLayout();
		}
		if (onContinue !== null) {
			onContinue();
		}
	}

	// handle dialog cancel event, which is triggered when the user uses the [escape] key
	document
		.getElementById('game__dialog--continue')
		.addEventListener('cancel', dialogCancelEventFn, { once: true });

	document.getElementById('game__dialog--continue').showModal();
	document.getElementById('game__dialog--continue__continue-button').focus();
}

export function showFirstCraftLostDialog(onContinue, controlSchemesHandler) {
	const functionSignature = 'helpers.js@showFirstCraftLostDialog()';
	console.log(functionSignature, 'here');
	showContinueDialog(
		'<div class="first-craft-lost-message"><p>Wha... Who’s talking? It’s me, silly, the game’s developer, who else? So, what’s going on?</p><div class="first-craft-lost-message__image-wrapper"><img class="first-craft-lost-message__craft" alt="Fenrir (RIP)" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAABeCAYAAABvoDn/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAADmFJREFUeAHtXAtwVNUZ/rKvvJPNE5AEEuRhgYTw9FGRUN/UEfpQq1gjTGtFR0BnarV0BMdambYWX6O0KhKkWJlawcFSHJWIb95EAQuRPAmEZMMm2SSbZLPb/7977nKz2c3eu+4Nqe6XObO753HPOd/5///8/zmbjQFh7EvveRBFUJjkN40rbkcU/ZH1+EYYEEVIRElSgShJKhAlSQWiJKlAlCQVMCEM9Dg7++UZTWYYTAM/ztXdDXevC26XS/rM9Y0mC4xmk+o2MQYDjBYLTGaLdyxdXYDHDS1QM1YlwiLJ2daKRHpNjImRPp/xeGBJSESsKSlgfZ5od0c7enu6kU1thon8E04P2nnQNOG45BQYjEZfGybF6Wjr16aB+jpDz+K68alp6KI6Ce5e31hCIdRYAyEskhh3GU24yuDV1kWuHtiD1OtxOonUFhTQJBbS6hXE9NXwL0gK/kJENJ61IcGaLq2wu7cXHfZmTKbyQG1O0EQfoz6bWs5KUqQcSygMNNZg0NUm8WSZoIUGI1aTiPtPlsF5r5AkXUkkMjEetwcdNPl8IiJYmzFU9zlqk+d2w+PRP6IKW5JC4Ybrr8fBvbvR5mjF6kmTfflrTp3CjhY7UkhdbkrPwE0ZGXDTZJ+myV5z9AhOt9rhIXJZOmRsIXXa5PbanflE2kJqy+rOr4+RWm6l8ncpyZhPi3KpkKw1VN6Ac0RK6gZt0I2k4xUVOHrkCJ5ISkJ1VZWU90xHB/5FRnjYsOFoosE/UFONqsZGLMvPR2dLC+YRES/2eidbICbJNojzJCNPxG3qckr5w0iaHGLytbGxZNC99qynswNXKcZRTnVsJJFGs1n6zASZLNpo0o2kmuoq6XW22IVO0UpvpglOmHARhhNJjLi4OKwjouY3NWL8yBwU2+14sd0hlTE5TASnBSQxW1zndrhNCqlhmOPiJePPYBvoDyYoNlG9ofaHbjbJfvYscmjFLGLVKlzeickEye8dREaNswt2ImjWqFG+sq3uc9v6L0lKNpM0rCZpuo3eZ4t8S0ISkrOG+QjSC7oa7iSSArMgyTGAgXUQIS1EkoHqjyCVYtViO7OGVLNBtOMtvkDYIzb0d9Frd4cDXe3t0Bu6qRujldSDJYmnkST8GBflmYQj5+r1qk+SsD82mw2nKC85NRWONodkjN8lAtl94B3tEiKpUNRl48yKuYmIssQnkE1S5yeFA90kiZ29enYBTF6DOlUYztMNp311bE1NGEGTHiecyMNkdCW0tSGL/B92InkX+5LSW4jBw0TgYvJz2oXBXiCMtavbCT0RMUlydXeRj3POjnhEqHCguwcXwStJN8fGYfPXFZJqsUTZyRVYTEZXxnFht3JInTZmZRKhZ/B3kqbX6LlmMvIcnjRQGHKCfKkCg5fAwYBmknJyRuJoYwNyRo5EIfk4jKITJ9DKWzcR00m7C/s9rGInKK2qq0NpmhWxPS4sTUjAWJKs7UROEqnO7MREzLPESs/g3W8dxYSsinVEeBz5UHEtrVhAz2P5KicpY/XinU7pHjCU4Ywe0EzS0rvvwZJf/QKdNOhmmzfvT2RDjDS55JRk9BJZR7/6L8qJsIdJWhppQk+TcX1QkMGkyMTIaOO6DgfsZL+mTJyMQ+UH8QT5Vitzc+A8XiHtbjD0J+JvRKyB8ofc7paSkiK9srR4FH8ushWttPJmk7lP/SuvvQ47iKyfkvQc6OnpU8bkcN6i1lbUkc2aUliEJHI+LxwzFhtbW/BQfT1a0tOkusWzL8d111wtJcPkSXiI+vuMxhCfau03xjSrFZFE2DbpEdqJOIXCwltvwzVXXY2/rn0e9x05LIUjKUI9WEU5fW8iTZokNCsry9duH4U0r24oxRsNDd42H33Ur80f7ijB6NF5ffpbtvRePEJevBLfVM6kfZPv3dReKa195lm88PxzQcsnUZxWtvN932el8+gk+8LG2im8Yva4MzMyfS5BILCT6SAv3CW8ba5rJelhiQuE6TNnYPKkibhn2XJfntbzIyX4Simslvl5+UHLrphTjK8oZpORnJxMA5+F8RMmYLDws5t/gmW/eRiRQlgk9QoncCAoybE1N+PggQPYv28vwkESPWvBj36M59auxbGK4yHr7/r4I0QSYTmTTFKwxCj+wZW49fafw04nmCtWrULZrg+QTOph5KPXMFIqbRa11dVYXFKC+IT4kOPb9PrriCTClKTeoGW868nk2ISPUF1Ti7mzr6CjDu3+zGWXX46MzCw00bNsTXR6GZeAzo5ODCY0kTQqNzdkHQOt/LoNG/rk1dbXIZ0cT6NG4zl7zhxyXnPxXlmZpGZMTkZ6upTUqF2koGnU5Xs+xz82v6FZIsaPHYcztJVrbddEW3mLvQXDMzNx4ejRSCQPnSXVRLcrGbQrMuzkY7XQsQxL7ekzjaiurUFd3UmfFEcCYamb0ait2Vg6eWyiYNZg0GYCK46HlhYrOY58HJOVlY1xY/IxY+pUZGdnw0kx3tcULu3dvx8Hvzj0jVR0UEgaR5J0+lS9ZnVTgzaH9ySzmXZQJVLJl8qiIHkeeeglCxdiP+2uZR9+GJaahkeSSZvaJFJgyzcnwdTNXtgJe4F3pT1dFOQ0ucnLjYGJJM9gi4HFZUJ8J11Ithtgchil11Bw0H0cp8rKSiRQ/7l06nnfkiXYvWcP/vnWFk2SNSiSxOHG7s8+lbbzQIihY5RTO8+gfmcDLFYLYtPOxX/JeV7P2kJ5cSNiET8iDoZYAzz1FLfZzbDaEpFYN3Dg0UUefsWxY6gmwqYUTcXyJffiiSf/DLUYFJKkNgOomtJWddu7pSSjrbL/8awxzogEIst6UQraCskmTTQi//NsmNsHlnA3Ha0cOLAfl172fQqmC+m0oRxqEJYzyWoTLIXTJiZG29Frr7NXIq92+ymUP3kU3UY6wMvrGLAPZeIT0Vw6D1MLXc+49YIsSayKmdPSYXYZkVGTrLp9Jhn0WkUQHgoR97jDaaO8qh7QJqWRTRrutUmo9yC+1YK0w4lIOhnn7QMDj8tMZ1YFBYU4e9auWtUYugW4SjSSU8jHGzZbU8BydhBHzM2WEro9cDe6JRU08amj2N0SnLS7VRhhPkQ7nJ/t6cXA44nn3Y2ihbz8Mb7dTQsGhaQOut42kNvQ6w78PaLUQ3FSUt0/Qn8fKZWOlDPIU+fzrEzaXfcfPIhnX3hh8PykXpc2dTtWUYHcCy7ASboUiDTYaTRbzMiiIJjVKSU1RfK+2eNmH+ntd945Px63VkmqqDyBKQUFRK62duPGj6eJe30gOfzwxm5kqNP9Y7dmnK6pOf+xW+HMi/HbXz+omSQWcY6n3G5tX9tjNRk5Mkc6Bfjg00/6SMOQPQWoqa2VXkOdJy2+4w5s3fa2bzVzL8iRYiutu+IuIueSSy/DjGlTkTfa+2WKdaUbIiolahBxP4m9Z2tyCh6nQ7fde/dIZI0elQv72WbN6sb4+MNdGDZ8OC4cO1Y6fOtwdmCwoYvHXfb+e3ht46s+soqvmAMH3e+zJIWTWltakJM7Ci+XlqoywLfdcgsiCd1itzYihcnat2e3dCFQSIElp2+CB5YuVVWPb0siec6te4Ark8VpMHDXknsQaehynqTHQM8nwiIp1Zom2Rh/8P0Y4+6l9/nybvzhDRg1YgQ+CeMu7IYb56P88JfYsm0bvty3R/omC6Pu5ElMnj4zaLtI37tpJqmVnLdp06bjELn5DnF0yuBr5ylFRVK5EqNzctB4pgFaMX3mTAplDBJBjIFI8cd5v3d7Zu3z0tdvps+Y0a+MCeJyJdgZ/OrIYWgBx1zTZ8zE7/+4GkMBmklil//B361QVZdvW63WVOmQSwvmFM/Ff97ZIfU1FKDrt2/5vq3+pLaJspq53C6fmg0F6EpSPt1QNNvUhxCymr1ETuNQgq4kjRs3Hk029arGavbvHUNHzWToStJIOkNSa49YzXootnvr7aGjZjJ0IykjPUN6uBqSZDV7+dWhpWYydCOJv8rcpFKKhqqaydDtSonvtS6gpAxR+Kwp2Jcm5l17LS6eNQsrVj6CoQbdSNq2fbuUvg2I/su7CkRJUoEoSSoQJUkFoiSpQJQkFYiSpAJRklQgSpIK+P6VC1FEEUUUUUQRRRRRRPFdgMfjWUCpEjqAnvsmpaeUeSZRUOxfOSYmpgw6gvosohc79VMF7eDf2chTPCtP+VkeO+VzvSJFuyq5P9G/1b+NyLMHGrA/dFklvz53UloFjeAF5ZWm9Ioib71y8H51lVjl13+/+dL75fxsSiX+HXtEYZ5Id4q8POgEXmWx0lrbreIJKj5XCtLkscvEFIvyPPF5vtxfqPn696E8BZBEX4gj/4fKXH5PlZeJgcipyG+AyrTTb0LFfuXLFMUsCSWKum8q6yIwQXlQqEiQsVcpCxTq3ELv7WraCFhl0pT3biWUOYdeD1FDNlxlzDC8Oq28f15J+U8LHeaHrKdUrXjwK1S2SKxkiV9bJo0HVyommyYm/5R4xiFRj1eXSbzfb2KcxxObCx1Bz2dJqqK3vFgxgS4nlStVTGkKBAmi8VN+9UsVhpLrszQtgpfAYirz/foLizgCYz6lR6nuelGP266EesxR2Bse/3og5E/czleYkwHbKEkqlQfphzwehOJzGQKLZ0gICVVTrwpeov3xKCXe/tdQnfvRd4wMeccM/rM856Dc3Vg6ff0Jo71AHoOak8kyUXmRYH4NvBI26BASy6td5FdUKlSQy7YqDLRVIS15fhsFS+5ckfwXhElOlYXGEGJQd8JrJyoVaVEQiRssHKRUJexlHwgJYiLWiCwmU94E2J4tRwjQcxeIZ3zgX+DPsrLMqtgq+9QL1E6xjSpXMdhzraH6D9JW2rIDtfX4uRaBxh5ivjs9Ch/s/xZKknR49reGpAGlNALPjuzPC34X8D826XuAzjw/wwAAAABJRU5ErkJggg=="></div><p>Oh, you’ve just lost your first fighter craft. I’m sorry! Rest in peace, little <b>Fenrir</b>!</p><p>Want to hear the good news? Your mobile hangar has <s>at least</s> two more, all fueled up and ready for action!</p><div class="first-craft-lost-message__image-wrapper"><img class="first-craft-lost-message__craft" alt="Fenrir Dominator" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG0AAABeCAYAAAApFppVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAC0NJREFUeAHtnXtwFdUdx795kufNTULeCbmxCRSwNRAeBVRCeKgzVlCnqBUotEyLTsXaGZ2xlJI69Y+OM4VCR7BTJFhRcKYjtR3/ERJaHoJpCCLISEISyCXvm4QkQBKT3J7fZvdyuLmPXb1hdy/nM/Obu3fPc893z2PPnt0NQQDJ/9thJwReqV2/OAQBIBwBpn3TKgjGkvL6uwgUoRCYDiGaCRGimRAhmgkRopkQIZoJEaKZECGaCRGimRAhmgkJ+DRWoLm280vVfjcPncY0Zxf27tuHT0+dRLBieNGSe7qQcLAScZdbffrrmZKDPz6xAImlS9Hf2YZgxvDNY2JPM/rTk/z6s3zViKhLLYj99R4EO4YXLab9Avpy01T5zfnoBK7EZyN7+c8QzBhetMHa0xjM9F/TiLD+QWQfPI6aJRsRlZSKYMXwojWXf4j++FgMR0Wq8n83NJOGH4gQk3pbcf7lpzSF6WH2wJz5OPvZCQQbphDt0f+9hRhW06oqK1WHseXl4cEfPYFXz1Xj5o2bCCZ0Ey07OwsbNzwPi8Uyxq2npwfbd70Ju/2q9L/ucgMWzp8PLTTU12PylCasX/0T7HhrF4IJ3fo0EiwmJgbVp0/j2NGjLqP/tJ/cFRqvNiI5ORlaOVJRjoKCAswsLEQwoZtoVMM+P3NGqlXDw8Muo/+0n6+BVOPi2f/ICROghcGBARwpP4w1z65CdEy0tO9cVSW6W5oko21f/Pgpbf3onSIgS7oUaAmd2tVYu7bvQPnhQ17dSxYvgd48vfJJWNMzEQhoNZZhl9BpYXh4yKf7X3e+Cb34+XPPw6joK9rQsGq/8fHxKJo9hw0upuBux9A1jeDFGmB91Af796OvrxffhLk/mIcoNsh5Y9tWVf7/e/wYjIiuMyIkmjcjiksW45lVq9Hd24NNpaWgNedhoSHMQjVbAhvItLW2ICc7G0tLSlTl770DB2BEdK5p3pvHkZERl1iOToe0r6WlGRNTUnDzpraL5cSkJCx96CF26XCVmR3R0TEwM7qINiknx6+fUFY73n7nndv22a82IXniRDQ1NUEtqWlpeODBhWjvaEdV9Rl2+WCX9k/OL2AnQ6frhDATuoh2tvIU9n/wD4SFhWkKV5CfjwvnvtAUjmpzzcWL0vb0yZOx6P77pe0htp8u2CMjRyeiG+2NGPz6a9RdqkMXu1YkcS/W1sCI6No8hoVpSz4tNRVHOzqkWqiWnmvXJFO48OX5MX4iIiJgTUxEbEwssjIyMH3qVFiWLUNcXBxaWlvx1cUaHP30mGtaTW9MIxo1Z52OToSFBz7LI04nOllTScZDYlIfmjcpB7NmvsBq5xAOlVfg2MkTuk5C6ytauPpmjqahnM4Rn01jw7O3Cn2kgw1yBmi0GYbQwRCEsq4rNiIKUa2jhxzVGgF/0GCojdU0MiKd1cKFCxZgyeLF2L1nj27Np2lqWk5WFqsJDmn47ouq330h/cbnxbr2RVojMcE62nfF5cdiQkwEIlMj4exlJ4GDXQ50RMPSFIXw675PonYmHll6ejp+uWED/rJrly7CmapPC6FrLpXNY2/9de4ft11xazMmPQrRGdGwTrXA+pgFCVVRSKuzwh/trF89zwZEq59+Bpv/8BruNDqLpm30GBoSqjmML2609EvmqO5C8oxE2B7PRuZldfF3MOFmzCyCHpjizvV4odQ0akqTCxNhrVZ/0Z3KRrJU4/TAsDMinhhhAxG1Ybz2aXl8n+ZEeCfr0zpjkPBxDCJYn8bu6vmNO41dsE+bfi927NwJPTD8hLECTUHNmzOX3RnwHabote9Jv86OETgHmCjK6LEzRBo9Rl8aHTVGt7mPHp1MLt9x0wAkN+8eRLCbsSTYXTl61CIaXRfRQGSYDcO9Ydunbn2klDZG/Pqh6zSaNstgQ/2kpGRxnUZouZ9GZ3USm7XQ2qSqgcRJsFqltSk0K5JgTYDFkoDY2Fi0yjMie99/T8yIEFpqGtHa1sbO+CS0t6l/wMLKxMjMypa2IyLZdJU1UdoeYs2sx7nHujqcvXBBzD268/3Zc/Gbl1/RLFptXS0mTkxBa0uL6jDh7Louv6BAmuU/fvKUa5afMOssvy43Qa80Nkq//Cosd6MppJ+uWYPkpFtL57IyRmdFfIVzt+bmZpQf+gQpTOyiGYVY/sNH8V12F5xqkRkFIwy7lp9m8q3xFrzOboIq4tHozdHeLo0gtVgHC/Pxvz6CvaGBTYdls5uoN2BmdBWNZje8GUFrFt9/9+8u8Wj92fDwiKaaptg1dnsmNTWN9V12fFJerip/Rl33aPi5x97eXkm8qsrPpAU+T65ciW8LrblUA617NOI6EdNMGCvikd0JxLpHL/i7n2bkgtMTXUVLYNdMfb1j1zDGxcdLvxs2vuDaR01a2du7pfX5WsjMzMKShx/Gq1s2S7MYtH4/m92bI+xsauzeotlewxp13aNuotGDFjPZrQ162KKvr8+1n9Zl3FdYKLkr0GNR9F+rYPTAxrJHHkEZG8wo006+RHJHrHt0g54/o8eZimbNGuOmPJ+mkJOVg06H9muq4kUlqKmpwWl2YgQTuolG83iv/HaTKr/35NrgcGi7d0VPgqZnZkrNYrBhipug/571C1yJTwPmaQqG2j3rg+7RXcIUopFg0984IL1yQg0NK4vZHOVQUD4kTxhetIySxzHQe121YPS6pf7vpOP6lqUIVgz/HpHI/JmIbOpU5ZfeNWJfsQAFh7YH9fuxDC/ajZSpfl9mptD42HxM6rXD/s/dCGYML1qXJQNRLf5rmqtZ/NM6BDuG79MclkQ41ixT5Vd632PpZvG+R71JeG6aar/bcXcgXodrQoRoJkSIZkKEaCZEiGZChGgmRIhmQoRoJkSIZkICPiMSyK/MCgQCgUAgEAgEAoFAIBCMC9IXGZxOJ32M5bbXr4WEhBzBOCKnSemofjqChbGxHxu36wwL340AwtKgcigMxPGzuIoxDnlUIq93uoFxhiVRwUzTl+mY/zK3bNoQYFica6k8EADkPBZjPJBF+xUVgmzF41UoXJpW+azWEqZMFlvJZ8ALRc6XDQHgToi2lvtvVRJjvytkd8UK3cLxVuEWr83N/UXO7UNm27j/W3m/XvJZxqchn1zVzJa7xTsmP56Og0vT3V+Fh7gUs/mKk8tXvSxal4/y8XnMbnG7ykrp0yhAg2yfszZ4m7x/LftZyOwyF9d9zPYyPwcpR2z7IIWR3ajmJDB7iRkdwIucG2HDaBu/TT6ABra9Ts6QVU6fj+f3zL2BO4gy9pPL9i3iD0z2R4JSc0uvBu/m45HTWMu26Xslf+aO45qcpru/LWw7jyvk/3Dx5XLHt9xT2dAxMpPiYVbG+enmypbc8jwds5z/rW7HkiuHf8l14E65j2FWyheS7FYqG9VAKvAVsrvTeXsNdTWrztG+4ba+Ud5XKm9XyIWspM+na5XzUugWvszD2Vqv5MFbfri0693ClfryJ+eRz5erSZbLw1NeeP+SX3jAT9zKto1zp1otfSSHv59GtafMQ/x0BiyUt+ksOYJbZ4cmvMTvyR+dXX4X5csCNeAb5udOI4tQrLYceKhlw2irpuomaANuFSAJSGorTYAe8AMFqqmL3IbnvLumgc63zAu/z8oN822cH2o5KM9lHsLboBKforGE18pnM99JLhrvazg/0IEr+cnj+zy2HSI3Wcq3tqjPDOjXGLm0qHlsgFvZYLQvo/TXyfkh9z3u+aF+We6j67k4lTGGzWfanKduTxeBztFhOX/Guvx5Ckf7qCCVcHyheohXagp9pe8rL57i9ubHPT/uaXrKN59H/viUcJ7KhkuXLyN4yrOv41HyA4FAIBCo5f/3vBcYM1ewZgAAAABJRU5ErkJggg=="></div><p>You’ll be dropped in with the <b>Fenrir Dominator</b> next. It looks almost the same as the Fenrir, but it’s a bit harder, better, faster, and stronger. Ain’t that neat?</p><div class="first-craft-lost-message__image-wrapper"><img class="first-craft-lost-message__craft" alt="Valkyrie" src="data:image/png;base64,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"></div><p>If you lose that one too, you’ll be in for a real treat: your third craft, the <b>Valkyrie</b>, is real fast and has <b><i>four laser cannons</i></b>! Can you imagine?</p><p>Would you rather have your first craft back? Well, you could also <b>Restart </b>the mission from the pause screen, then you’ll have your Fenrir back. How ’bout that?</p><div class="first-craft-lost-message__challenge"><p style="text-align:center"><b>Challenge:</b></p><p>Oh, that takes me back, though. You know, when I was a young’un, I once completed all four game levels in my Fenrir, <b><i>on hard mode</i></b>! Ain’t that somethin’? Don’t believe me? Well, you can open the <b>Hall of Finishers</b> and check for yourself. I got the gold plaque with “Final fighter: Fenrir” and everything!</p><p>Maybe you can try to match my record on your second playthrough? How ’bout it friend, you up for a <b><i>real</i></b> grind? Hah!</p><p>Alright, now shoo, let me get back to my book. :)</p></div></div>',
		'teal',
		onContinue,
		controlSchemesHandler,
	);
}
