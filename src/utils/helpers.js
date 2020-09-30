import * as PIXI from '../pixi';

export function getFromSpriteSheet(spriteSheet, x, y, width, height) {
	const spriteTexture = new PIXI.Texture(spriteSheet);
	spriteTexture.frame = new PIXI.Rectangle(x, y, width, height);
	const sprite = new PIXI.Sprite(spriteTexture);
	sprite.anchor.set(0.5);

	return sprite;
}
