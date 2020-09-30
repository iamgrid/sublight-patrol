import * as PIXI from './pixi';
import c from './utils/constants';
// import Starfield from './components/Starfield';
import StarScapeLayer from './components/StarscapeLayerWParticleContainer';
// import StarScapeLayer from './components/StarscapeLayer';

export default class App extends PIXI.Application {
	constructor() {
		super({
			width: c.gameCanvas.width,
			height: c.gameCanvas.height,
			/*antialias: true,*/
		});
		document.body.appendChild(this.view); // Create Canvas tag in the body

		this.init();

		// this.startTime = new Date().getTime();

		// window.addEventListener('resize', this.onResize.bind(this));
	}

	init() {
		// this.loader.add('starfield', './assets/starfield.png');
		this.loader.add('single_star', './assets/single_star.png');
		this.loader.load(this.draw.bind(this));
	}

	draw() {
		const starGraphic = new PIXI.Graphics();
		starGraphic.lineStyle(0);
		starGraphic.beginFill(0xffffff, 1);
		starGraphic.drawCircle(0, 0, 1);
		starGraphic.endFill();
		const starTexture = this.renderer.generateTexture(starGraphic);

		// this.starfield = new Starfield();

		this.starScapeLayers = c.starScapeLayers.map(
			(el) => new StarScapeLayer(el, starTexture)
		);

		this.starScapeLayers.forEach((el) => this.stage.addChild(el));

		// this.onResize();

		// Create an update loop
		this.ticker.add(this.onUpdate.bind(this));
	}

	onUpdate(delta) {
		// const currentTime = new Date().getTime();
		// const elapsedTime = currentTime - this.startTime;
		this.starScapeLayers.forEach((el) => el.onUpdate(delta));
	}

	/*onResize() {
		this.renderer.resize(window.innerWidth, window.innerHeight);
		// const { width, height } = this.renderer;
		// this.starfield.onResize(width, height);
	}*/
}
