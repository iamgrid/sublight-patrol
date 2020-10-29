import * as PIXI from '../../pixi';
import {
	fromSpriteSheet,
	createTargetingReticule,
	toggleTargetingReticule,
	reticuleRelation,
	showDamageTint,
} from '../../utils/helpers';

export default class Fenrir extends PIXI.Container {
	constructor() {
		super();
		this.toggleTargetingReticule = toggleTargetingReticule.bind(this);
		this.reticuleRelation = reticuleRelation.bind(this);
		this.showDamageTint = showDamageTint.bind(this);

		this.shipBody = fromSpriteSheet.create(17, 72, 40, 50);

		this.harness = fromSpriteSheet.create(66, 66, 60, 60);

		this.harness.x = -10;
		this.harness.y = -1;

		this.targetingReticule = createTargetingReticule({
			xl: -34,
			xr: 22,
			yt: -28,
			yb: 28,
		});

		this.currentTint = 0xffffff;

		this.addChild(this.shipBody);
		this.addChild(this.harness);
		for (const key in this.targetingReticule)
			this.addChild(this.targetingReticule[key]);
	}

	onUpdate() {
		this.showDamageTint(['shipBody', 'harness']);
	}
}
