import * as PIXI from '../pixi';
import c from '../utils/constants';
import { randomNumber } from '../utils/formulas';

export default class StarScapeLayer extends PIXI.Graphics {
	constructor(props) {
		super();
		this.noOfStars = props.noOfStars;
		this.speedMultiplier = props.speedMultiplier;

		this.lineStyle(0);

		for (let i = 0; i < this.noOfStars; i++) {
			const x = randomNumber(0, c.gameCanvas.width);
			const y = randomNumber(0, c.gameCanvas.height);
			const size = randomNumber(0.4, 1.4, 2);
			this.beginFill(0xffffff, 1);
			this.drawCircle(x, y, size);
			this.endFill();
			this.beginFill(0xffffff, 1);
			this.drawCircle(x + c.gameCanvas.width, y, size);
			this.endFill();
		}
	}

	onUpdate(delta) {
		// console.log(delta);
		let newPos = this.position.x - (this.speedMultiplier * 2 + delta);
		if (newPos < 0 - c.gameCanvas.width) {
			newPos += c.gameCanvas.width;
			// console.log('resetting layer');
		}
		this.position.x = newPos;
	}
}
