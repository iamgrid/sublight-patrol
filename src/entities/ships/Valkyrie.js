import * as PIXI from '../../pixi';
import { fromSpriteSheet } from '../../utils/helpers';

export default class Valkyrie extends PIXI.Container {
	constructor() {
		super();
		this.shipBody = fromSpriteSheet.create(3, 3, 60, 60);

		this.harness = fromSpriteSheet.create(66, 3, 60, 60);

		this.harness.x = -6;

		this.addChild(this.shipBody);
		this.addChild(this.harness);
	}
}
