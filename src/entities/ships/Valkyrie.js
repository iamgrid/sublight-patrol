import * as PIXI from '../../pixi';
import {
	fromSpriteSheet,
	createTargetingReticule,
	toggleTargetingReticule,
	reticuleRelation,
	showDamageTint,
	blowUp,
} from '../../utils/helpers';

export default class Valkyrie extends PIXI.Container {
	constructor() {
		super();
		this.toggleTargetingReticule = toggleTargetingReticule.bind(this);
		this.reticuleRelation = reticuleRelation.bind(this);
		this.showDamageTint = showDamageTint.bind(this);
		this.blowUp = blowUp.bind(this);

		this.sprites = {};

		this.sprites['shipBody'] = fromSpriteSheet.create(19, 8, 40, 50);

		this.sprites['harness'] = fromSpriteSheet.create(66, 3, 60, 60);

		this.sprites['harness'].x = -12;

		this.sprites['targetingReticule'] = createTargetingReticule({
			xl: -36,
			xr: 22,
			yt: -28,
			yb: 28,
		});

		this.currentTint = 0xffffff;

		this.addChild(this.sprites['shipBody']);
		this.addChild(this.sprites['harness']);
		for (const key in this.sprites['targetingReticule'])
			this.addChild(this.sprites['targetingReticule'][key]);
	}

	onUpdate() {
		this.showDamageTint(['shipBody', 'harness']);
	}
}
