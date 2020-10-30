import * as PIXI from '../pixi';
import c from '../utils/constants';
import { randomNumber } from '../utils/formulas';

export default class StarScapeLayer extends PIXI.Graphics {
	constructor(props) {
		super();
		this.noOfStars = props.noOfStars;
		this.speedMultiplier = props.speedMultiplier;
		this.starScapeToPlayerDivider = 50;
		this.widthWTolerance = c.gameCanvas.width + 100;
		this.heightWTolerance = c.gameCanvas.height + 100;

		this.lineStyle(0);

		for (let i = 0; i < this.noOfStars; i++) {
			const x = randomNumber(0, this.widthWTolerance);
			const y = randomNumber(0, this.heightWTolerance);
			const size = randomNumber(0.4, 1.7, 2);
			this.beginFill(0xffffff, 1);
			this.drawCircle(x, y, size);
			this.endFill();
			this.beginFill(0xffffff, 1);
			this.drawCircle(x + c.gameCanvas.width, y, size);
			this.endFill();
		}

		this.lineStyle(1, 0x0000ff);
		this.beginFill(0x0, 0);
		this.drawRect(0, 0, this.widthWTolerance, this.heightWTolerance);
		this.endFill();

		// this.position.y = -50;
	}

	onUpdate(
		delta,
		inSlipStream = false,
		playerRelativeX = 0,
		playerRelativeY = 0
	) {
		if (!inSlipStream) {
			// console.log({ playerRelativeX, playerRelativeY });
			let newX =
				(playerRelativeX / this.starScapeToPlayerDivider) *
					this.speedMultiplier -
				50;
			let newY =
				(playerRelativeY / this.starScapeToPlayerDivider) *
					this.speedMultiplier -
				50;
			this.position.set(newX, newY);
		} else {
			let newPos = this.position.x - delta * 3 * this.speedMultiplier;
			if (newPos < 0 - c.gameCanvas.width) {
				newPos += c.gameCanvas.width;
				// resetting layer position
			}
			this.position.x = newPos;
		}
	}
}
