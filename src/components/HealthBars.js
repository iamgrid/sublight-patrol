import * as PIXI from '../pixi';

export default class HealthBars extends PIXI.Container {
	constructor(props) {
		super();
		this.entityId = props.entityId;
		this.currentY = 0;
		this.bars = [
			{ id: 'shield', tint: 0x32ade6 },
			{ id: 'hull', tint: 0xff5353 },
			{ id: 'sys', tint: 0xe6b632 },
		];

		this.sprites = {};

		this.bars.forEach((bar) => {
			this.sprites[bar.id + 'Bg'] = new PIXI.Graphics();
			this.sprites[bar.id + 'Bg'].lineStyle(0);
			this.sprites[bar.id + 'Bg'].beginFill(0xffffff);
			this.sprites[bar.id + 'Bg'].drawRect(0, this.currentY, 100, 2);
			this.sprites[bar.id + 'Bg'].endFill();
			this.sprites[bar.id + 'Bg'].alpha = 0.3;

			this.sprites[bar.id] = new PIXI.Graphics();
			this.sprites[bar.id].lineStyle(0);
			this.sprites[bar.id].beginFill(bar.tint);
			this.sprites[bar.id].drawRect(0, this.currentY, 100, 2);
			this.sprites[bar.id].endFill();
			this.sprites[bar.id].alpha = 0.8;

			this.currentY += 3;
		});

		this.anchor.set(0.5);
	}

	update(precentages, show = false) {
		if (!show) {
			this.alpha = 0;
			return;
		}

		this.alpha = 1;
		this.bars.forEach((bar) => {
			this.sprites[bar.id].width = precentages[bar.id];
		});
	}
}
