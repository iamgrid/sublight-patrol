import Ship from './Ship';

export default class Fenrir extends Ship {
	constructor(props) {
		super(props);

		this.sprites['shipBody'] = this.fromSpriteSheet.create(17, 72, 40, 50);

		this.sprites['harness_inner'] = this.fromSpriteSheet.create(157, 21, 8, 24);
		this.sprites['harness_inner'].x = -28;

		this.sprites['harness_main'] = this.fromSpriteSheet.create(66, 66, 60, 60);
		this.sprites['harness_main'].x = -10;
		this.sprites['harness_main'].y = -1;

		this.spritesToTintWhenDamaged = [
			'shipBody',
			'harness_inner',
			'harness_main',
		];

		this.createThrusters({
			main: [{ x: -42, y: -1 }],
			front: [
				{ x: 18, y: 12 },
				{ x: 18, y: -12 },
			],
			leftSide: [{ x: 1.5, y: -22 }],
			rightSide: [{ x: 0.5, y: 21 }],
		});

		this.sprites['targetingReticule'] = this.createTargetingReticule({
			xl: -34,
			xr: 22,
			yt: -28,
			yb: 28,
		});

		this.addChild(this.sprites['shipBody']);
		this.addChild(this.sprites['harness_inner']);
		this.addChild(this.sprites['harness_main']);

		this.createThrusterSprites();
		this.addTargetingReticuleSprites();
	}
}
