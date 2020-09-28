import * as PIXI from '../pixi';
import c from '../utils/constants';

export default class StarScapeLayer extends PIXI.Graphics {
	constructor(props) {
		super();
		this.noOfStars = props.noOfStars;
		this.speedMultiplier = props.speedMultiplier;

		this.lineStyle(0);

		for (let i = 0; i < this.noOfStars; i++) {
			const x = Math.ceil(Math.random() * c.gameCanvas.width);
			const y = Math.ceil(Math.random() * c.gameCanvas.height);
			const size = (0.4 + Math.random() * 1.3).toPrecision(2);
			this.beginFill(0xffffff, 1);
			this.drawCircle(x, y, size);
			this.endFill();
			this.beginFill(0xffffff, 1);
			this.drawCircle(x + c.gameCanvas.width, y, size);
			this.endFill();
		}
	}

	onUpdate(delta) {
		let newPos = this.position.x - delta * this.speedMultiplier;
		if (newPos < 0 - c.gameCanvas.width) {
			newPos += c.gameCanvas.width;
			// console.log('resetting layer');
		}
		this.position.x = newPos;
	}
}
