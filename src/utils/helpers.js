import * as PIXI from '../pixi';

export const fromSpriteSheet = {
	defaultSpriteSheet: null,
	create(x, y, width, height, spriteSheet=this.defaultSpriteSheet) {
		const spriteTexture = new PIXI.Texture(spriteSheet);
		spriteTexture.frame = new PIXI.Rectangle(x, y, width, height);
		const sprite = new PIXI.Sprite(spriteTexture);
		sprite.anchor.set(0.5);
	
		return sprite;
	}
}
