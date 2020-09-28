import * as PIXI from './pixi';

import Starfield from './components/Starfield';

export default class App extends PIXI.Application {
	constructor() {
		super({
			width: window.innerWidth,
			height: window.innerHeight,
		});
		document.body.appendChild(this.view); // Create Canvas tag in the body

		this.init();

		window.addEventListener('resize', this.onResize.bind(this));
	}

	init() {
		this.loader.add('starfield', './assets/starfield.png');
		this.loader.load(this.draw.bind(this));
		// testing 1-2-3
	}

	draw() {
		this.starfield = new Starfield();

		this.stage.addChild(this.starfield);

		this.onResize();

		// Create an update loop
		this.ticker.add(this.onUpdate.bind(this));
	}

	onUpdate(delta) {
		this.starfield.onUpdate(delta);
	}

	onResize() {
		this.renderer.resize(window.innerWidth, window.innerHeight);
		const { width, height } = this.renderer;
		this.starfield.onResize(width, height);
	}
}
