import * as PIXI from '../pixi';

export default class HealthBars extends PIXI.Container {
	constructor(props) {
		super();
		this.entityId = props.entityId;
		this.hasShields = props.hasShields;
		this.currentY = 0;
		this.barsX = -20;
		this.barsWidth = 40;
		this.bars = [
			{ id: 'shields', tint: 0x32ade6 },
			{ id: 'hull', tint: 0xff5353 },
			{ id: 'sys', tint: 0xe6b632 },
		];

		this.sprites = {};

		this.bars.forEach((bar) => {
			if (bar.id === 'shields' && !this.hasShields) {
				this.currentY += 4;
				// console.log('HealthBars: ', this.entityId, 'has no shields');
				return;
			}

			this.sprites[bar.id + 'Bg'] = new PIXI.Graphics();
			this.sprites[bar.id + 'Bg'].lineStyle(0);
			this.sprites[bar.id + 'Bg'].beginFill(0xffffff);
			this.sprites[bar.id + 'Bg'].drawRect(
				this.barsX,
				this.currentY,
				this.barsWidth,
				2
			);
			this.sprites[bar.id + 'Bg'].endFill();
			this.sprites[bar.id + 'Bg'].alpha = 0.3;

			this.sprites[bar.id] = new PIXI.Graphics();
			this.sprites[bar.id].lineStyle(0);
			this.sprites[bar.id].beginFill(bar.tint);
			this.sprites[bar.id].drawRect(0, this.currentY, this.barsWidth, 2);
			this.sprites[bar.id].endFill();
			this.sprites[bar.id].alpha = 0.8;
			this.sprites[bar.id].position.x = this.barsX;
			this.sprites[bar.id].pivot.x = 0;

			this.addChild(this.sprites[bar.id + 'Bg']);
			this.addChild(this.sprites[bar.id]);

			this.currentY += 4;
		});
	}

	update(precentages, show = false) {
		if (!show) {
			this.alpha = 0;
			return;
		}

		this.alpha = 1;
		this.bars.forEach((bar) => {
			if (bar.id === 'shields' && !this.hasShields) return;

			this.sprites[bar.id].width = Math.round(
				(precentages[bar.id] / 100) * this.barsWidth
			);
		});
	}
}
