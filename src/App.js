import * as PIXI from './pixi';
import c from './utils/constants';
import {
	fromSpriteSheet,
	dialog,
	alertsAndWarnings,
	status,
} from './utils/helpers';
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
		document.getElementById('game').appendChild(this.view); // Create Canvas tag in the body
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

		this.paused = false;
		this.pixiState = this.play;

		this.startTime = new Date().getTime();
		this.gameTime = 0;

		console.log(entities.types);
		console.log(story);
	}

	init() {
		entities.init();
		c.init();
		status.init();

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
		this.pixiState(delta);
		Keyboard.update();
	}

	play(delta) {
		this.starScapeLayers.forEach((el) => el.onUpdate(delta));
		const currentState = this.gameState();

		const speed = 5 * delta;

		// Keyboard
		// https://www.npmjs.com/package/pixi.js-keyboard
		if (Keyboard.isKeyDown('ArrowLeft')) {
			this.dispatch({
				type: c.actions.MOVE_PLAYER,
				axis: 'x',
				value: -speed,
			});
		}
		if (Keyboard.isKeyDown('ArrowRight')) {
			this.dispatch({
				type: c.actions.MOVE_PLAYER,
				axis: 'x',
				value: speed,
			});
		}

		if (Keyboard.isKeyDown('ArrowUp')) {
			this.dispatch({
				type: c.actions.MOVE_PLAYER,
				axis: 'y',
				value: -speed,
			});
		}
		if (Keyboard.isKeyDown('ArrowDown')) {
			this.dispatch({
				type: c.actions.MOVE_PLAYER,
				axis: 'y',
				value: speed,
			});
		}

		if (Keyboard.isKeyPressed('Escape')) {
			this.togglePause();
		}

		this.fenrir.position.set(currentState.player.x, currentState.player.y);

		this.gameTime += this.ticker.deltaMS;

		if (!this.triggered1 && this.gameTime > 2000) {
			dialog(
				'Commander Shepherd',
				"Since our time together is coming to a close, I'd like to tell you on behalf of the team that we really loved having you with us, getting clear-eyed feedback on the Valkyrie's control scheme and calibration from a fresh graduate's perspective turned out to be a huge help."
			);
			alertsAndWarnings.add(c.alertsAndWarnings.warnings.collision);
			alertsAndWarnings.add(c.alertsAndWarnings.warnings.otherWarning);
			status.add('aqua', 'Aqua test. #1', this.gameTime);
			status.add('yellow', 'Yellow test. #2', this.gameTime);
			this.triggered1 = true;
		}

		if (!this.triggered2 && this.gameTime > 8000) {
			dialog('Love Eternal', 'Prepare to be assimilated.');
			alertsAndWarnings.remove(c.alertsAndWarnings.warnings.collision);
			alertsAndWarnings.add(c.alertsAndWarnings.alerts.systemsOffline);
			status.add('green', 'Green test. #3', this.gameTime);
			this.triggered2 = true;
		}

		if (!this.triggered3 && this.gameTime > 16000) {
			dialog('Death Herself', 'Resistance is futile.');
			alertsAndWarnings.remove(c.alertsAndWarnings.alerts.systemsOffline);
			this.triggered3 = true;
		}

		if (!this.triggered4 && this.gameTime > 20000) {
			dialog('', '', true);
			alertsAndWarnings.remove(c.alertsAndWarnings.warnings.otherWarning);
			status.add('red', 'Red test. #4', this.gameTime);
			status.add('aqua', 'Aqua test. #5', this.gameTime);
			status.add('yellow', 'Yellow test. #6', this.gameTime);
			this.triggered4 = true;
		}
	}

	pause() {
		if (Keyboard.isKeyPressed('Escape')) {
			this.togglePause();
		}

		const statusProperDiv = document.getElementById('game__status-proper');

		if (status.store.length > 4) {
			if (Keyboard.isKeyDown('ArrowUp')) {
				statusProperDiv.scrollBy(0, -4);
			}
			if (Keyboard.isKeyDown('ArrowDown')) {
				statusProperDiv.scrollBy(0, 4);
			}
		}
	}

	togglePause() {
		const statusDiv = document.getElementById('game__status');
		const pauseDiv = document.getElementById('game__pause');
		if (!this.paused) {
			statusDiv.classList.add('game__status--expanded');
			pauseDiv.classList.add('game__pause--show');
			this.paused = true;
			this.pixiState = this.pause;
		} else {
			statusDiv.classList.remove('game__status--expanded');
			pauseDiv.classList.remove('game__pause--show');
			this.paused = false;
			this.pixiState = this.play;
		}
	}
}
