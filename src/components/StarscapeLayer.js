import * as PIXI from '../pixi';

export default class StarScapeLayer extends PIXI.Graphics {
	constructor(props) {
		super();
		this.noOfStars = props.noOfStars;
		this.speedMultiplier = props.speedMultiplier;

		this.lineStyle(0);

		for (let i = 0; i < this.noOfStars; i++) {
			this.beginFill(0xffffff, 1);
			this.drawCircle(
				Math.ceil(Math.random() * 4000),
				Math.ceil(Math.random() * 2000),
				(Math.random() * 1.5).toPrecision(2)
			);
			this.endFill();
		}
	}

	/*onResize(width) {
		this.width = width;
	}*/

	onUpdate(delta) {
		let newPos = this.position.x - delta * this.speedMultiplier;
		if (newPos < 0 - window.innerWidth) newPos = 0;
		this.position.x = newPos;
	}
}
