import Ship from './Ship';

export default class Valkyrie extends Ship {
	constructor(props) {
		super(props);

		this.sprites['shipBody'] = this.fromSpriteSheet.create(19, 8, 40, 50);

		this.sprites['harness_inner'] = this.fromSpriteSheet.create(157, 21, 8, 24);
		this.sprites['harness_inner'].x = -30;

		this.sprites['harness_main'] = this.fromSpriteSheet.create(66, 3, 60, 60);
		this.sprites['harness_main'].x = -12;

		this.spritesToTintWhenDamaged = [
			'shipBody',
			'harness_inner',
			'harness_main',
		];

		this.addThrusters({
			main: [{ x: -44, y: -1 }],
			front: [
				{ x: 16, y: 12 },
				{ x: 16, y: -12 },
			],
			leftSide: [{ x: -18, y: -22 }],
			rightSide: [{ x: -19, y: 21 }],
		});

		this.sprites['targetingReticule'] = this.createTargetingReticule({
			xl: -36,
			xr: 22,
			yt: -28,
			yb: 28,
		});

		this.addChild(this.sprites['shipBody']);
		this.addChild(this.sprites['harness_inner']);
		this.addChild(this.sprites['harness_main']);
		for (const thKey in this.sprites['thrusters'])
			this.sprites['thrusters'][thKey].forEach((thruster) =>
				this.addChild(thruster)
			);
		for (const tRKey in this.sprites['targetingReticule'])
			this.addChild(this.sprites['targetingReticule'][tRKey]);
	}
}
