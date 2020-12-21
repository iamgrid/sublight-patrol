import Ship from './Ship';

export default class FreighterL1 extends Ship {
	constructor(props) {
		super(props);

		this.sprites['shipBody'] = this.fromSpriteSheet.create(342, 80, 88, 34);

		this.spritesToTintWhenDamaged = ['shipBody'];

		this.createThrusters({
			main: [{ x: -53, y: 0 }],
			front: [
				{ x: 48, y: -9.5 },
				{ x: 48, y: 8.5 },
			],
			leftSide: [
				{ x: -33, y: -24 },
				{ x: 33, y: -24 },
			],
			rightSide: [
				{ x: -34, y: 23 },
				{ x: 32, y: 23 },
			],
		});

		this.sprites['targetingReticule'] = this.createTargetingReticule({
			xl: -49,
			xr: 48,
			yt: -25,
			yb: 25,
		});

		this.addChild(this.sprites['shipBody']);

		this.createThrusterSprites();
		this.addTargetingReticuleSprites();
	}
}
