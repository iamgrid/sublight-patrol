import * as PIXI from '../../pixi';
import {
	fromSpriteSheet,
	createTargetingReticule,
	toggleTargetingReticule,
	createThrusters,
	addTargetingReticuleSprites,
	createThrusterSprites,
	addEMPSprite,
	toggleEMP,
	updateEMP,
	reticuleRelation,
	showDamageTint,
	flip,
	blowUp,
	animateExplosion,
	fireThrusters,
} from '../../utils/helpers';

export default class Ship extends PIXI.Container {
	constructor(props) {
		super();
		this.hasUpdateMethod = true;

		this.entityId = props.entityId;
		this.entityStore = props.entityStore;

		this.currentLatVelocity = 0;
		this.latVelocity = props.latVelocity;
		this.currentLongVelocity = 0;
		this.longVelocity = props.longVelocity;

		this.fromSpriteSheet = fromSpriteSheet;
		this.createTargetingReticule = createTargetingReticule.bind(this);
		this.addTargetingReticuleSprites = addTargetingReticuleSprites.bind(this);
		this.toggleTargetingReticule = toggleTargetingReticule.bind(this);
		this.reticuleRelation = reticuleRelation.bind(this);
		this.showDamageTint = showDamageTint.bind(this);
		this.flip = flip.bind(this);
		this.blowUp = blowUp.bind(this);
		this.animateExplosion = animateExplosion.bind(this);
		this.createThrusters = createThrusters.bind(this);
		this.createThrusterSprites = createThrusterSprites.bind(this);
		this.addEMPSprite = addEMPSprite.bind(this);
		this.toggleEMP = toggleEMP.bind(this);
		this.updateEMP = updateEMP.bind(this);
		this.fireThrusters = fireThrusters.bind(this);

		this.sprites = {};
		this.spritesToTintWhenDamaged = [];

		this.currentTint = 0xffffff;
		this.showingExplosion = false;
		this.facing = props.facing;
		this.isFlipping = false;
		this.currentRotation = 0;
		this.targetRotation = 0;
		this.isDisabled = props.isDisabled;
		this.hasEMP = props.hasEMP;

		if (this.hasEMP) {
			this.addEMPSprite();
			this.empIsToggled = false;
		}

		if (this.facing === -1) {
			this.targetRotation = Math.PI;
			this.currentRotation = Math.PI;
		}
		// if (this.isDisabled) {
		// 	this.targetRotation = Math.PI / 10;
		// }
		this.rotation = this.currentRotation;
	}

	onUpdate(delta) {
		this.showDamageTint(this.spritesToTintWhenDamaged);
		this.animateExplosion(delta);
		this.flip();
		this.fireThrusters();
		this.updateEMP();
	}
}
