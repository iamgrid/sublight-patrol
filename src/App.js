import * as PIXI from './pixi';
import c from './utils/constants';
import Keyboard from 'pixi.js-keyboard';
import StarScapeLayer from './components/StarscapeLayer';
import Fenrir from './components/Fenrir';

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

		this.gameState = {
			player: {
				x: 100,
				y: 100,
			},
		};

		// this.startTime = new Date().getTime();
	}

	init() {
		this.loader.add('spriteSheet', './assets/sprite_sheet_v1.png');

		this.loader.load(this.draw.bind(this));
	}

	draw() {
		this.spriteSheet = PIXI.Texture.from('spriteSheet');

		this.fenrir = new Fenrir({ spriteSheet: this.spriteSheet });

		this.starScapeLayers = c.starScapeLayers.map(
			(el) => new StarScapeLayer(el)
		);

		this.starScapeLayers.forEach((el) => this.stage.addChild(el));

		this.stage.addChild(this.fenrir);

		this.fenrir.position.set(400, 200);

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

		// Keyboard
		if (Keyboard.isKeyDown('ArrowLeft', 'KeyA'))
			this.gameState.player.x -= speed;
		if (Keyboard.isKeyDown('ArrowRight', 'KeyD'))
			this.gameState.player.x += speed;

		if (Keyboard.isKeyDown('ArrowUp', 'KeyW')) this.gameState.player.y -= speed;
		if (Keyboard.isKeyDown('ArrowDown', 'KeyS'))
			this.gameState.player.y += speed;

		this.fenrir.position.set(this.gameState.player.x, this.gameState.player.y);
	}
}
