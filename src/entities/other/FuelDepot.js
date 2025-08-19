import * as PIXI from '../../pixi';
import { fromSpriteSheet } from '../../utils/helpers';

export default class FuelDepot extends PIXI.Container {
	constructor(props) {
		super();
		this.hasUpdateMethod = true;

		this.entityId = props.entityId;
		this.entityStore = props.entityStore;
		this.blinkTimer = 0;

		this.sprites = {};

		this.sprites['depotBody'] = fromSpriteSheet.create(227, 312, 272, 404);
		this.sprites['solarArray1'] = fromSpriteSheet.create(32, 338, 168, 362);
		this.sprites['solarArray1'].x = 26;
		this.sprites['solarArray1'].y = 380;
		this.sprites['solarArray2'] = fromSpriteSheet.create(32, 338, 168, 362);
		this.sprites['solarArray2'].x = 26;
		this.sprites['solarArray2'].y = -379;
		this.sprites['solarArray2'].angle = 180;

		this.sprites['blinkyLightBg'] = new PIXI.Graphics();
		this.sprites['blinkyLightBg'].lineStyle(1, 0xc49a6c);
		this.sprites['blinkyLightBg'].beginFill(0x008080, 1);
		this.sprites['blinkyLightBg'].drawCircle(-16, -135, 4);
		this.sprites['blinkyLightBg'].endFill();
		this.sprites['blinkyLightBg'].lineStyle(1, 0xc49a6c);
		this.sprites['blinkyLightBg'].beginFill(0x008080, 1);
		this.sprites['blinkyLightBg'].drawCircle(-16, 137, 4);
		this.sprites['blinkyLightBg'].endFill();

		this.sprites['blinkyLights'] = new PIXI.Graphics();
		this.sprites['blinkyLights'].lineStyle(0);
		this.sprites['blinkyLights'].beginFill(0x00ffff, 1);
		this.sprites['blinkyLights'].drawCircle(-16, -135, 3);
		this.sprites['blinkyLights'].endFill();
		this.sprites['blinkyLights'].lineStyle(0);
		this.sprites['blinkyLights'].beginFill(0x00ffff, 1);
		this.sprites['blinkyLights'].drawCircle(-16, 137, 3);
		this.sprites['blinkyLights'].endFill();

		this.currentBlinkAlpha = 0;
		this.sprites['blinkyLights'].alpha = 0;

		this.addChild(this.sprites['depotBody']);
		this.addChild(this.sprites['solarArray1']);
		this.addChild(this.sprites['solarArray2']);
		this.addChild(this.sprites['blinkyLightBg']);
		this.addChild(this.sprites['blinkyLights']);
	}

	onUpdate(delta) {
		this.blinkTimer = this.blinkTimer + delta;
		if (this.blinkTimer > 40 && this.blinkTimer < 60)
			this.currentBlinkAlpha = Math.min(1, this.currentBlinkAlpha + 0.1);
		if (this.blinkTimer > 60 && this.blinkTimer < 80)
			this.currentBlinkAlpha = Math.max(0, this.currentBlinkAlpha - 0.1);
		if (this.blinkTimer >= 80) this.blinkTimer = 0;

		this.sprites['blinkyLights'].alpha = this.currentBlinkAlpha;
	}
}
