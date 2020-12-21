import Ship from './Ship';

export default class ZangariShuttle extends Ship {
	constructor(props) {
		super(props);

		this.sprites['shipBody'] = this.fromSpriteSheet.create(213, 142, 86, 36);

		this.spritesToTintWhenDamaged = ['shipBody'];

		this.createThrusters({
			main: [{ x: -53, y: -1 }],
			front: [
				{ x: 48, y: -9.5 },
				{ x: 48, y: 8.5 },
			],
			leftSide: [
				{ x: -32, y: -26 },
				{ x: 31, y: -26 },
			],
			rightSide: [
				{ x: -33, y: 25 },
				{ x: 30, y: 25 },
			],
		});

		this.sprites['targetingReticule'] = this.createTargetingReticule({
			xl: -48,
			xr: 46,
			yt: -26,
			yb: 26,
		});

		this.addChild(this.sprites['shipBody']);

		this.createThrusterSprites();
		this.addTargetingReticuleSprites();
	}
}
