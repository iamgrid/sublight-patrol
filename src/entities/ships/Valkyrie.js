import * as PIXI from '../../pixi';
import {
	fromSpriteSheet,
	createTargetingReticule,
	toggleTargetingReticule,
	reticuleRelation,
	showDamageTint,
	flip,
	blowUp,
	animateExplosion,
	fireThrusters,
} from '../../utils/helpers';

export default class Valkyrie extends PIXI.Container {
	constructor(props) {
		super();
		this.hasUpdateMethod = true;

		this.entityId = props.entityId;
		this.entityStore = props.entityStore;

		this.currentLatVelocity = props.latVelocity;
		this.latVelocity = props.latVelocity;
		this.currentLongVelocity = props.longVelocity;
		this.longVelocity = props.longVelocity;
		this.facing = props.facing;

		this.toggleTargetingReticule = toggleTargetingReticule.bind(this);
		this.reticuleRelation = reticuleRelation.bind(this);
		this.showDamageTint = showDamageTint.bind(this);
		this.flip = flip.bind(this);
		this.blowUp = blowUp.bind(this);
		this.animateExplosion = animateExplosion.bind(this);
		this.fireThrusters = fireThrusters.bind(this);

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
		this.showingExplosion = false;
		this.facing = props.facing;
		this.currentRotation = 0;
		this.targetRotation = 0;

		this.addChild(this.sprites['shipBody']);
		this.addChild(this.sprites['harness']);
		for (const key in this.sprites['targetingReticule'])
			this.addChild(this.sprites['targetingReticule'][key]);

		if (this.facing === -1) {
			this.targetRotation = Math.PI;
			this.currentRotation = Math.PI;
		}
		this.rotation = this.currentRotation;
	}

	onUpdate(delta) {
		this.showDamageTint(['shipBody', 'harness']);
		this.animateExplosion(delta);
		this.flip();
		this.fireThrusters();
	}
}
