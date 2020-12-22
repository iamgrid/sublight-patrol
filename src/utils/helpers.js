import * as PIXI from '../pixi';
import c from './constants';
import { fadeHexColor, easing } from './formulas';
import timing from './timing';
import entities from '../entities/entities';
import soundEffects from '../audio/soundEffects';

export function isEmptyObject(obj) {
	return Object.keys(obj).length < 1;
}

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

export function repositionMovedEntities(
	movedEntities,
	stageEntities,
	canMoveStore,
	playerId
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
			console.error(`Couldn't find ${entityId}, it probably blew up.`);
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

	const stepValue = 10;

	const currentAlpha = this.sprites['emp_bubble'].alpha * 1000;

	if (!this.empIsToggled && currentAlpha === 0) return;

	let newAlpha = currentAlpha;
	if (this.empIsToggled) {
		if (this.empUpswing === undefined) this.empUpswing = true;

		if (currentAlpha < 50) {
			this.empUpswing = true;
		} else if (currentAlpha > 100) {
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

	this.sprites['emp_bubble'].alpha = newAlpha / 1000;
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
			timing.modes.play,
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
			timing.modes.play,
			400
		);
	}
}

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
		alertsAndWarnings.update();
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
