import { Application } from 'pixi.js';
import { Game } from './core/Game.js';
import { GAME_WIDTH, GAME_HEIGHT, BG_COLOR } from './utils/constans';

async function init() {
    const app = new Application();

    await app.init({
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        backgroundColor: BG_COLOR,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    });

    document.body.appendChild(app.canvas);

    const game = new Game(app);
    game.start();
}

init();