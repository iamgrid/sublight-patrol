import * as PIXI from '../../pixi';
import {
	fromSpriteSheet,
	createTargetingReticule,
	toggleTargetingReticule,
	reticuleRelation,
} from '../../utils/helpers';

export default class Valkyrie extends PIXI.Container {
	constructor() {
		super();
		this.toggleTargetingReticule = toggleTargetingReticule.bind(this);
		this.reticuleRelation = reticuleRelation.bind(this);

		this.shipBody = fromSpriteSheet.create(3, 3, 60, 60);

		this.harness = fromSpriteSheet.create(66, 3, 60, 60);

		this.harness.x = -6;

		this.targetingReticule = createTargetingReticule({
			xl: -30,
			xr: 28,
			yt: -28,
			yb: 28,
		});

		this.addChild(this.shipBody);
		this.addChild(this.harness);
		for (const key in this.targetingReticule)
			this.addChild(this.targetingReticule[key]);
	}
}
