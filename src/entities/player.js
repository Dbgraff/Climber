import { Container, Graphics } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH, PLAYER } from "../utils/constans";

export class Player {
    constructor() {
        this.width = PLAYER.WIDTH;
        this.height = PLAYER.HEIGHT;

        this.container = new Container();
        this.graphics = new Graphics();
        this.draw();
        this.container.addChild(this.graphics);

        this.container.x = PLAYER.START_X;
        this.container.y = PLAYER.START_Y;
    }

    draw() {
        const g = this.graphics;
        g.clear();
        g.rect(-this.width / 2, -this.height / 2, this.width, this.height);
        g.fill({color: "#e94560"})
    }

    update(dt, target){
        const t = 1 - Math.exp(-PLAYER.FOLLOW_SPEED * dt);

        this.container.x += (target.x - this.container.x) * t;
        this.container.y += (target.y - this.container.y) * t;

        const halfW = this.width / 2;
        const halfH = this.height / 2;
        this.container.x = Math.max(halfW, Math.min(GAME_WIDTH - halfW, this.container.x));
        this.container.y = Math.max(halfH, Math.min(GAME_HEIGHT - halfH, this.container.y));
    }

    getBounds() {
        return {
            x: this.container.x - this.width / 2,
            y: this.container.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    destroy() {
        this.container.destroy({children: true});
    }
}

