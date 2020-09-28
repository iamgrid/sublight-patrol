import * as PIXI from '../pixi';

export default class Starfield extends PIXI.TilingSprite {
	constructor() {
		const texture = PIXI.Texture.from('starfield');
		super(texture, 1, texture.height);
		/* width 1 because we will call onResize from App anyway */
	}

	onResize(width) {
		this.width = width;
	}

	/*onUpdate(delta) {
		this.tilePosition.x -= delta * 3;
	}*/
}
