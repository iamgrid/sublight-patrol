import * as PIXI from '../../pixi';
import {
	fromSpriteSheet,
	createTargetingReticule,
	toggleTargetingReticule,
	addThrusters,
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

		this.currentLatVelocity = 0;
		this.latVelocity = props.latVelocity;
		this.currentLongVelocity = 0;
		this.longVelocity = props.longVelocity;
		this.facing = props.facing;

		this.toggleTargetingReticule = toggleTargetingReticule.bind(this);
		this.reticuleRelation = reticuleRelation.bind(this);
		this.showDamageTint = showDamageTint.bind(this);
		this.flip = flip.bind(this);
		this.blowUp = blowUp.bind(this);
		this.animateExplosion = animateExplosion.bind(this);
		this.addThrusters = addThrusters.bind(this);
		this.fireThrusters = fireThrusters.bind(this);

		this.sprites = {};

		this.sprites['shipBody'] = fromSpriteSheet.create(19, 8, 40, 50);

		this.sprites['harness_inner'] = fromSpriteSheet.create(157, 21, 8, 24);
		this.sprites['harness_inner'].x = -30;

		this.sprites['harness_main'] = fromSpriteSheet.create(66, 3, 60, 60);
		this.sprites['harness_main'].x = -12;

		this.addThrusters({
			main: [{ x: -44, y: -1 }],
			front: [
				{ x: 16, y: 12 },
				{ x: 16, y: -12 },
			],
			leftSide: [{ x: -18, y: -22 }],
			rightSide: [{ x: -19, y: 21 }],
		});

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
		this.addChild(this.sprites['harness_inner']);
		this.addChild(this.sprites['harness_main']);
		for (const thKey in this.sprites['thrusters'])
			this.sprites['thrusters'][thKey].forEach((thruster) =>
				this.addChild(thruster)
			);
		for (const tRKey in this.sprites['targetingReticule'])
			this.addChild(this.sprites['targetingReticule'][tRKey]);

		if (this.facing === -1) {
			this.targetRotation = Math.PI;
			this.currentRotation = Math.PI;
		}
		this.rotation = this.currentRotation;
	}

	onUpdate(delta) {
		this.showDamageTint(['shipBody', 'harness_inner', 'harness_main']);
		this.animateExplosion(delta);
		this.flip();
		this.fireThrusters();
	}
}
