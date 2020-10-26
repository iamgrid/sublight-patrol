import * as PIXI from '../../pixi';
import {
	fromSpriteSheet,
	createTargetingReticule,
	toggleTargetingReticule,
	reticuleRelation,
} from '../../utils/helpers';

export default class GContainer extends PIXI.Container {
	constructor() {
		super();
		this.toggleTargetingReticule = toggleTargetingReticule.bind(this);
		this.reticuleRelation = reticuleRelation.bind(this);

		this.containerBody = fromSpriteSheet.create(386, 3, 60, 60);

		this.containerBody.alpha = 0.5;

		this.targetingReticule = createTargetingReticule({
			xl: -26,
			xr: 26,
			yt: -24,
			yb: 22,
		});

		this.addChild(this.containerBody);
		for (const key in this.targetingReticule)
			this.addChild(this.targetingReticule[key]);
	}
}
