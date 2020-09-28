import * as PIXI from './pixi';
import c from './utils/constants';
// import Starfield from './components/Starfield';
import StarScapeLayer from './components/StarscapeLayer';

export default class App extends PIXI.Application {
	constructor() {
		super({
			width: c.gameCanvas.width,
			height: c.gameCanvas.height,
			antialias: true,
		});
		document.body.appendChild(this.view); // Create Canvas tag in the body

		this.init();

		// this.startTime = new Date().getTime();

		// window.addEventListener('resize', this.onResize.bind(this));
	}

	init() {
		this.loader.add('starfield', './assets/starfield.png');
		this.loader.load(this.draw.bind(this));
		// testing 1-2-3
	}

	draw() {
		// this.starfield = new Starfield();

		this.starScapeLayers = c.starScapeLayers.map(
			(el) => new StarScapeLayer(el)
		);

		this.starScapeLayers.forEach((el) => this.stage.addChild(el));

		// this.onResize();

		// Create an update loop
		this.ticker.add(this.onUpdate.bind(this));
	}

	onUpdate(delta) {
		// const currentTime = new Date().getTime();
		// const elapsedTime = currentTime - this.startTime;
		this.starScapeLayers.forEach((el) => el.onUpdate(delta * 3));
	}

	/*onResize() {
		this.renderer.resize(window.innerWidth, window.innerHeight);
		// const { width, height } = this.renderer;
		// this.starfield.onResize(width, height);
	}*/
}
