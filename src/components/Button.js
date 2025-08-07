import * as PIXI from '../pixi';
import soundEffects from '../audio/soundEffects';

export const BUTTON_STYLES = {
	A: 'A',
	B: 'B',
};

export default class Button extends PIXI.Container {
	constructor(props) {
		/*
			{
				coordsAndDimensions: {
					x:, 
					y:, 
					width:, 
					height: 
				},
				label: '',
				isFocused: false,
				isDisabled: false,
				doActivate: () => {}
			}
		*/
		super();
		this.coordsAndDimensions = props.coordsAndDimensions;
		this.label = props.label;
		this.isFocused = props.isFocused;
		this.isDisabled = false;
		if (props.isDisabled !== undefined) this.isDisabled = props.isDisabled;
		if (props.style !== undefined) {
			this.style = props.style;
		} else {
			this.style = BUTTON_STYLES.A;
		}
		this.activateFn = props.doActivate;
		this.sprites = {};
		this.blurredBorderAlpha = 0.5;
		this.focusedBorderAlpha = 1;

		this.sprites['bg'] = new PIXI.Graphics();

		this.sprites['bg'].lineStyle(0);
		if (this.style === BUTTON_STYLES.A) {
			this.bgColor = 0x606060;
		} else if (this.style === BUTTON_STYLES.B) {
			this.bgColor = 0x003a50;
		}
		if (this.isDisabled) this.bgColor = 0xa0a0a0;
		this.sprites['bg'].beginFill(this.bgColor, 1);
		this.sprites['bg'].drawRoundedRect(
			this.coordsAndDimensions.x,
			this.coordsAndDimensions.y,
			this.coordsAndDimensions.width,
			this.coordsAndDimensions.height,
			8
		);
		this.sprites['bg'].endFill();

		this.sprites['border'] = new PIXI.Graphics();

		this.sprites['border'].lineStyle(3, 0xffffff);
		this.sprites['border'].drawRoundedRect(
			this.coordsAndDimensions.x,
			this.coordsAndDimensions.y,
			this.coordsAndDimensions.width,
			this.coordsAndDimensions.height,
			8
		);
		this.sprites['border'].alpha = this.isFocused
			? this.focusedBorderAlpha
			: this.blurredBorderAlpha;

		this.sprites['label'] = new PIXI.Text(this.label, {
			fontSize: 12,
			fill: 0xffffff,
			align: 'center',
		});

		this.sprites['label'].anchor.set(0.5);
		this.sprites['label'].position.x =
			this.coordsAndDimensions.x +
			Math.round(this.coordsAndDimensions.width / 2);
		this.sprites['label'].position.y =
			this.coordsAndDimensions.y +
			Math.round(this.coordsAndDimensions.height / 2) -
			1;

		this.addChild(this.sprites['bg']);
		this.addChild(this.sprites['border']);
		this.addChild(this.sprites['label']);
	}

	doFocus() {
		this.isFocused = true;
		this.sprites['border'].alpha = this.focusedBorderAlpha;
	}

	doBlur() {
		this.isFocused = false;
		this.sprites['border'].alpha = this.blurredBorderAlpha;
	}

	doActivate() {
		soundEffects.playOnce(null, soundEffects.library.menu_activate.id);
		this.activateFn();
	}
}
