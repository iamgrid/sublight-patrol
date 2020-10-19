import * as PIXI from '../../pixi';
import {
	fromSpriteSheet,
	createTargetingReticule,
	toggleTargetingReticule,
} from '../../utils/helpers';

export default class Fenrir extends PIXI.Container {
	constructor() {
		super();
		this.toggleTargetingReticule = toggleTargetingReticule.bind(this);

		this.shipBody = fromSpriteSheet.create(3, 66, 60, 60);

		this.harness = fromSpriteSheet.create(66, 66, 60, 60);

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
