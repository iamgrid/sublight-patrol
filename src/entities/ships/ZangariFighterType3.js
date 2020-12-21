import Ship from './Ship';

export default class ZangariFighterType3 extends Ship {
	constructor(props) {
		super(props);

		this.sprites['shipBody'] = this.fromSpriteSheet.create(68, 135, 58, 52);

		this.spritesToTintWhenDamaged = ['shipBody'];

		this.createThrusters({
			main: [{ x: -20, y: -1 }],
			front: [{ x: 25, y: 0 }],
			leftSide: [{ x: 1, y: -34 }],
			rightSide: [{ x: 0, y: 33 }],
		});

		this.sprites['targetingReticule'] = this.createTargetingReticule({
			xl: -34,
			xr: 34,
			yt: -34,
			yb: 34,
		});

		this.addChild(this.sprites['shipBody']);

		this.createThrusterSprites();
		this.addTargetingReticuleSprites();
	}
}
