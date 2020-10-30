import * as PIXI from '../../pixi';

export default class Buoy extends PIXI.Container {
	constructor(props) {
		super();

		this.entityStore = props.entityStore;
		this.labelText = `[ ${props.coordX} , ${props.coordY} ]`;
		this.sprites = {};

		this.sprites['buoyLabel'] = new PIXI.Text(this.labelText, {
			fontSize: 10,
			fill: 0x00c0c0,
			align: 'center',
		});

		this.sprites['buoyLabel'].anchor.set(0.5);
		this.sprites['buoyLabel'].position.y = 20;

		this.sprites['buoyBody'] = new PIXI.Graphics();

		this.sprites['buoyBody'].lineStyle(0);
		this.sprites['buoyBody'].beginFill(0x606060, 1);
		this.sprites['buoyBody'].drawCircle(0, 0, 7);
		this.sprites['buoyBody'].endFill();

		this.sprites['buoyBody'].lineStyle(0);
		this.sprites['buoyBody'].beginFill(0x00c0c0, 1);
		this.sprites['buoyBody'].drawCircle(0, 0, 3);
		this.sprites['buoyBody'].endFill();

		// this.sprites['containerBody'] = fromSpriteSheet.create(386, 3, 60, 60);

		this.addChild(this.sprites['buoyBody']);
		this.addChild(this.sprites['buoyLabel']);
	}
}
