import * as PIXI from '../pixi';
// import c from '../utils/constants';
// import { randomNumber } from '../utils/formulas';

export default class Shot extends PIXI.Graphics {
	constructor(props) {
		super();

		this.lineStyle(0);

		this.beginFill(props.color);
		this.drawRect(0, 0, 8, 1);
		this.endFill();

		this.position.set(props.posX, props.posY);

		this.traveled = 0;
		this.power = props.power;
		this.hasBeenDestroyed = false;
		this.id = props.id;
		this.sightLine = props.posY;
		this.direction = props.direction;
		this.callbackFn = props.callbackFn;
	}

	onUpdate(delta) {
		if (!this.hasBeenDestroyed) {
			const travel = delta * 5;
			this.traveled += travel;

			if (this.traveled > 800) {
				// remove shot
				this.callbackFn(this.id, this.sightLine);
				return;
			}

			let newPos = this.position.x + travel * this.direction;

			this.position.x = newPos;
		}
	}
}
