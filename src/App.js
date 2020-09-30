import * as PIXI from './pixi';
import c from './utils/constants';
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
	}

	init() {
		this.loader.load(this.draw.bind(this));
	}

	draw() {
		this.starScapeLayers = c.starScapeLayers.map(
			(el) => new StarScapeLayer(el)
		);

		this.starScapeLayers.forEach((el) => this.stage.addChild(el));

		// Create an update loop
		this.ticker.add(this.onUpdate.bind(this));
	}

	onUpdate(delta) {
		// const currentTime = new Date().getTime();
		// const elapsedTime = currentTime - this.startTime;
		this.starScapeLayers.forEach((el) => el.onUpdate(delta));
	}
}
