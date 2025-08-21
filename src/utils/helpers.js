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
	playerFacing
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
	playVolume
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
								entities.stageEntities[entityId].alpha - 0.02
							);
						} else {
							entities.despawn(entityId);
						}
					},
					timing.modes.play,
					30,
					true,
					55,
					30
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
			(entity) => entity.id === entityId
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
			this.current.softBoundary
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
			this.addChild(thruster)
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
	newLongVelocity
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
						soundEffects.library.main_thruster.id
					);
				} else {
					soundEffects.startLoop(
						this.entityId,
						soundEffects.library.side_thruster.id,
						nozzleOrientation
					);
				}
			} else {
				this.thrusterAlphas.required[nozzleOrientation] = 0;

				// stop audio loop on this emitter
				if (nozzleOrientation === 'main') {
					soundEffects.stopLoop(
						this.entityId,
						soundEffects.library.main_thruster.id
					);
				} else {
					soundEffects.stopLoop(
						this.entityId,
						soundEffects.library.side_thruster.id,
						nozzleOrientation
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
			(el) => el.id !== entityId
		);
	},

	init() {
		shields.shieldRegenInterval = window.setInterval(
			shields.shieldRegenTick,
			1000
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
			'game__messagelayer-message-queue-readout'
		).innerHTML = `${queueIndex + 1} / ${messageLayer.queuedMessages.length}`;
		document.getElementById('game__messagelayer-speaker').innerHTML =
			speaker + ' :';
		document.getElementById(
			'game__messagelayer-where-and-when'
		).innerHTML = `(${whereAndWhen})`;
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
				timing.times.play
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
			(el) => !el.messageWasShown
		);
		if (nextMessageIndex !== -1) {
			// Show the next queued message
			timing.setTimeout(
				() => {
					messageLayer._showMessage(nextMessageIndex);
				},
				timing.modes.play,
				800
			);
		} else {
			timing.toggleEntityMovement(true, functionSignature);
		}
		// }
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
				1000
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
				`game__alertsAndWarnings-${messageType}`
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
				`<span class='time'>${at}&nbsp;</span> <span class='${color}'>${text}</span>`
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

	toggleStatusExpansion(event, mode) {
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

	init() {
		document.getElementById('game__log').onclick =
			gameLog.toggleStatusExpansion.bind(gameLog);
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
			`bestSceneId is null, returning early.`
		);
		return;
	}

	const currentState = state();
	const statePlayerShips = currentState.game.playerShips;
	const playerProgress = {
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
				`${functionSignature} - Parsed player progress is not an object.`
			);
			playerProgressIsValid = false;
		}

		if (!validate && playerProgressIsValid) {
			return parsedPlayerProgress;
		}

		if (
			!('bestSceneId' in parsedPlayerProgress) ||
			!('playerShips' in parsedPlayerProgress) ||
			!('dataTS' in parsedPlayerProgress) ||
			!('playerHasCompletedTheGame' in parsedPlayerProgress)
		) {
			console.error(
				`${functionSignature} - Parsed player progress does not contain the required keys.`
			);
			playerProgressIsValid = false;
		}

		if (typeof parsedPlayerProgress.playerHasCompletedTheGame !== 'boolean') {
			console.error(
				`${functionSignature} - playerHasCompletedTheGame is not a boolean.`
			);
			playerProgressIsValid = false;
		}

		if (typeof parsedPlayerProgress.dataTS !== 'number') {
			console.error(`${functionSignature} - dataTS is not a number.`);
			playerProgressIsValid = false;
		}

		const latestLocalStorageVersionDateObj = new Date(
			c.latestLocalStorageVersionDate
		);
		const dataTSDateObj = new Date(parsedPlayerProgress.dataTS);
		console.log(
			functionSignature,
			'dataTS value:',
			dataTSDateObj.toUTCString(),
			'latestLocalStorageVersionDate:',
			latestLocalStorageVersionDateObj.toUTCString()
		);

		if (dataTSDateObj < latestLocalStorageVersionDateObj) {
			console.error(
				`${functionSignature} - dataTS is older than the latest local storage version date.`
			);
			playerProgressIsValid = false;

			alert(
				"According to your browser's storage, you have played Sublight Patrol before, but your progress can not be taken into account as it happened in an outdated version of the game. I apologize for making you start over!"
			);
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
				`${functionSignature} - bestSceneId is not a valid scene ID.`
			);
			playerProgressIsValid = false;
		}

		if (!(parsedPlayerProgress.playerShips instanceof Object)) {
			console.error(`${functionSignature} - playerShips is not an object.`);
			playerProgressIsValid = false;
		}

		if (typeof parsedPlayerProgress.playerShips.hangarBerths !== 'number') {
			console.error(
				`${functionSignature} - playerShips.hangarBerths is not a number.`
			);
			playerProgressIsValid = false;
		}

		if (
			typeof parsedPlayerProgress.playerShips.currentIdSuffix !== 'string' ||
			parsedPlayerProgress.playerShips.currentIdSuffix.length !== 1
		) {
			console.error(
				`${functionSignature} - playerShips.currentIdSuffix is not a valid string.`
			);
			playerProgressIsValid = false;
		}

		if (
			typeof parsedPlayerProgress.playerShips.current !== 'string' ||
			!Object.keys(c.playableFighterTypeIds).includes(
				parsedPlayerProgress.playerShips.current
			)
		) {
			console.error(
				`${functionSignature} - playerShips.current is not a valid fighter type ID.`
			);
			playerProgressIsValid = false;
		}

		if (!Array.isArray(parsedPlayerProgress.playerShips.hangarContents)) {
			console.error(
				`${functionSignature} - playerShips.hangarContents is not an array.`
			);
			playerProgressIsValid = false;
		}

		for (const ship of parsedPlayerProgress.playerShips.hangarContents) {
			if (
				typeof ship !== 'string' ||
				!Object.keys(c.playableFighterTypeIds).includes(ship)
			) {
				console.error(
					`${functionSignature} - playerShips.hangarContents contains an invalid fighter type ID: ${ship}`
				);
				playerProgressIsValid = false;
			}
		}

		if (!playerProgressIsValid) {
			console.error(
				`${functionSignature} - Local storage player progress is invalid our out of date, alerting player and returning null.`
			);

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
		''
	);
}
