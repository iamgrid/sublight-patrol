import * as PIXI from '../pixi';
import c from '../utils/constants';

export default class Matte extends PIXI.Graphics {
	constructor() {
		super();

		this.lineStyle(0);
		this.beginFill(0x000000, 1);
		this.drawRect(0, 0, c.gameCanvas.width, c.gameCanvas.height);
		this.endFill();
	}
}
