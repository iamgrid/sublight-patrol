import * as PIXI from '../../pixi';

export default class Buoy extends PIXI.Container {
	constructor(props) {
		super();
		this.hasUpdateMethod = true;

		this.entityId = props.entityId;
		this.entityStore = props.entityStore;
		this.labelText = `[ ${props.coordX} , ${props.coordY} ]`;
		this.blinkTimer = 0;

		this.sprites = {};

		this.sprites['buoyLabel'] = new PIXI.Text(this.labelText, {
			fontSize: 10,
			fill: 0x00c0c0,
			align: 'center',
		});

		this.sprites['buoyLabel'].anchor.set(0.5);
		this.sprites['buoyLabel'].position.y = 20;

		this.sprites['buoyBody'] = new PIXI.Graphics();

		this.sprites['buoyBody'].lineStyle(1, 0x909090);
		this.sprites['buoyBody'].beginFill(0x606060, 1);
		this.sprites['buoyBody'].drawCircle(0, 0, 7);
		this.sprites['buoyBody'].endFill();

		this.sprites['buoyBody'].lineStyle(0);
		this.sprites['buoyBody'].beginFill(0x008080, 1);
		this.sprites['buoyBody'].drawCircle(0, 0, 3);
		this.sprites['buoyBody'].endFill();

		this.sprites['buoyBlinkyLight'] = new PIXI.Graphics();

		this.sprites['buoyBlinkyLight'].lineStyle(0);
		this.sprites['buoyBlinkyLight'].beginFill(0x00ffff, 1);
		this.sprites['buoyBlinkyLight'].drawCircle(0, 0, 3);
		this.sprites['buoyBlinkyLight'].endFill();

		this.currentBlinkAlpha = 0;
		this.sprites['buoyBlinkyLight'].alpha = 0;

		this.addChild(this.sprites['buoyBody']);
		this.addChild(this.sprites['buoyBlinkyLight']);
		this.addChild(this.sprites['buoyLabel']);
	}

	onUpdate(delta) {
		this.blinkTimer = this.blinkTimer + delta;
		if (this.blinkTimer > 40 && this.blinkTimer < 60)
			this.currentBlinkAlpha = Math.min(1, this.currentBlinkAlpha + 0.1);
		if (this.blinkTimer > 60 && this.blinkTimer < 80)
			this.currentBlinkAlpha = Math.max(0, this.currentBlinkAlpha - 0.1);
		if (this.blinkTimer >= 80) this.blinkTimer = 0;

		this.sprites['buoyBlinkyLight'].alpha = this.currentBlinkAlpha;
	}
}
