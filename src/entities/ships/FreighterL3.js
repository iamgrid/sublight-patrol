import Ship from './Ship';

export default class FreighterL3 extends Ship {
	constructor(props) {
		super(props);

		this.sprites['shipBody'] = this.fromSpriteSheet.create(201, 207, 172, 34);

		this.spritesToTintWhenDamaged = ['shipBody'];

		this.createThrusters({
			main: [{ x: -95, y: 0 }],
			front: [
				{ x: 92, y: -9.5 },
				{ x: 92, y: 8.5 },
			],
			leftSide: [
				{ x: -75, y: -24 },
				{ x: 75, y: -24 },
			],
			rightSide: [
				{ x: -76, y: 23 },
				{ x: 74, y: 23 },
			],
		});

		this.sprites['targetingReticule'] = this.createTargetingReticule({
			xl: -88,
			xr: 88,
			yt: -25,
			yb: 25,
		});

		this.addChild(this.sprites['shipBody']);

		this.createThrusterSprites();
		this.addTargetingReticuleSprites();
	}
}
