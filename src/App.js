import * as PIXI from './pixi';
import c from './utils/constants';
import Keyboard from 'pixi.js-keyboard';
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

		this.state = this.play;

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

		this.state = this.play;

		// Create an update loop
		this.ticker.add(this.gameLoop.bind(this));
	}

	gameLoop(delta) {
		// const currentTime = new Date().getTime();
		// const elapsedTime = currentTime - this.startTime;
		this.state(delta);
		this.starScapeLayers.forEach((el) => el.onUpdate(delta));
		Keyboard.update();
	}

	play(delta) {
		const speed = 5 * delta;
		const player = {
			x: 100,
			y: 100,
		};

		// Keyboard
		if (Keyboard.isKeyDown('ArrowLeft', 'KeyA')) player.x -= speed;
		if (Keyboard.isKeyDown('ArrowRight', 'KeyD')) player.x += speed;

		if (Keyboard.isKeyDown('ArrowUp', 'KeyW')) player.y -= speed;
		if (Keyboard.isKeyDown('ArrowDown', 'KeyS')) player.y += speed;

		// console.log(player.x, player.y);
	}
}
