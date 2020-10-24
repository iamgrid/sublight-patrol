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

		this.shipBody = fromSpriteSheet.create(19, 8, 40, 50);

		this.harness = fromSpriteSheet.create(66, 3, 60, 60);

		this.harness.x = -12;

		this.targetingReticule = createTargetingReticule({
			xl: -36,
			xr: 22,
			yt: -28,
			yb: 28,
		});

		this.addChild(this.shipBody);
		this.addChild(this.harness);
		for (const key in this.targetingReticule)
			this.addChild(this.targetingReticule[key]);
	}
}
