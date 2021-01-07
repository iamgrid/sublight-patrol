import c from './utils/constants';
import timing from './utils/timing';
import { getPosition } from './utils/helpers';
import { calculateAngle, calculateDistance } from './utils/formulas';
import Pointer from './components/Pointer';
import HealthBars from './components/HealthBars';
import shots from './shots';

const hud = {
	handlers: { pixiHUD: null, stage: null, camera: null, playVolume: null }, // gets its values in App.js
	hudIsShowing: false,
	pixiHUDInitiated: false,
	pixiHUDFader: 0,
	pixiHUDFaderInterval: null,
	cannonCooldownStraggler: 0,
	currentPlayerCoords: '',
	currentUnlockedPlayerShips: -1,
	currentSpentPlayerShips: -1,
	currentShots: 0,
	currentDisplay: {},
	maximums: {},
	stagePointers: {},
	currentPointerTints: {},
	currentCameraCoords: [],
	currentPointerCoords: {},
	pointerZIndexIterator: 0,
	stageHealthBars: {},
	healthBarZIndexIterator: c.zIndices.healthBars,
	largestRelevantDistance: 0,
	healthBarsYOffset: -50,
	edgeAngles: null,
	targetBlinker: 0,

	toggle(show = false) {
		hud.hudIsShowing = show;
		document.getElementById('game__hud').style.opacity = 1;
		const hudDiv = document.getElementById('game__hud');
		if (show) {
			hudDiv.classList.add('game__hud--visible');
			timing.setTimeout(
				() => {
					hud.fadePixiHUD(true);
				},
				timing.modes.play,
				1000
			);
		} else {
			hudDiv.classList.remove('game__hud--visible');
			hud.fadePixiHUD(false);
		}
	},

	fadePixiHUD(show) {
		hud.pixiHUDFaderInterval = window.setInterval(() => {
			if (show) {
				hud.pixiHUDFader = hud.pixiHUDFader + 0.05;
				if (hud.pixiHUDFader > 1)
					window.clearInterval(hud.pixiHUDFaderInterval);
			} else {
				hud.pixiHUDFader = hud.pixiHUDFader - 0.05;
				if (hud.pixiHUDFader < 0)
					window.clearInterval(hud.pixiHUDFaderInterval);
			}
			hud.handlers.pixiHUD.alpha = hud.pixiHUDFader;
		}, 30);
	},

	removeAtOnce() {
		document.getElementById('game__hud').style.opacity = 0;
		document.getElementById('game__hud').classList.remove('game__hud--visible');
		hud.handlers.pixiHUD.alpha = 0;
		hud.hudIsShowing = false;

	},

	update(targeting, playerShips, allEntities, positions, playerId) {
		// player ships
		const heartEmoji = '&#10084;';
		if (
			playerShips.unlocked !== hud.currentUnlockedPlayerShips ||
			playerShips.spent !== hud.currentSpentPlayerShips
		) {
			const remaining = playerShips.unlocked - playerShips.spent;
			let newStr = [];
			for (let i = 0; i < playerShips.unlocked; i++) {
				let add = `<span class='game__hud-lives-life--spent'>${heartEmoji}</span>`;
				if (remaining > i) {
					add = `<span class='game__hud-lives-life--available'>${heartEmoji}</span>`;
				}
				newStr.push(add);
			}

			document.getElementById('game__hud-lives').innerHTML = newStr.join('');

			hud.currentUnlockedPlayerShips = playerShips.unlocked;
			hud.currentSpentPlayerShips = playerShips.spent;

			if (remaining < 1) {
				// GAME OVER
			}
		}

		// off-screen entity pointers
		const [playerX, playerY] = getPosition(playerId, positions);
		hud.updatePointersAndHealthBars(
			targeting,
			allEntities,
			positions,
			playerX,
			playerY,
			playerId
		);

		// player coords
		const playerCoordsDisp = `${Math.trunc(playerX)} , ${Math.trunc(playerY)}`;

		if (hud.currentPlayerCoords !== playerCoordsDisp) {
			document.getElementById(
				'game__hud-coords'
			).innerHTML = `[ ${playerCoordsDisp} ]`;
			hud.currentPlayerCoords = playerCoordsDisp;
		}

		// player shots
		if (shots.cannonStates[playerId] !== undefined) {
			// will start showing when the player starts using her cannons
			if (!hud.pixiHUDInitiated) {
				hud.handlers.pixiHUD.init(shots.cannonStates[playerId].maxShots);
				hud.pixiHUDInitiated = true;
			}

			const playerShots = shots.cannonStates[playerId].remainingShots;
			const onCooldown = shots.cannonStates[playerId].onCooldown;

			if (onCooldown) {
				hud.cannonCooldownStraggler = hud.cannonCooldownStraggler + 1;
				if (hud.cannonCooldownStraggler > 3) {
					hud.handlers.pixiHUD.update(playerShots, true);
					hud.cannonCooldownStraggler = 0;
				}
			}

			if (playerShots !== hud.currentShots) {
				hud.handlers.pixiHUD.update(playerShots, false);
				hud.currentShots = playerShots;
			}
		}

		// player / target state
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
		re[entityName + 'ContentClassification'] = entity.contentClassification;

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

					for (const cls in c.entityContentClassifications) {
						targetContentsDivClasses.remove(
							`game__hud-contents-text--${c.entityContentClassifications[cls]}`
						);
					}

					if (
						completeDisplayObj.targetExists &&
						!completeDisplayObj.targetHasBeenScanned
					) {
						contentsDisp = '- unknown -';
						targetContentsDivClasses.add('game__hud-contents-text--unknown');
					} else {
						targetContentsDivClasses.remove('game__hud-contents-text--unknown');
						const contentClassification =
							completeDisplayObj[`${entity}ContentClassification`];
						targetContentsDivClasses.add(
							`game__hud-contents-text--${contentClassification}`
						);
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
					hud.updateMeter(entity, 'System', 0);
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

	updatePointersAndHealthBars(
		targeting,
		allEntities,
		positions,
		playerX,
		playerY,
		playerId
	) {
		const tints = {
			targeted: 0xffffff,
			friendly: 0x37d837,
			neutral: 0xe6b632,
			hostile: 0xe63232,
		};

		if (hud.largestRelevantDistance === 0)
			hud.largestRelevantDistance =
				Math.abs(hud.handlers.playVolume.current.minX) +
				hud.handlers.playVolume.current.maxX;

		const cameraTLX = Math.round(playerX - hud.handlers.camera.currentShift);

		const cameraTLY = Math.round(playerY - 225);
		const cameraBRX = cameraTLX + c.gameCanvas.width;
		const cameraBRY = cameraTLY + c.gameCanvas.height;
		const cameraCX = cameraTLX + c.gameCanvas.width / 2;
		const cameraCY = cameraTLY + c.gameCanvas.height / 2;

		if (hud.edgeAngles === null || hud.handlers.camera.isFlipping) {
			hud.edgeAngles = {
				rt: calculateAngle(cameraCX, cameraCY, cameraBRX, cameraTLY),
				rb: calculateAngle(cameraCX, cameraCY, cameraBRX, cameraBRY),
				lb: calculateAngle(cameraCX, cameraCY, cameraTLX, cameraBRY),
				lt: calculateAngle(cameraCX, cameraCY, cameraTLX, cameraTLY),
			};
		}

		let cameraHasMoved = false;

		if (
			cameraCX !== hud.currentCameraCoords[0] ||
			cameraCY !== hud.currentCameraCoords[1]
		) {
			cameraHasMoved = true;
			hud.currentCameraCoords = [cameraCX, cameraCY];
		}

		const relevantEntities = [allEntities.player, ...allEntities.targetable];

		relevantEntities.forEach((entity) => {
			const entityId = entity.id;
			const playerRelation = entity.playerRelation;
			const [posX, posY] = getPosition(entityId, positions);

			// if we see any new entities create a pointer for them
			if (hud.stagePointers[entityId] === undefined) {
				if (entityId !== playerId) {
					hud.stagePointers[entityId] = new Pointer();
					hud.stagePointers[entityId].tint = tints[playerRelation];
					hud.stagePointers[entityId].zIndex = hud.pointerZIndexIterator;
					hud.stagePointers[entityId].alpha = 0;
					hud.stagePointers[entityId].position.set(600, 225);
					hud.handlers.pixiHUD.addChild(hud.stagePointers[entityId]);

					let pt = tints[playerRelation];
					if (targeting === entityId) pt = tints.targeted;
					hud.currentPointerTints[entityId] = pt;

					// iterate zindices
					hud.pointerZIndexIterator++;
				}
				hud.currentPointerCoords[entityId] = [posX, posY];
			}

			// if we see any new entities create health bars for them
			if (hud.stageHealthBars[entityId] === undefined) {
				hud.stageHealthBars[entityId] = new HealthBars({
					entityId,
					hasShields: entity.immutable.hasShields,
				});
				hud.stageHealthBars[entityId].position.set(
					posX,
					posY + hud.healthBarsYOffset
				);
				hud.stageHealthBars[entityId].zIndex = hud.healthBarZIndexIterator;
				hud.handlers.stage.addChild(hud.stageHealthBars[entityId]);

				// iterate zindices
				hud.healthBarZIndexIterator++;
			}

			const stagePointer = hud.stagePointers[entityId];

			// hide pointers for entities currently on the screen
			let pointerIsHidden = false;
			if (
				entityId !== playerId &&
				posX >= cameraTLX &&
				posX <= cameraBRX &&
				posY >= cameraTLY &&
				posY <= cameraBRY
			) {
				stagePointer.alpha = 0;
				// return;
				pointerIsHidden = true;
			}

			let entityHasMoved = false;
			if (
				posX !== hud.currentPointerCoords[entityId][0] ||
				posY !== hud.currentPointerCoords[entityId][1]
			) {
				entityHasMoved = true;
			}

			// move healthbars
			if (cameraHasMoved || entityHasMoved) {
				hud.stageHealthBars[entityId].position.set(
					posX,
					posY + hud.healthBarsYOffset
				);
			}

			// update healtbars
			const isDamaged = entity.isDamaged;
			const isDisabled = entity.isDisabled;
			if (!isDamaged) {
				hud.stageHealthBars[entityId].update({}, isDisabled, false);
			} else {
				const shieldPrc = Math.trunc(
					(entity.shieldStrength / entity.immutable.maxShieldStrength) * 100
				);
				const hullPrc = Math.trunc(
					(entity.hullStrength / entity.immutable.maxHullStrength) * 100
				);
				const sysPrc = Math.trunc(
					(entity.systemStrength / entity.immutable.maxSystemStrength) * 100
				);

				hud.stageHealthBars[entityId].update(
					{
						shields: shieldPrc,
						hull: hullPrc,
						sys: sysPrc,
					},
					isDisabled,
					true
				);
			}

			// move pointer
			if (
				entityId !== playerId &&
				!pointerIsHidden &&
				(cameraHasMoved || entityHasMoved)
			) {
				const pointerAngle = calculateAngle(cameraCX, cameraCY, posX, posY);

				// change pointer rotation
				stagePointer.rotation = pointerAngle;

				// reposition the pointer
				let newPointerX, newPointerY, missingCoord;
				if (
					pointerAngle > hud.edgeAngles.lt &&
					pointerAngle < hud.edgeAngles.rt
				) {
					// top edge of the screen
					newPointerY = 50;
					missingCoord = 'x';
				} else if (
					pointerAngle <= hud.edgeAngles.lt &&
					pointerAngle > hud.edgeAngles.lb
				) {
					// left edge of the screen
					newPointerX = 0;
					missingCoord = 'y';
				} else if (
					pointerAngle <= hud.edgeAngles.lb &&
					pointerAngle > hud.edgeAngles.rb
				) {
					// bottom edge of the screen
					newPointerY = c.gameCanvas.height;
					missingCoord = 'x';
				} else {
					// right edge of the screen
					newPointerX = c.gameCanvas.width;
					missingCoord = 'y';
				}

				if (missingCoord === 'x') {
					newPointerX =
						Math.round(Math.sin(pointerAngle) * (c.gameCanvas.height / 2)) +
						c.gameCanvas.width / 2;
				} else if (missingCoord === 'y') {
					newPointerY =
						c.gameCanvas.height / 2 -
						Math.round(Math.cos(pointerAngle) * (c.gameCanvas.width / 2));
				}

				stagePointer.position.set(newPointerX, newPointerY);

				// change pointer alpha based on entity distance
				const entityDistance = calculateDistance(
					cameraCX,
					cameraCY,
					posX,
					posY
				);

				stagePointer.alpha = Math.max(
					0.3,
					(1 - entityDistance / hud.largestRelevantDistance) / 1.2
				);
			}

			// change pointer tint
			if (entityId !== playerId) {
				let newPointerTint = tints[playerRelation];
				if (entityId === targeting && hud.targetBlinker > 15)
					newPointerTint = tints.targeted;

				if (newPointerTint !== hud.currentPointerTints[entityId]) {
					stagePointer.tint = newPointerTint;
					hud.currentPointerTints[entityId] = newPointerTint;
				}
			}
		});

		// console.log(hud.stageHealthBars);

		hud.targetBlinker = hud.targetBlinker + 1;
		if (hud.targetBlinker >= 30) hud.targetBlinker = 0;
	},

	removeEntity(entityId, deleteFromHUDState = true) {
		if (hud.stageHealthBars[entityId] !== undefined) {
			hud.handlers.stage.removeChild(hud.stageHealthBars[entityId]);
			if (deleteFromHUDState) delete hud.stageHealthBars[entityId];
		}

		if (hud.stagePointers[entityId] !== undefined) {
			hud.handlers.pixiHUD.removeChild(hud.stagePointers[entityId]);
			if (deleteFromHUDState) delete hud.stagePointers[entityId];
		}
	},

	reInitPixiHUD(playerId) {
		// console.log('reInitPixiHUD called with:', playerId);
		hud.pixiHUDInitiated = false;
		const playerShots = shots.cannonStates[playerId].remainingShots;
		hud.handlers.pixiHUD.update(playerShots, false);
	},

	cleanUp() {
		for (const entityId in hud.stageHealthBars) {
			hud.removeEntity(entityId, false);
		}

		hud.pixiHUDInitiated = false;
		hud.pixiHUDFader = 0;
		hud.pixiHUDFaderInterval = null;
		hud.cannonCooldownStraggler = 0;
		hud.currentPlayerCoords = '';
		hud.currentShots = 0;
		hud.currentDisplay = {};
		hud.maximums = {};
		hud.stagePointers = {};
		hud.currentPointerTints = {};
		hud.currentCameraCoords = [];
		hud.currentPointerCoords = {};
		hud.pointerZIndexIterator = 0;
		hud.stageHealthBars = {};
		hud.healthBarZIndexIterator = c.zIndices.healthBars;
		hud.largestRelevantDistance = 0;
		hud.edgeAngles = null;
		hud.targetBlinker = 0;
	},
};

export default hud;
