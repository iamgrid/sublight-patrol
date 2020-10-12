import * as PIXI from './pixi';
import c from './utils/constants';
import initialGameState from './initialGameState';
import mainReducer from './reducers/mainReducer';
import useReducer from './utils/useReducer';
import Keyboard from 'pixi.js-keyboard';
import StarScapeLayer from './components/StarscapeLayer';
import entities from './entities/entities';
import Fenrir from './entities/ships/Fenrir';

export default class App extends PIXI.Application {
	constructor() {
		super({
			width: c.gameCanvas.width,
			height: c.gameCanvas.height,
			antialias: true,
		});

		// https://pixijs.download/dev/docs/PIXI.settings.html
		// PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

		document.body.appendChild(this.view); // Create Canvas tag in the body

		this.init();

		const [state, dispatch] = useReducer(mainReducer, initialGameState);

		this.gameState = state;
		this.dispatch = dispatch;

		this.pixiState = this.play;

		// this.startTime = new Date().getTime();

		entities.init();

		console.log(entities.types);
	}

	init() {
		this.loader.add('spriteSheet', './assets/sprite_sheet_v1.png');

		this.loader.load(this.draw.bind(this));
	}

	draw() {
		this.spriteSheet = PIXI.Texture.from('spriteSheet');
		this.handlers = [this.dispatch, this.spriteSheet, this.stage];

		this.fenrir = new Fenrir({ spriteSheet: this.spriteSheet });

		this.starScapeLayers = c.starScapeLayers.map(
			(el) => new StarScapeLayer(el)
		);

		this.starScapeLayers.forEach((el) => this.stage.addChild(el));

		this.stage.addChild(this.fenrir);

		this.fenrir.position.set(400, 200);

		entities.spawn(
			'valkyrie',
			{
				posX: 800,
				posY: 200,
				latVelocity: 0,
				longVelocity: 0,
			},
			this.handlers
		);

		entities.spawn(
			'valkyrie',
			{
				posX: 700,
				posY: 200,
				latVelocity: 0,
				longVelocity: 0,
			},
			this.handlers
		);

		entities.spawn(
			'valkyrie',
			{
				posX: 600,
				posY: 200,
				latVelocity: 0,
				longVelocity: 0,
			},
			this.handlers
		);

		console.log(this.gameState().entities);

		this.pixiState = this.play;

		// Create an update loop
		this.ticker.add(this.gameLoop.bind(this));
	}

	gameLoop(delta) {
		// const currentTime = new Date().getTime();
		// const elapsedTime = currentTime - this.startTime;
		// console.log(elapsedTime.toLocaleString());
		this.pixiState(delta);
		this.starScapeLayers.forEach((el) => el.onUpdate(delta));
		Keyboard.update();
	}

	play(delta) {
		const currentState = this.gameState();

		const speed = 5 * delta;

		// Keyboard
		if (Keyboard.isKeyDown('ArrowLeft', 'KeyA')) {
			this.dispatch({
				type: c.actions.MOVE_PLAYER,
				axis: 'x',
				value: -speed,
			});
		}
		if (Keyboard.isKeyDown('ArrowRight', 'KeyD')) {
			this.dispatch({
				type: c.actions.MOVE_PLAYER,
				axis: 'x',
				value: speed,
			});
		}

		if (Keyboard.isKeyDown('ArrowUp', 'KeyW')) {
			this.dispatch({
				type: c.actions.MOVE_PLAYER,
				axis: 'y',
				value: -speed,
			});
		}
		if (Keyboard.isKeyDown('ArrowDown', 'KeyS')) {
			this.dispatch({
				type: c.actions.MOVE_PLAYER,
				axis: 'y',
				value: speed,
			});
		}

		this.fenrir.position.set(currentState.player.x, currentState.player.y);
	}
}
