import * as PIXI from '../pixi';
import { fadeHexColor } from '../utils/formulas';

export default class HUD extends PIXI.Container {
	constructor() {
		super();
		this.maxShots = 0;
		this.shotsPerLine = 8;
		this.hShotSpacing = 18;
		this.vShotSpacing = 6;
		this.currentLine = 1;
		this.needsLastLineShift = false;
		this.tints = {
			available: 0xffffff,
			spent: 0x606060,
			onCooldown: 0xff0000,
		};
		this.cooldownColor = 0x000000;
		this.cooldownTriggered = false;

		this.sprites = {};
		this.startX = 1008;
		this.startY = 12;
		this.currentX = 0;
		this.currentY = 0;
		this.zIndex = 10000;
	}

	init(maxShots) {
		this.maxShots = maxShots;
		if (maxShots % this.shotsPerLine !== 0) this.needsLastLineShift = true;
		if (Math.ceil(maxShots / this.shotsPerLine) === 4) this.startY = 14; // Valkyrie
		if (Math.ceil(maxShots / this.shotsPerLine) === 3) this.startY = 18; // Fenrir

		this.currentX = this.startX;
		this.currentY = this.startY;

		for (let i = 0; i < this.maxShots; i++) {
			const spriteId = `sr_${i}`;
			this.sprites[spriteId] = new PIXI.Graphics();

			this.sprites[spriteId].lineStyle(0);
			this.sprites[spriteId].beginFill(0xffffff);
			this.sprites[spriteId].drawRect(this.currentX, this.currentY, 6, 1);
			this.sprites[spriteId].endFill();

			this.sprites[spriteId].tint = this.tints.available;
			this.sprites[spriteId].zIndex = this.zIndex;

			// positioning the next shot readout
			this.currentX = this.currentX + this.hShotSpacing;
			if (i > 0 && (i + 1) % 8 === 0) {
				this.currentY = this.currentY + this.vShotSpacing;
				this.currentX = this.startX;
				this.currentLine = this.currentLine + 1;

				if (
					this.needsLastLineShift &&
					this.currentLine === Math.ceil(this.maxShots / this.shotsPerLine)
				) {
					const shiftBy =
						((this.maxShots % this.shotsPerLine) * this.hShotSpacing) / 2;
					this.currentX = this.startX + shiftBy;
				}
			}

			this.addChild(this.sprites[spriteId]);
			this.zIndex = this.zIndex + 1;
		}
	}

	update(remainingShots, onCooldown = false) {
		if (!onCooldown) this.cooldownTriggered = false;

		for (let i = 0; i < this.maxShots; i++) {
			const spriteId = `sr_${i}`;
			let newColor = this.tints.available;

			if (onCooldown) {
				if (!this.cooldownTriggered) {
					this.cooldownColor = this.tints.onCooldown;
					this.cooldownTriggered = true;
				} else {
					this.cooldownColor = fadeHexColor(this.cooldownColor, 0x1, 'to gray');
				}
				newColor = this.cooldownColor;
			} else {
				if (i > remainingShots) {
					newColor = this.tints.spent;
				}
			}

			this.sprites[spriteId].tint = newColor;
		}
	}
}
