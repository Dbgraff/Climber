import { Container, Graphics } from "pixi.js";
import { PLAYER } from "../utils/constans";
import { Hold } from "./hold";

function easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export class Player {
    readonly width = PLAYER.WIDTH;
    readonly height = PLAYER.HEIGHT;

    worldX: number;
    worldY: number;
    currentHoldId: number;

    private isMoving = false;
    private arrivedThisFrame = false;
    private targetHoldId = -1;
    private fromX = 0;
    private fromY = 0;
    private toX = 0;
    private toY = 0;
    private moveT = 0;

    readonly container: Container;
    private readonly graphics: Graphics;

    constructor(startHold: Hold) {
        this.worldX = startHold.worldX;
        this.worldY = startHold.worldY;
        this.currentHoldId = startHold.id;

        this.container = new Container();
        this.graphics = new Graphics();
        this.draw();
        this.container.addChild(this.graphics);

        this.container.x = this.worldX;
        this.container.y = this.worldY;
    }

    private draw() {
        const g = this.graphics;
        g.clear();

        g.circle(0, -this.height / 2 + 6, 6);
        g.fill({ color: PLAYER.COLOR });

        g.roundRect(-this.width / 2, -this.height / 2 + 10, this.width, this.height - 10, 4);
    }

    get isBusy(): boolean {
        return this.isMoving;
    }

    get justArrived(): boolean {
        return this.arrivedThisFrame;
    }

    moveTo(hold: Hold){
        if (this.isMoving) return;

        this.fromX = this.worldX;
        this.fromY = this.worldY;
        this.toX = hold.worldX;
        this.toY = hold.worldY;
        this.moveT = 0;
        this.isMoving = true;
        this.targetHoldId = hold.id;
    }

    update(dt: number) {
        this.arrivedThisFrame = false;
        if (!this.isMoving) return;
 
        this.moveT += dt / PLAYER.MOVE_DURATION;
 
        if (this.moveT >= 1) {
            this.moveT = 1;
            this.isMoving = false;
            this.currentHoldId = this.targetHoldId;
            this.arrivedThisFrame = true;
        }
 
        const eased = easeInOutQuad(this.moveT);
        this.worldX = this.fromX + (this.toX - this.fromX) * eased;
        this.worldY = this.fromY + (this.toY - this.fromY) * eased;
 
        this.container.x = this.worldX;
        this.container.y = this.worldY;
    }

    getBounds() {
        return {
            x: this.worldX - this.width / 2,
            y: this.worldY - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
 
    destroy() {
        this.container.destroy({ children: true });
    }
}