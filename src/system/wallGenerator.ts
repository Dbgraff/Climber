import { Hold } from "../entities/hold";
import { WALL, GAME_WIDTH } from "../utils/constans"; 
import { Game } from "../core/game";

function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
}
 
export class WallGenerator {
    private game: Game;
    private holds: Hold[] = [];
    private highestWorldY = 0; 

    private lastHold: Hold | null = null;
 
    constructor(game: Game) {
        this.game = game;
    }
 
    reset(startWorldY: number): Hold {
        
        for (const hold of this.holds) hold.destroy();

        this.holds = [];
        this.highestWorldY = startWorldY;
        this.lastHold = null;

        const startHold = new Hold(
            GAME_WIDTH / 2, 
            startWorldY, 
            true
        );

        this.addHold(startHold);
        this.lastHold = startHold;
 
        for (let i = 0; i < WALL.ROWS_AHEAD; i++) {
            this.generateNextRow();
        }
 
        return startHold;
    }
 
    private addHold(hold: Hold) {
        this.holds.push(hold);
        this.game.layers.wall.addChild(hold.graphics);
        hold.graphics.on(
            'pointerdown', 
            () => this.game.onHoldClicked(hold)
        );
    }

    removeHold(hold: Hold) {
        const index = this.holds.indexOf(hold);
        
        if(index === -1) return;

        this.game.layers.wall.removeChild(hold.graphics);
        hold.destroy();

        this.holds.splice(index, 1);
    }
 
    private generateNextRow() {
        if(!this.lastHold) return;

        const previous = this.lastHold;
        const minVerticalDistance = 55;
        const maxVerticalDistance = 105;

        const verticalDistance = minVerticalDistance + Math.random() * (maxVerticalDistance - minVerticalDistance);

        const newY = previous.worldY - verticalDistance;
        
        const maxHorizontalDistance = WALL.REACH_X * 0.9;
        const minX = Math.max(WALL.MARGIN_X, previous.worldX - maxHorizontalDistance);
        const maxX = Math.min(GAME_WIDTH - WALL.MARGIN_X, previous.worldX + maxHorizontalDistance);

        const newX = minX + Math.random() * (maxX - minX);

        const newHold = new Hold(
            clamp(
                newX,
                WALL.MARGIN_X,
                GAME_WIDTH - WALL.MARGIN_X
            ),
            newY
        );

        this.addHold(newHold);

        this.lastHold = newHold;
        this.highestWorldY = Math.min(this.highestWorldY, newY);

        if(Math.random() < 0.45) {
            this.generateOptionalHold(newHold);
        }
    }

    private generateOptionalHold(baseHold: Hold) {
        const sideDistance = 45 + Math.random() * 70;
        const direction = Math.random() < 0.5 ? -1 : 1;

        const x = clamp(
            baseHold.worldX + sideDistance * direction,
            WALL.MARGIN_X,
            GAME_WIDTH - WALL.MARGIN_X
        );

        const y = baseHold.worldY + (Math.random() - 0.5) * 35;

        this.addHold(new Hold(x,y));
    }
 
    update(dt: number, playerWorldY: number, playerCurrentHoldId: number): Hold | null {
        while (this.highestWorldY > playerWorldY - WALL.ROWS_AHEAD * WALL.ROW_HEIGHT) {
            this.generateNextRow();
        }
 
        let brokenHold: Hold | null = null;
 
        for (let i = this.holds.length - 1; i >= 0; i--) {
            const hold = this.holds[i];
 
            if (hold.id === playerCurrentHoldId) {
                if (hold.update(dt) === 'broke') {
                    brokenHold = hold;
                    break;
                }
            }
 
            if (hold.worldY > playerWorldY + WALL.CULL_BELOW) {
                this.game.layers.wall.removeChild(hold.graphics);
                hold.destroy();
                this.holds.splice(i, 1);
            }
        }
 
        return brokenHold;
    }
 
    getHoldById(id: number): Hold | undefined {
        return this.holds.find(h => h.id === id);
    }
 
    destroy() {
        for (const hold of this.holds) hold.destroy();
        this.holds = [];
        this.lastHold = null;
    }
}