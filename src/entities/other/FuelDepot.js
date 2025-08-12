import * as PIXI from '../../pixi';
import { fromSpriteSheet } from '../../utils/helpers';

export default class FuelDepot extends PIXI.Container {
	constructor(props) {
		super();
		this.hasUpdateMethod = false;

		this.entityId = props.entityId;
		this.entityStore = props.entityStore;
		this.sprites = {};

		this.sprites['depotBody'] = fromSpriteSheet.create(122, 312, 272, 404);

		this.addChild(this.sprites['depotBody']);
	}

	// onUpdate(delta) {
	// 	this.showDamageTint(['depotBody']);
	// 	this.animateExplosion(delta);
	// }
}
