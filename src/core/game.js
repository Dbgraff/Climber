import { Container } from "pixi.js";
import { Input } from "./input";
import { Player } from "../entities/player";
import { Physics } from "../system/physics";
import { Spawner } from "../system/spawner";
import { SCROLL } from "../utils/constans";

export class Game {
    constructor(app){
        this.app = app;
        this.state = 'menu';

        this.stage = new Container();
        this.app.stage.addChild(this.stage);

        this.layers = {
            bg: new Container(),
            obstacles: new Container(),
            player: new Container(),
            ui: new Container()
        };
        
        for (const layer of Object.values(this.layers)){
            this.stage.addChild(layer);
        }

        this.input = new Input(this.app.canvas);
        this.physics = new Physics();
        this.spawner = new Spawner(this);

        this.player = null;
        this.scrollSpeed = SCROLL.BASE_SPEED;
        this.score = 0;
        
        this.dt = 0;
    }

    start() {
        this.app.ticker.add((ticker) => {
            this.dt = ticker.deltaTime / 60;
            this.update();
        });

        this.setState('playing');
    }

    setState(newState) {
        this.state = newState;

        if (newState === 'playing') {
            this.startGame();
        } else if (newState === 'gameover') {
            this.endGame();
        }
    }

    checkCollision() {
        const playerBounds = this.player.getBounds();

        for(const obs of this.spawner.getObstacles()){
            if (this.physics.checkAABB(playerBounds, obs.getBounds())){
                this.setState('gameover');
                return;
            }
        }
    }

    startMenu(){
        console.log("same menu");

        this.setState('playing'); //пока сразу запускаем игру
    }

    startGame() {
        console.log('start game');

        if (this.spawner) this.spawner.destroy();
        if (this.player) this.player.destroy();

        for (const layer of Object.values(this.layers)) {
            layer.removeChildren();
        }

        this.scrollSpeed = SCROLL.BASE_SPEED;
        this.score = 0;
        this.spawner = new Spawner(this);

        this.player = new Player();
        this.layers.player.addChild(this.player.container);

        this.input.enable();
    }

    endGame() {
        console.log('end game');

        this.input.disable();
        console.log('Game over | Score: ', Math.floor(this.score));

        setTimeout(() => this.setState('playing'), 2000);
    }

    update(){
        if (this.state !== 'playing') return;

        const dt = this.dt;

        this.scrollSpeed += SCROLL.ACCELERATION * dt;
        this.score += this.scrollSpeed * dt / 10;

        this.player.update(dt, { x: this.input.pointerX, y: this.input.pointerY });
        this.spawner.update(dt, this.scrollSpeed, this.score);

        this.checkCollision();
    }
}