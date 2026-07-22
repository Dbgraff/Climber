import { Graphics } from "pixi.js";
import { HOLD } from "../utils/constans";
import type { HoldType } from "../core/types";

let nextId = 0;

export class Hold {
    readonly id: number;
    readonly type: HoldType;
    readonly worldX: number;
    readonly worldY: number;
    readonly graphics: Graphics;

    standTimer = 0;
    isCrumbling = false;
    isBroken = false;

    constructor(worldX: number, worldY: number, forceStable = false) {
        this.id = nextId++;
        this.worldX = worldX;
        this.worldY = worldY;
        this.type = (!forceStable && Math.random() < HOLD.WEAK_CHANCE) ? 'weak' : 'stable';
        
        this.graphics = new Graphics();
        this.graphics.eventMode = 'static';
        this.graphics.cursor = 'pointer';
        this.graphics.x = worldX;
        this.graphics.y = worldY;

        this.draw();
    }

    private draw(){
        const g = this.graphics;
        g.clear();

        const color = this.isCrumbling ? HOLD.CRACK_COLOR : (this.type === 'weak' ? HOLD.WEAK_COLOR : HOLD.STABLE_COLOR);

        g.circle(0, 0, HOLD.RADIUS);
        g.fill({ color });

        if(this.type === 'weak' && !this.isCrumbling){
            g.moveTo(-6, -5);
            g.lineTo(5, 6);
            g.stroke({width: 2, color: HOLD.CRACK_COLOR});
        }
    }

    distanceTo(x: number, y: number): number {
        return Math.hypot(this.worldX - x, this.worldY - y);
    }

    update(dt: number): 'ok' | 'broke' {
        if (this.isBroken) return 'ok';

        this.standTimer += dt;
        const limit = this.type === 'weak' ? HOLD.WEAK_STAND_TIME : HOLD.STABLE_STAND_TIME;

        if (!this.isCrumbling && this.standTimer >= limit) {
            this.isCrumbling = true;
            this.draw();
        }

        if (this.isCrumbling) {
            const shake = Math.sin(this.standTimer * 45) * 2;
            this.graphics.x = this.worldX + shake;

            if (this.standTimer >= limit + HOLD.CRUMBLE_WARNING_TIME){
                this.isBroken = true;
                return 'broke'
            }
        }

        return 'ok';
    }

    resetTimer() {
        this.standTimer = 0;
        this.isCrumbling = false;
        this.graphics.x = this.worldX;
        this.draw();
    }

    destroy() {
        this.graphics.destroy();
    }
}