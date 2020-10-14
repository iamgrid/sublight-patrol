import * as PIXI from './pixi';
import c from './utils/constants';
import { fromSpriteSheet, dialog } from './utils/helpers';
import initialGameState from './initialGameState';
import mainReducer from './reducers/mainReducer';
import useReducer from './utils/useReducer';
import Keyboard from 'pixi.js-keyboard';
import StarScapeLayer from './components/StarscapeLayer';
import entities from './entities/entities';
import Fenrir from './entities/ships/Fenrir';
import story from './story/story';

export default class App extends PIXI.Application {
	constructor() {
		super({
			width: c.gameCanvas.width,
			height: c.gameCanvas.height,
			antialias: true,
		});

		// https://pixijs.download/dev/docs/PIXI.settings.html
		// PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

		this.view.id = 'pixicanvas';
		document.getElementById('main').appendChild(this.view); // Create Canvas tag in the body
		document.getElementById('pixicanvas').tabIndex = 0;
		document.getElementById('pixicanvas').focus();

		this.init();

		this.triggered1 = false;
		this.triggered2 = false;
		this.triggered3 = false;
		this.triggered4 = false;

		const [state, dispatch] = useReducer(mainReducer, initialGameState);

		this.gameState = state;
		this.dispatch = dispatch;

		this.pixiState = this.play;

		this.startTime = new Date().getTime();

		entities.init();

		console.log(entities.types);
		console.log(story);
	}

	init() {
		this.loader.add('spriteSheet', './assets/sprite_sheet_v1.png');

		this.loader.load(this.draw.bind(this));
	}

	draw() {
		this.spriteSheet = PIXI.Texture.from('spriteSheet');
		fromSpriteSheet.defaultSpriteSheet = this.spriteSheet;

		this.handlers = [this.dispatch, this.stage];

		this.fenrir = new Fenrir();

		this.starScapeLayers = c.starScapeLayers.map(
			(el) => new StarScapeLayer(el)
		);

		this.starScapeLayers.forEach((el) => this.stage.addChild(el));

		this.stage.addChild(this.fenrir);

		this.fenrir.position.set(400, 200);

		entities.spawn(this.handlers, 'valkyrie', {
			posX: 800,
			posY: 225,
			latVelocity: 0,
			longVelocity: 0,
			playerRelation: 'friendly',
			id: 'valkyrie_1',
		});

		entities.spawn(this.handlers, 'valkyrie', {
			posX: 700,
			posY: 225,
			latVelocity: 0,
			longVelocity: 0,
			playerRelation: 'friendly',
			id: 'valkyrie_2',
		});

		entities.spawn(this.handlers, 'fenrir', {
			posX: 600,
			posY: 225,
			latVelocity: 0,
			longVelocity: 0,
			playerRelation: 'neutral',
		});

		console.log(this.gameState());

		this.pixiState = this.play;

		// Create an update loop
		this.ticker.add(this.gameLoop.bind(this));
	}

	gameLoop(delta) {
		const currentTime = new Date().getTime();
		const elapsedTime = currentTime - this.startTime;
		if (!this.triggered1 && elapsedTime > 2000) {
			dialog(
				'Commander Shepherd',
				"Since our time together is coming to a close, I'd like to tell you on behalf of the team that we really loved having you with us, getting clear-eyed feedback on the Valkyrie's control scheme and calibration from a fresh graduate's perspective turned out to be a huge help."
			);
			this.triggered1 = true;
		}

		if (!this.triggered2 && elapsedTime > 8000) {
			dialog('Love Eternal', 'Prepare to be assimilated.');
			this.triggered2 = true;
		}

		if (!this.triggered3 && elapsedTime > 16000) {
			dialog('Death Herself', 'Resistance is futile.');
			this.triggered3 = true;
		}

		if (!this.triggered4 && elapsedTime > 20000) {
			dialog('', '', true);
			this.triggered4 = true;
		}

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
