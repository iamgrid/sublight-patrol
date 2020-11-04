import * as PIXI from '../pixi';

export default class Pointer extends PIXI.Graphics {
	constructor() {
		super();
		this.lineStyle(0);
		this.beginFill(0xffffff);
		this.moveTo(0, 0);
		this.lineTo(3, 12);
		this.lineTo(-3, 12);
		this.lineTo(0, 0);
		this.closePath();
		this.endFill();
		this.pivot.set(0, 0);
		// this.anchor.set(0, 0.5);
	}
}
