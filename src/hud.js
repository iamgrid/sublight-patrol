import c from './utils/constants';
import { getPosition } from './utils/helpers';
import { calculateAngle, calculateDistance } from './utils/formulas';
import Pointer from './components/Pointer';

const hud = {
	handlers: { pixiHUD: null, cannonStates: null, camera: null }, // gets its values in App.js
	pixiHUDInitiated: false,
	pixiHUDFader: 0,
	pixiHUDFaderInterval: null,
	cannonCooldownStraggler: 0,
	currentPlayerCoords: '',
	currentLives: 0,
	currentShots: 0,
	currentDisplay: {},
	maximums: {},
	stagePointers: {},
	currentPointerTints: {},
	currentCameraCoords: [],
	currentPointerCoords: {},
	pointerZIndexIterator: 0,
	largestRelevantDistance: 0,
	edgeAngles: null,
	targetBlinker: 0,

	toggle(show = false) {
		const hudDiv = document.getElementById('game__hud');
		if (show) {
			hudDiv.classList.add('game__hud--visible');
			window.setTimeout(() => {
				hud.fadePixiHUD(true);
			}, 1000);
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

	update(targeting, lives, allEntities, positions) {
		// player lives
		const heartEmoji = '&#10084;';
		if (lives !== hud.currentLives) {
			let newStr = [];
			for (let i = 0; i < c.maxLives; i++) {
				let add = `<span class='game__hud-lives-life--spent'>${heartEmoji}</span>`;
				if (lives > i) {
					add = `<span class='game__hud-lives-life--available'>${heartEmoji}</span>`;
				}
				newStr.push(add);
			}

			document.getElementById('game__hud-lives').innerHTML = newStr.join('');

			hud.currentLives = lives;
		}

		// off-screen entity pointers
		const playerId = allEntities.player.id;
		const [playerX, playerY] = getPosition(playerId, positions);
		hud.updatePointers(targeting, allEntities, positions, playerX, playerY);

		// player coords
		const playerCoordsDisp = `${Math.trunc(playerX)} , ${Math.trunc(playerY)}`;

		if (hud.currentPlayerCoords !== playerCoordsDisp) {
			document.getElementById(
				'game__hud-coords'
			).innerHTML = `[ ${playerCoordsDisp} ]`;
			hud.currentPlayerCoords = playerCoordsDisp;
		}

		// player shots
		if (hud.handlers.cannonStates[playerId] !== undefined) {
			// will start showing when the player starts using her cannons
			if (!hud.pixiHUDInitiated) {
				hud.handlers.pixiHUD.init(hud.handlers.cannonStates[playerId].maxShots);
				hud.pixiHUDInitiated = true;
			}

			const playerShots = hud.handlers.cannonStates[playerId].remainingShots;
			const onCooldown = hud.handlers.cannonStates[playerId].onCooldown;

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

	updatePointers(targeting, allEntities, positions, playerX, playerY) {
		const tints = {
			targeted: 0xffffff,
			friendly: 0x37d837,
			neutral: 0xe6b632,
			hostile: 0xe63232,
		};

		if (hud.largestRelevantDistance === 0)
			hud.largestRelevantDistance =
				Math.abs(c.playVolume.minX) + c.playVolume.maxX;

		const incomingShift = hud.handlers.camera.currentShift;
		const cameraTLX = Math.round(playerX - Math.round(incomingShift));

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

		allEntities.targetable.forEach((entity) => {
			const entityId = entity.id;
			const playerRelation = entity.playerRelation;
			const [posX, posY] = getPosition(entityId, positions);

			// if we see any new entities create a pointer for them
			if (hud.stagePointers[entityId] === undefined) {
				hud.stagePointers[entityId] = new Pointer();
				hud.stagePointers[entityId].tint = tints[playerRelation];
				hud.stagePointers[entityId].zIndex = hud.pointerZIndexIterator;
				hud.stagePointers[entityId].position.set(600, 225);
				hud.handlers.pixiHUD.addChild(hud.stagePointers[entityId]);

				let pt = tints[playerRelation];
				if (targeting === entityId) pt = tints.targeted;
				hud.currentPointerTints[entityId] = pt;
				hud.currentPointerCoords[entityId] = [posX, posY];

				// iterate zindex
				hud.pointerZIndexIterator = hud.pointerZIndexIterator + 1;
			}

			const stagePointer = hud.stagePointers[entityId];

			// hide pointers for entities currently on the screen
			if (
				posX >= cameraTLX &&
				posX <= cameraBRX &&
				posY >= cameraTLY &&
				posY <= cameraBRY
			) {
				stagePointer.alpha = 0;
				return;
			}

			let entityHasMoved = false;
			if (
				posX !== hud.currentPointerCoords[entityId][0] ||
				posY !== hud.currentPointerCoords[entityId][1]
			) {
				entityHasMoved = true;
			}

			if (cameraHasMoved || entityHasMoved) {
				const entityDistance = calculateDistance(
					cameraCX,
					cameraCY,
					posX,
					posY
				);

				// change pointer alpha based on entity distance
				stagePointer.alpha = Math.max(
					0.3,
					(1 - entityDistance / hud.largestRelevantDistance) / 1.2
				);

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
			}

			// change pointer tint
			let newPointerTint = tints[playerRelation];
			if (entityId === targeting && hud.targetBlinker > 15)
				newPointerTint = tints.targeted;

			if (newPointerTint !== hud.currentPointerTints[entityId]) {
				stagePointer.tint = newPointerTint;
				hud.currentPointerTints[entityId] = newPointerTint;
			}
		});

		hud.targetBlinker = hud.targetBlinker + 1;
		if (hud.targetBlinker >= 30) hud.targetBlinker = 0;
	},
};

export default hud;
