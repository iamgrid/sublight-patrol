import * as PIXI from '../pixi';
import { fadeHexColor } from '../utils/formulas';

export default class HUD extends PIXI.Container {
	constructor() {
		super();
		this.maxShots = 0;
		this.shotsPerLine = 8;
		this.hShotSpacing = 16;
		this.vShotSpacing = 8;
		this.currentLine = 1;
		this.needsLastLineShift = false;
		this.tints = {
			available: 0x00ff00,
			spent: 0x00a000,
			onCooldown: 0xff7070,
		};
		this.cooldownColor = 0x000000;
		this.cooldownTriggered = false;
		// 0x00ff00

		this.sprites = {};
		this.startX = 1015;
		this.startY = 12;
		this.currentX = this.startX;
		this.currentY = this.startY;

		// free hud space: 279 * 49
	}
	init(maxShots) {
		this.maxShots = maxShots;
		if (maxShots % this.shotsPerLine !== 0) this.needsLastLineShift = true;

		for (let i = 0; i < this.maxShots; i++) {
			const spriteId = `sr_${i}`;
			this.sprites[spriteId] = new PIXI.Graphics();

			this.sprites[spriteId].lineStyle(0);
			this.sprites[spriteId].beginFill(0xffffff);
			this.sprites[spriteId].drawRect(this.currentX, this.currentY, 2, 2);
			this.sprites[spriteId].endFill();

			this.sprites[spriteId].tint = this.tints.available;

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
						(this.maxShots % this.shotsPerLine) * this.hShotSpacing;
					this.currentX = this.startX + shiftBy;
				}
			}

			this.addChild(this.sprites[spriteId]);
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
					this.cooldownColor = fadeHexColor(this.cooldownColor, 0x8);
				}
				console.log(newColor.toString(16));
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
