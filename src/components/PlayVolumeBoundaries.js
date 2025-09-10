import * as PIXI from '../pixi';
import c from '../utils/constants';

export default class PlayVolumeBoundaries extends PIXI.Container {
	constructor() {
		super();
		this.playVolume = {};
		this.sprites = {};
	}

	reDraw(newPlayVolume) {
		this.playVolume = newPlayVolume;
		if (this.sprites['boundaryRect'] !== undefined) {
			this.removeChild(this.sprites['boundaryRect']);
			this.sprites['boundaryRect'].destroy();
			delete this.sprites['boundaryRect'];
		}

		this.sprites['boundaryRect'] = new PIXI.Graphics();
		this.sprites['boundaryRect'].lineStyle(1, 0x008080);
		this.sprites['boundaryRect'].beginFill(0x0, 0);
		// console.log('this.playVolume:', this.playVolume);
		this.sprites['boundaryRect'].drawRect(
			this.playVolume.minX - c.boundaryBorderPadding,
			this.playVolume.minY - c.boundaryBorderPadding,
			Math.abs(this.playVolume.maxX - this.playVolume.minX) +
				c.boundaryBorderPadding * 2,
			Math.abs(this.playVolume.maxY - this.playVolume.minY) +
				c.boundaryBorderPadding * 2
		);
		this.sprites['boundaryRect'].endFill();

		this.addChild(this.sprites['boundaryRect']);
	}
}
