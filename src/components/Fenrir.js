import * as PIXI from '../pixi';
import { getFromSpriteSheet } from '../utils/helpers';
// import c from './utils/constants';

export default class Fenrir extends PIXI.Container {
	constructor(props) {
		super();
		this.shipBody = getFromSpriteSheet(props.spriteSheet, 3, 3, 60, 60);

		this.harness = getFromSpriteSheet(props.spriteSheet, 66, 3, 60, 60);

		this.harness.x = -6;

		this.addChild(this.shipBody);
		this.addChild(this.harness);
	}
}