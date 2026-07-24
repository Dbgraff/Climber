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
    
    private readonly character: Container;
    private readonly body: Graphics;
    private readonly head: Graphics;
    private readonly leftArm: Graphics;
    private readonly rightArm: Graphics;
    private readonly leftLeg: Graphics;
    private readonly rightLeg: Graphics;
    
    constructor(startHold: Hold) {
        this.worldX = startHold.worldX;
        this.worldY = startHold.worldY;
        this.currentHoldId = startHold.id;

        this.container = new Container();
        
        this.character = new Container();
        this.body = new Graphics();
        this.head = new Graphics();
        this.leftArm = new Graphics();
        this.rightArm = new Graphics();
        this.leftLeg = new Graphics();
        this.rightLeg = new Graphics();

        this.draw();

        this.character.addChild(
            this.leftLeg,
            this.rightLeg,
            this.body,
            this.leftArm,
            this.rightArm,
            this.head
        );

        this.container.addChild(this.character);

        this.container.x = this.worldX;
        this.container.y = this.worldY;
    }

    private draw() {
        this.body.clear();
        this.body.roundRect(-7, -18, 14, 20, 5)
            .fill({color: "#8f2939"});
        
        this.head.clear();
        this.head.circle(0, -26, 7)
            .fill({color: "#d49a76"});
        
        // this.head.moveTo(-8, -26)
        //     .arc(0, -26, 7,  Math.PI, Math.PI * 2)
        //     .stroke({
        //         width: 3.5,
        //         color: "#ff7700"
        //     });
        
        this.leftArm.clear();
        this.leftArm.moveTo(-6, -14)
                    .lineTo(-15, -4)
                    .stroke({
                        width: 4,
                        color: "#d49a76",
                        cap: 'round'
                    });

        this.rightArm.clear();
        this.rightArm.moveTo(6, -14)
                    .lineTo(15, -4)
                    .stroke({
                        width: 4,
                        color: "#d49a76",
                        cap: 'round'
                    });

        this.leftLeg.clear();
        this.leftLeg.moveTo(-4, 2)
                    .lineTo(-10, 13)
                    .stroke({
                        width: 4,
                        color: "#343247",
                        cap: 'round'
                    });

        this.rightLeg.clear();
        this.rightLeg.moveTo(4, 2)
                    .lineTo(10, 13)
                    .stroke({
                        width: 4,
                        color: "#343247",
                        cap: 'round'
                    });
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

        const swing = Math.sin(this.moveT * Math.PI * 4) * 0.15;
        this.character.rotation = swing;
        this.leftArm.rotation = -swing * 2;
        this.rightArm.rotation = swing * 2;
        this.leftLeg.rotation = swing;
        this.rightLeg.rotation = -swing;
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