import { Application, Container, Graphics, Text, TilingSprite } from "pixi.js";
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

    private pauseOverlay: Container | null = null;
    private menuOverlay: Container | null = null;
    private gameOverOverlay: Container | null = null;
    private pauseButton!: Graphics;
    private bgSprite!: TilingSprite;

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

        this.setupPauseButton();

        window.addEventListener('keydown', (event) => {
            if(event.code === 'Escape') this.togglePause();
        });
    }

    private createOverlay(titleText: string, buttonText: string, onButtonClick: () => void, extraLines: string[] = []): Container {
        const overlay = new Container();

        const dim = new Graphics();
        dim.rect(0, 0, GAME_WIDTH, GAME_HEIGHT).fill({ color: "#000000", alpha: 0.65 });
        overlay.addChild(dim);

        const title = new Text({
            text: titleText,
            style: { fill: '#f2ead8', fontSize: 34, fontFamily: 'sans-serif', fontWeight: 'bold' }
        });
        title.anchor.set(0.5);
        title.x = GAME_WIDTH / 2;
        title.y = GAME_HEIGHT / 2 - 90;
        overlay.addChild(title);

        let lineY = GAME_HEIGHT / 2 - 40;
        for (const line of extraLines) {
            const lineText = new Text({
                text: line,
                style: { fill: '#c9bfd6', fontSize: 15, fontFamily: 'sans-serif', align: 'center' }
            });
            lineText.anchor.set(0.5);
            lineText.x = GAME_WIDTH / 2;
            lineText.y = lineY;
            overlay.addChild(lineText);
            lineY += 24;
        }

        const button = new Text({
            text: buttonText,
            style: { fill: '#f2ead8', fontSize: 22, fontFamily: 'sans-serif', fontWeight: 'bold' }
        });
        button.anchor.set(0.5);
        button.x = GAME_WIDTH / 2;
        button.y = GAME_HEIGHT / 2 + 70;
        button.eventMode = 'static';
        button.cursor = 'pointer';
        button.on('pointerdown', onButtonClick);
        overlay.addChild(button);

        return overlay;
    }

    private showMainMenu() {
        if (this.menuOverlay) return;

        this.menuOverlay = this.createOverlay(
            'СКАЛОЛАЗ',
            'НАЧАТЬ',
            () => {
                this.hideMainMenu();
                this.setState('playing');
            },
            [
                'Кликайте по зацепам, чтобы забраться выше.',
                'Некоторые из них обваливаются — не задерживайтесь.'
            ]
        );

        this.layers.ui.addChild(this.menuOverlay);
    }

    private hideMainMenu() {
        if (!this.menuOverlay) return;

        this.layers.ui.removeChild(this.menuOverlay);
        this.menuOverlay.destroy({ children: true });
        this.menuOverlay = null;
    }

    private showGameOverMenu() {
        if (this.gameOverOverlay) return;

        this.gameOverOverlay = this.createOverlay(
            'ВЫ СОРВАЛИСЬ',
            'ЗАНОВО',
            () => this.restartGame(),
            [`Высота: ${Math.floor(this.score)} м`]
        );

        this.layers.ui.addChild(this.gameOverOverlay);
    }

    private hideGameOverMenu() {
        if (!this.gameOverOverlay) return;

        this.layers.ui.removeChild(this.gameOverOverlay);
        this.gameOverOverlay.destroy({ children: true });
        this.gameOverOverlay = null;
    }

    private restartGame() {
        this.hideGameOverMenu();

        if (this.player) {
            this.player.destroy();
            this.player = null;
        }
        this.wall.destroy();

        this.setState('playing');
    }

    private setupPauseButton(){
        const btn = new Graphics();
        btn.roundRect(0, 0, 36, 36, 8);
        btn.fill({color: "#000000", alpha: 0.35});
        btn.eventMode = 'static';
        btn.cursor = 'pointer';
        btn.x = GAME_WIDTH - 48;
        btn.y = 10;
        btn.on('pointerdown', () => this.togglePause());

        const icon = new Text({
            text: '❚❚',
            style: { fill: '#f2ead8', fontSize: 16, fontFamily: 'sans-serif'}
        });
        icon.anchor.set(0.5);
        icon.x = 18;
        icon.y = 18;
        btn.addChild(icon);

        this.layers.ui.addChild(btn);

        this.pauseButton = btn;
    }

    private drawBackground() {
        const tileHeight = 420;
        const tile = new Graphics();

        tile.rect(0, 0, GAME_WIDTH, tileHeight);
        tile.fill({ color: BG_COLOR });

        const blobColors = [0x453552, 0x2e2436, 0x4d3d47, 0x3a2d3a];
        for (let i = 0; i < 14; i++) {
            this.drawRockBlob(
                tile,
                Math.random() * GAME_WIDTH,
                Math.random() * tileHeight,
                30 + Math.random() * 55,
                blobColors[Math.floor(Math.random() * blobColors.length)],
                0.45 + Math.random() * 0.2
            );
        }

        for (let i = 0; i < 10; i++){
            let x = Math.random() * GAME_WIDTH;
            let y = Math.random() * tileHeight;
            tile.moveTo(x, y);

            for (let seg = 0; seg < 3; seg++){
                x += (Math.random() - 0.5) * 40;
                y += 15 + Math.random() * 25;
                tile.lineTo(x, y);
            }

            tile.stroke({ width: 1.5, color: '#1c1420', alpha: 0.35});
        }

        for (let i = 0; i < 120; i++) {
            const x = Math.random() * GAME_WIDTH;
            const y = Math.random() * tileHeight;
            const r = 1 + Math.random() * 2.5;
            const light = Math.random() < 0.5;
            tile.circle(x, y, r);
            tile.fill({ color:  light ? 0x6b5a68 : 0x1c1420, alpha: 0.2 + Math.random() * 0.25});
        }

        const texture = this.app.renderer.generateTexture(tile);
        tile.destroy();

        this.bgSprite = new TilingSprite({
            texture,
            width: GAME_WIDTH,
            height: GAME_HEIGHT
        });
        this.layers.bg.addChild(this.bgSprite);
    }

    private drawRockBlob(g: Graphics, cx: number, cy: number, baseR: number, color: number, alpha: number) {
        const points: number[] = [];
        const segments = 8;

        for(let i = 0; i < segments; i++){
            const angle = (i / segments) * Math.PI * 2;
            const r = baseR * (0.7 + Math.random() * 0.6);
            points.push(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        }

        g.poly(points);
        g.fill({ color, alpha });
    }

    start() {
        this.app.ticker.add((ticker) => {
            this.dt = ticker.deltaTime / 60;
            this.update();
        });

        this.showMainMenu();
    }

    setState(newState: GameState) {
        this.state = newState;

        this.pauseButton.visible = (newState === 'playing' || newState === 'paused');

        if (newState === 'playing') {
            this.hidePauseMenu();

            if(!this.player){
                this.startGame();
            }

        } else if (newState === 'paused') {
            this.showPauseMenu();
        } else if (newState === 'gameover'){
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
        this.bgSprite.tilePosition.set(0, 0);

        const startHold = this.wall.reset(0);
        this.player = new Player(startHold);
        this.layers.player.addChild(this.player.container);
    }

    private togglePause() {
        if (this.state === 'playing') this.setState('paused');
        else 
            if (this.state === 'paused') this.setState('playing');
    }

    private showPauseMenu() {
        if(this.pauseOverlay) return;

        const overlay = new Container();
        const background = new Graphics();

        background.rect(0, 0, GAME_WIDTH, GAME_HEIGHT)
            .fill({
                color: "#000000",
                alpha: 0.65
            });
        
        const title = new Text({
            text: 'ПАУЗА',
            style: {
                fill: '#f2ead8',
                fontSize: 42,
                fontFamily: 'sans-serif',
                fontWeight: 'bold'            
            }
        });

        title.anchor.set(0.5);
        title.x = GAME_WIDTH / 2;
        title.y = GAME_HEIGHT / 2 - 60;

        const continueButton = new Text({
            text: 'ПРОДОЛЖИТЬ',
            style: {
                fill: '#f2ead8',
                fontSize: 22,
                fontFamily: 'sans-serif'
            }
        });
        continueButton.anchor.set(0.5);
        continueButton.x = GAME_WIDTH / 2;
        continueButton.y = GAME_HEIGHT /2 + 20;
        
        continueButton.eventMode = 'static';
        continueButton.cursor = 'pointer';
        
        continueButton.on('pointerdown', () => {
            this.setState('playing');
        });

        overlay.addChild(
            background,
            title,
            continueButton
        );

        this.layers.ui.addChild(overlay);
        this.pauseOverlay = overlay;
    }

    private hidePauseMenu(){
        if (!this.pauseOverlay) return;

        this.layers.ui.removeChild(this.pauseOverlay);
        this.pauseOverlay.destroy({
            children: true
        });

        this.pauseOverlay = null;
    }

    private endGame() {
        console.log('Игра окончена | Высота: ', Math.floor(this.score), 'м');
        this.showGameOverMenu();
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

        if (brokeUnderPlayer) {
            this.wall.removeHold(brokeUnderPlayer);
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
        this.bgSprite.tilePosition.y = this.cameraY * CAMERA.PARALLAX_BG;
    }
}