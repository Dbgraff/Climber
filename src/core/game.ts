import { Application, Container, Graphics, Text } from "pixi.js";
import { Player } from "../entities/player";
import { WallGenerator } from "../system/wallGenerator";
import { Hold } from "../entities/hold";
import { GAME_WIDTH, GAME_HEIGHT, BG_COLOR, HOLD, CAMERA } from "../utils/constans";
import { GameState } from "./types";

export class Game {
    readonly app: Application;
    state: GameState = 'menu';

    private stage: Container;
    readonly layers: {
        bg: Container;
        wall: Container;
        player: Container;
        ui: Container;
    };

    private wall: WallGenerator;
    private player: Player | null = null;

    private cameraY = 0;
    private score = 0;
    private scoreText: Text;
    private dt = 0;

    constructor(app: Application) {
        this.app = app;

        this.stage = new Container();
        this.app.stage.addChild(this.stage);
        this.app.stage.eventMode = 'static';

        this.layers = {
            bg: new Container(),
            wall: new Container(),
            player: new Container(),
            ui: new Container(),
        };

        for (const layer of Object.values(this.layers)) {
            this.stage.addChild(layer);
        }

        this.drawBackground();

        this.wall = new WallGenerator(this);

        this.scoreText = new Text({
            text: '0 m',
            style: { fill: '#f2ead8', fontSize: 20, fontFamily: 'sans-serif' }
        });
        this.scoreText.x = 12;
        this.scoreText.y = 10;
        this.layers.ui.addChild(this.scoreText);

        window.addEventListener('keydown', (event) => {
            if(event.code === 'Escape') this.togglePause();
        });
    }

    private drawBackground() {
        const g = new Graphics();
        g.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        g.fill({ color: BG_COLOR });

        for (let i = 0; i < 40; i++) {
            const x = Math.random() * GAME_WIDTH;
            const y = Math.random() * GAME_HEIGHT;
            const r = 6 + Math.random() * 18;
            g.circle(x, y, r);
            g.fill({ color: 0x000000, alpha: 0.08 + Math.random() * 0.06 });
        }

        this.layers.bg.addChild(g);
    }

    start() {
        this.app.ticker.add((ticker) => {
            this.dt = ticker.deltaTime / 60;
            this.update();
        });

        this.setState('playing');
    }
    setState(newState: GameState) {
        this.state = newState;

        if (newState === 'playing') {
            this.startGame();
        } else if (newState === 'gameover') {
            this.endGame();
        }
    }

    private startGame() {
        if (this.player) this.player.destroy();
        this.layers.player.removeChildren();

        this.score = 0;
        this.cameraY = 0;
        this.layers.wall.y = 0;
        this.layers.player.y = 0;
        this.layers.bg.y = 0;

        const startHold = this.wall.reset(0);
        this.player = new Player(startHold);
        this.layers.player.addChild(this.player.container);
    }

    private togglePause() {
        if (this.state === 'playing') this.setState('paused');
        else 
            if (this.state === 'paused') this.setState('playing');

    }

    private endGame() {
        console.log('Игра окончена | Высота: ', Math.floor(this.score), 'м');
        setTimeout(() => this.setState('playing'), 1600);
    }

    onHoldClicked(hold: Hold) {
        if (this.state !== 'playing' || !this.player) return;
        if (hold.isBroken) return;
        if (this.player.isBusy) return;
        if (hold.id === this.player.currentHoldId) return; // клик по своему же зацепу ничего не даёт

        const dist = hold.distanceTo(this.player.worldX, this.player.worldY);
        if (dist > HOLD.CLICK_REACH) return; // не дотянуться

        this.player.moveTo(hold);
    }

    private update() {
        if (this.state !== 'playing' || !this.player) return;

        const dt = this.dt;

        this.player.update(dt);

        if (this.player.justArrived) {
            this.wall.getHoldById(this.player.currentHoldId)?.resetTimer();
        }

        const brokeUnderPlayer = this.wall.update(dt, this.player.worldY, this.player.currentHoldId);

        if (brokeUnderPlayer && !this.player.isBusy) {
            this.setState('gameover');
            return;
        }

        this.score = Math.max(this.score, -this.player.worldY / 10);
        this.scoreText.text = `${Math.floor(this.score)} м`;

        // камера плавно "нагоняет" игрока, удерживая его на фиксированной высоте экрана
        const targetCameraY = CAMERA.ANCHOR_Y - this.player.worldY;
        const t = 1 - Math.exp(-CAMERA.FOLLOW_SPEED * dt);
        this.cameraY += (targetCameraY - this.cameraY) * t;

        this.layers.wall.y = this.cameraY;
        this.layers.player.y = this.cameraY;
        this.layers.bg.y = this.cameraY * CAMERA.PARALLAX_BG;
    }
}