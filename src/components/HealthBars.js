import * as PIXI from '../pixi';

export default class HealthBars extends PIXI.Container {
	constructor(props) {
		super();
		this.entityId = props.entityId;
		this.hasShields = props.hasShields;
		this.isDisabled = false;
		this.isShowing = true;
		this.sysIsShowing = false;
		this.currentY = 0;
		this.barsX = -20;
		this.barsWidth = 40;
		this.bars = [
			{ id: 'shields', tint: 0x32ade6, current: 100 },
			{ id: 'hull', tint: 0xff5353, current: 100 },
			{ id: 'sys', tint: 0xe6b632, current: 100 },
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

			this.sprites[bar.id] = new PIXI.Graphics();
			this.sprites[bar.id].lineStyle(0);
			this.sprites[bar.id].beginFill(bar.tint);
			this.sprites[bar.id].drawRect(0, this.currentY, this.barsWidth, 2);
			this.sprites[bar.id].endFill();
			this.sprites[bar.id].position.x = this.barsX;
			this.sprites[bar.id].pivot.x = 0;

			if (bar.id === 'sys') {
				this.sprites[bar.id + 'Bg'].alpha = 0;
				this.sprites[bar.id].alpha = 0;
			} else {
				this.sprites[bar.id + 'Bg'].alpha = 0.3;
				this.sprites[bar.id].alpha = 0.8;
			}

			this.addChild(this.sprites[bar.id + 'Bg']);
			this.addChild(this.sprites[bar.id]);

			this.currentY += 4;
		});

		this.sprites['isDisabled'] = new PIXI.Graphics();
		this.sprites['isDisabled'].lineStyle(1, 0xffffff, 1);
		this.sprites['isDisabled'].moveTo(-3, -3);
		this.sprites['isDisabled'].lineTo(3, 3);
		this.sprites['isDisabled'].moveTo(-3, 3);
		this.sprites['isDisabled'].lineTo(3, -3);
		if (this.hasShields) {
			this.sprites['isDisabled'].position.y = 5;
		} else {
			this.sprites['isDisabled'].position.y = 7;
		}
		this.sprites['isDisabled'].alpha = 0;

		this.addChild(this.sprites['isDisabled']);
	}

	update(precentages, isDisabled = false, show = false) {
		if (!show && this.isShowing) {
			this.alpha = 0;
			this.isShowing = false;
			return;
		} else if (show && !this.isShowing) {
			this.alpha = 1;
			this.isShowing = true;
		}

		this.bars.forEach((bar) => {
			if (precentages[bar.id] === bar.current) return;

			if (bar.id === 'shields' && !this.hasShields) return;

			this.sprites[bar.id].width = Math.round(
				(precentages[bar.id] / 100) * this.barsWidth
			);

			if (bar.id === 'sys' && precentages.sys < 100 && !this.sysIsShowing) {
				this.sprites['sysBg'].alpha = 0.3;
				this.sprites['sys'].alpha = 0.8;
				this.sysIsShowing = true;
			}

			bar.current = precentages[bar.id];
		});

		if (isDisabled && !this.isDisabled) {
			this.sprites['isDisabled'].alpha = 1;
			this.isDisabled = true;
		}
	}
}
