import { Container, Graphics } from "pixi.js";
import { PLAYER } from "../utils/constans";

export class Player {
    constructor() {
        this.x = PLAYER.START_X;
        this.y = PLAYER.START_Y;
        this.width = PLAYER.WIDTH;
        this.height = PLAYER.HEIGHT;
        this.vy = 0;

        this.container = new Container();
        this.graphics = new Graphics();
        this.draw();
        this.container.addChild(this.graphics);

        this.container.x = this.x;
        this.container.y = this.y;
    }

    draw() {
        const g = this.graphics;
        g.clear();
        g.rect(-this.width / 2, -this.height / 2, this.width, this.height);
        g.fill({color: "#e94560"})
    }

    update(dt, isPressed, physics){
        physics.applyGravity(this, dt);

        if (isPressed) {
            this.vy = Math.min(this.vy, PLAYER.CLIMB_FORCE);
            this.vy += PLAYER.CLIMB_FORCE * 0.5 * dt;
        }

        physics.clampSpeed(this, PLAYER.MAX_SPEED);
        this.container.y += this.vy * dt;
    }

    getBounds() {
        return {
            x: this.container.x - this.width / 2,
            y: this.container.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}

