import { Container } from "pixi.js";
import { Input } from "./input";

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

        this.systems = {};
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

        for(const layer of Object.values(this.layers)) {
            layer.removeChildren();
        }

        switch (newState) {
            case 'menu':
                this.startMenu();
                break;
            case 'playing':
                this.startGame();
                break;
            case 'gameover':
                this.endGame();
                break;
        }
    }

    startMenu(){
        console.log("same menu");

        this.setState('playing'); //пока сразу запускаем игру
    }

    startGame() {
        console.log('start game');
    }

    endGame() {
        console.log('end game');
    }

    update(){
        if (this.state !== 'playing') return;

        //потом тут обновление всех систем сделать надо
    }
}