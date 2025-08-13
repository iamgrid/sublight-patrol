import * as PIXI from '../../pixi';
import { fromSpriteSheet } from '../../utils/helpers';

export default class FuelDepot extends PIXI.Container {
	constructor(props) {
		super();
		this.hasUpdateMethod = false;

		this.entityId = props.entityId;
		this.entityStore = props.entityStore;
		this.sprites = {};

		this.sprites['depotBody'] = fromSpriteSheet.create(227, 312, 272, 404);
		this.sprites['solarArray1'] = fromSpriteSheet.create(32, 338, 168, 362);
		this.sprites['solarArray1'].x = 26;
		this.sprites['solarArray1'].y = 380;
		this.sprites['solarArray2'] = fromSpriteSheet.create(32, 338, 168, 362);
		this.sprites['solarArray2'].x = 26;
		this.sprites['solarArray2'].y = -379;
		this.sprites['solarArray2'].angle = 180;

		this.addChild(this.sprites['depotBody']);
		this.addChild(this.sprites['solarArray1']);
		this.addChild(this.sprites['solarArray2']);
	}

	// onUpdate(delta) {
	// 	this.showDamageTint(['depotBody']);
	// 	this.animateExplosion(delta);
	// }
}
