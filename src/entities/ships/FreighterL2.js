import Ship from './Ship';

export default class FreighterL2 extends Ship {
	constructor(props) {
		super(props);

		this.sprites['shipBody'] = this.fromSpriteSheet.create(30, 208, 130, 34);

		this.spritesToTintWhenDamaged = ['shipBody'];

		this.createThrusters({
			main: [{ x: -74, y: 0 }],
			front: [
				{ x: 71, y: -9.5 },
				{ x: 71, y: 8.5 },
			],
			leftSide: [
				{ x: -54, y: -24 },
				{ x: 54, y: -24 },
			],
			rightSide: [
				{ x: -54, y: 23 },
				{ x: 54, y: 23 },
			],
		});

		this.sprites['targetingReticule'] = this.createTargetingReticule({
			xl: -68,
			xr: 68,
			yt: -25,
			yb: 25,
		});

		this.addChild(this.sprites['shipBody']);

		this.createThrustersprites();
		this.addTargetingReticuleSprites();
	}
}
