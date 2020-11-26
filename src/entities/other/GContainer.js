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
		this.hasUpdateMethod = true;

		this.entityId = props.entityId;
		this.entityStore = props.entityStore;
		this.toggleTargetingReticule = toggleTargetingReticule.bind(this);
		this.reticuleRelation = reticuleRelation.bind(this);
		this.showDamageTint = showDamageTint.bind(this);
		this.blowUp = blowUp.bind(this);
		this.animateExplosion = animateExplosion.bind(this);

		this.sprites = {};

		this.sprites['containerBody'] = fromSpriteSheet.create(395, 16, 44, 34);

		// this.sprites['containerBody'].alpha = 0.5;

		this.sprites['targetingReticule'] = createTargetingReticule({
			xl: -26,
			xr: 25,
			yt: -23,
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
