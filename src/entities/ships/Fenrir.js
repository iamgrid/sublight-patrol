import * as PIXI from '../../pixi';
import {
	fromSpriteSheet,
	createTargetingReticule,
	toggleTargetingReticule,
	reticuleRelation,
	showDamageTint,
	blowUp,
	animateExplosion,
} from '../../utils/helpers';

export default class Fenrir extends PIXI.Container {
	constructor(props) {
		super();
		this.hasUpdateMethod = true;

		this.entityStore = props.entityStore;
		this.toggleTargetingReticule = toggleTargetingReticule.bind(this);
		this.reticuleRelation = reticuleRelation.bind(this);
		this.showDamageTint = showDamageTint.bind(this);
		this.blowUp = blowUp.bind(this);
		this.animateExplosion = animateExplosion.bind(this);

		this.sprites = {};

		this.sprites['shipBody'] = fromSpriteSheet.create(17, 72, 40, 50);

		this.sprites['harness'] = fromSpriteSheet.create(66, 66, 60, 60);

		this.sprites['harness'].x = -10;
		this.sprites['harness'].y = -1;

		this.sprites['targetingReticule'] = createTargetingReticule({
			xl: -34,
			xr: 22,
			yt: -28,
			yb: 28,
		});

		this.currentTint = 0xffffff;
		this.showingExplosion = false;

		this.addChild(this.sprites['shipBody']);
		this.addChild(this.sprites['harness']);
		for (const key in this.sprites['targetingReticule'])
			this.addChild(this.sprites['targetingReticule'][key]);
	}

	onUpdate(delta) {
		this.showDamageTint(['shipBody', 'harness']);
		this.animateExplosion(delta);
	}
}
