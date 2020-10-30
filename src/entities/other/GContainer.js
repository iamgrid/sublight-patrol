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

export default class GContainer extends PIXI.Container {
	constructor(props) {
		super();

		this.entityStore = props.entityStore;
		this.toggleTargetingReticule = toggleTargetingReticule.bind(this);
		this.reticuleRelation = reticuleRelation.bind(this);
		this.showDamageTint = showDamageTint.bind(this);
		this.blowUp = blowUp.bind(this);
		this.animateExplosion = animateExplosion.bind(this);

		this.sprites = {};

		this.sprites['containerBody'] = fromSpriteSheet.create(386, 3, 60, 60);

		// this.sprites['containerBody'].alpha = 0.5;

		this.sprites['targetingReticule'] = createTargetingReticule({
			xl: -26,
			xr: 26,
			yt: -24,
			yb: 22,
		});

		this.currentTint = 0xffffff;
		this.showingExplosion = false;

		this.addChild(this.sprites['containerBody']);
		for (const key in this.sprites['targetingReticule'])
			this.addChild(this.sprites['targetingReticule'][key]);
	}

	onUpdate(delta) {
		this.showDamageTint(['containerBody']);
		this.animateExplosion(delta);
	}
}
