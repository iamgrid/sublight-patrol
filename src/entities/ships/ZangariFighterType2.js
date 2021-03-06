import Ship from './Ship';

export default class ZangariFighterType2 extends Ship {
	constructor(props) {
		super(props);

		this.sprites['shipBody'] = this.fromSpriteSheet.create(204, 71, 40, 52);

		this.spritesToTintWhenDamaged = ['shipBody'];

		this.createThrusters({
			main: [{ x: -27, y: -1 }],
			front: [{ x: 25, y: 0 }],
			leftSide: [{ x: -4, y: -34 }],
			rightSide: [{ x: -5, y: 33 }],
		});

		this.sprites['targetingReticule'] = this.createTargetingReticule({
			xl: -26,
			xr: 26,
			yt: -32,
			yb: 32,
		});

		this.addChild(this.sprites['shipBody']);

		this.createThrusterSprites();
		this.addTargetingReticuleSprites();
	}
}
