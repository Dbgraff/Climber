import { Obstacle } from "../entities/obstacle";
import { SPAWN } from "../utils/constans";

export class Spawner {
    constructor(game) {
        this.game = game;
        this.obstacles = [];
        this.timer = 0;
        this.minX = 20;
        this.maxX = game.app.screen.width - 90;
    }

    update(dt, scrollSpeed, score) {
        for (let i = this.obstacles.length - 1; i >= 0; i--){
            const obs = this.obstacles[i];
            obs.update(dt, scrollSpeed);

            if (obs.isOffScreen(this.game.app.screen.height)) {
                this.game.layers.obstacles.removeChild(obs.grafics);
                obs.destroy();
                this.obstacles.splice(i, 1);
            }
        }

        this.timer += dt;

        const interval = Math.max(
            SPAWN.MIN_INTERVAL,
            SPAWN.BASE_INTERVAL - score * 0.0005
        );

        if(this.timer >= interval) {
            this.timer = 0;
            this.spawnObstacle();
        }
    }

    spawnObstacle() {
        const x = this.minX + Math.random() * (this.maxX - this.minX);
        const obs = new Obstacle(x);
        this.game.layers.obstacles.addChild(obs.grafics);
        this.obstacles.push(obs)
    }

    getObstacles(){
        return this.obstacles;
    }

    destroy() {
        for (const obs of this.obstacles){
            obs.destroy();
        }
        this.obstacles = [];
    }
}