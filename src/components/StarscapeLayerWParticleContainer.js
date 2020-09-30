import * as PIXI from '../pixi';
import c from '../utils/constants';
import { randomNumber } from '../utils/formulas';

export default class StarScapeLayer extends PIXI.ParticleContainer {
	constructor(props, starTexture) {
		super();
		this.noOfStars = props.noOfStars;
		this.speedMultiplier = props.speedMultiplier;

		for (let i = 0; i < this.noOfStars; i++) {
			const x = randomNumber(0, c.gameCanvas.width);
			const y = randomNumber(0, c.gameCanvas.height);
			const size = randomNumber(0.4, 1.4, 2);

			// let sprite1 = PIXI.Sprite.from(starTexture);
			// let sprite2 = PIXI.Sprite.from(starTexture);
			let sprite1 = PIXI.Sprite.from('single_star');
			let sprite2 = PIXI.Sprite.from('single_star');
			sprite1.position.set(x, y);
			sprite2.position.set(x + c.gameCanvas.width, y);
			sprite1.scale.set(size / 2);
			sprite2.scale.set(size / 2);
			this.addChild(sprite1);
			this.addChild(sprite2);
		}
	}

	onUpdate(delta) {
		// let newPos = this.position.x - (this.speedMultiplier * 2 + delta);
		let newPos = this.position.x - this.speedMultiplier * 3 * delta;
		if (newPos < 0 - c.gameCanvas.width) {
			// console.log('repositioning...', newPos, newPos + c.gameCanvas.width);
			newPos += c.gameCanvas.width;
		}
		this.position.x = newPos;
	}
}
