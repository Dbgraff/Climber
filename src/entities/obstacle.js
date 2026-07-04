import { Graphics } from "pixi.js";
import { OBSTACLE } from "../utils/constans";

export class Obstacle {
    constructor(x) {
        this.width = OBSTACLE.MIN_WIDTH + Math.random() * (OBSTACLE.MAX_WIDTH - OBSTACLE.MIN_WIDTH);
        this.height = OBSTACLE.MIN_HEIGHT + Math.random() * (OBSTACLE.MAX_HEIGHT - OBSTACLE.MIN_HEIGHT);

        this.grafics = new Graphics();
        this.draw();
        this.grafics.x = x;
        this.grafics.y = -this.height; // спавн над экраном
    }

    draw() {
        const g = this.grafics;
        g.clear();
        g.rect(0, 0, this.width, this.height);
        g.fill({ color: OBSTACLE.COLOR});
    }

    update(dt, scrollSpeed) {
        this.grafics.y += scrollSpeed * dt;
    }

    isOffScreen(screenHeight) {
        return this.grafics.y > screenHeight + 50;
    }

    getBounds() {
        return {
            x: this.grafics.x,
            y: this.grafics.y,
            width: this.width,
            height: this.height
        };
    }

    destroy() {
        this.grafics.destroy();
    }
}