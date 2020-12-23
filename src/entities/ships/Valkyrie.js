import Ship from './Ship';

export default class Valkyrie extends Ship {
	constructor(props) {
		super(props);

		this.sprites['shipBody'] = this.fromSpriteSheet.create(19, 8, 40, 50);
		this.sprites['shipBody'].x = 7;

		this.sprites['harness_inner'] = this.fromSpriteSheet.create(157, 21, 8, 24);
		this.sprites['harness_inner'].x = -23;

		this.sprites['harness_main'] = this.fromSpriteSheet.create(66, 3, 60, 60);
		this.sprites['harness_main'].x = -5;

		this.spritesToTintWhenDamaged = [
			'shipBody',
			'harness_inner',
			'harness_main',
		];

		this.createThrusters({
			main: [{ x: -37, y: -1 }],
			front: [
				{ x: 23, y: 12 },
				{ x: 23, y: -12 },
			],
			leftSide: [{ x: -11, y: -22 }],
			rightSide: [{ x: -12, y: 21 }],
		});

		this.sprites['targetingReticule'] = this.createTargetingReticule({
			xl: -31,
			xr: 31,
			yt: -32,
			yb: 32,
		});

		this.addChild(this.sprites['shipBody']);
		this.addChild(this.sprites['harness_inner']);
		this.addChild(this.sprites['harness_main']);

		this.createThrusterSprites();
		this.addTargetingReticuleSprites();
	}
}
