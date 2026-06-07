import { Container, Graphics } from "pixi.js";
import { PLAYER } from "../utils/constans";

export class PLayer {
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
}

