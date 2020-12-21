import Ship from './Ship';

export default class ZangariFighterType1 extends Ship {
	constructor(props) {
		super(props);

		this.sprites['shipBody'] = this.fromSpriteSheet.create(137, 134, 48, 52);

		this.spritesToTintWhenDamaged = ['shipBody'];

		this.createThrusters({
			main: [{ x: -13, y: -1 }],
			front: [{ x: 32, y: 0 }],
			leftSide: [{ x: -2, y: -34 }],
			rightSide: [{ x: -3, y: 33 }],
		});

		this.sprites['targetingReticule'] = this.createTargetingReticule({
			xl: -26,
			xr: 30,
			yt: -32,
			yb: 32,
		});

		this.addChild(this.sprites['shipBody']);

		this.createThrusterSprites();
		this.addTargetingReticuleSprites();
	}
}
