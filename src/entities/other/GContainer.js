import * as PIXI from '../../pixi';
import {
	fromSpriteSheet,
	createTargetingReticule,
	toggleTargetingReticule,
	reticuleRelation,
	showDamageTint,
} from '../../utils/helpers';

export default class GContainer extends PIXI.Container {
	constructor() {
		super();
		this.toggleTargetingReticule = toggleTargetingReticule.bind(this);
		this.reticuleRelation = reticuleRelation.bind(this);
		this.showDamageTint = showDamageTint.bind(this);

		this.containerBody = fromSpriteSheet.create(386, 3, 60, 60);

		// this.containerBody.alpha = 0.5;

		this.targetingReticule = createTargetingReticule({
			xl: -26,
			xr: 26,
			yt: -24,
			yb: 22,
		});

		this.currentTint = 0xffffff;

		this.addChild(this.containerBody);
		for (const key in this.targetingReticule)
			this.addChild(this.targetingReticule[key]);
	}

	onUpdate() {
		this.showDamageTint(['containerBody']);
	}
}
