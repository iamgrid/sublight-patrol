import * as PIXI from '../../pixi';

export default class Buoy extends PIXI.Container {
	constructor(props) {
		super();

		this.labelText = `[ ${props.coordX}, ${props.coordY} ]`;
		this.sprites = {};

		this.sprites['buoyBody'] = new PIXI.Graphics();
		this.sprites['buoyLabel'] = new PIXI.Text(this.labelText, {
			fontSize: 12,
			fill: 0xffff00,
			align: 'center',
		});

		this.lineStyle(0);
		this.beginFill(0xcacaca, 1);
		this.drawCircle(0, 0, 10);
		this.endFill();

		// this.sprites['containerBody'] = fromSpriteSheet.create(386, 3, 60, 60);

		this.addChild(this.sprites['buoyBody']);
		this.addChild(this.sprites['buoyLabel']);
	}
}
