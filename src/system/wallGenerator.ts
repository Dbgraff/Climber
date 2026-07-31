import { Hold } from "../entities/hold";
import { WALL, GAME_WIDTH, HOLD } from "../utils/constans"; 
import { Game } from "../core/game";

function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
}
 
export class WallGenerator {
    private game: Game;
    private holds: Hold[] = [];
    private highestWorldY = 0; 

    private frontier: Hold[] = [];
 
    constructor(game: Game) {
        this.game = game;
    }
 
    reset(startWorldY: number): Hold {
        for (const hold of this.holds) hold.destroy();

        this.holds = [];
        this.highestWorldY = startWorldY;

        const startHold = new Hold(
            GAME_WIDTH / 2, 
            startWorldY, 
            true
        );

        this.addHold(startHold);
        this.frontier = [startHold];
 
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

    private placeNear(parent: Hold, verticalDistance: number): Hold {
        const newY = parent.worldY - verticalDistance;

        const safeReach = HOLD.CLICK_REACH * 0.85;
        const maxHorizontal = Math.sqrt(Math.max(0, safeReach ** 2 - verticalDistance ** 2));
        
        const newX = clamp(
            parent.worldX + (Math.random() * 2 - 1) * maxHorizontal,
            WALL.MARGIN_X,
            GAME_WIDTH - WALL.MARGIN_X
        );

        const hold = new Hold(newX, newY);
        this.addHold(hold);
        return hold;
    }
 
    private generateNextRow() {
        if(this.frontier.length === 0) return;

        const minVerticalDistance = 55;
        const maxVerticalDistance = 105;

        const nextFrontier: Hold[] = [];

        for (const parent of this.frontier) {
            if (nextFrontier.length >= WALL.HOLDS_PER_ROW_MAX) break;

            const verticalDistance = minVerticalDistance + Math.random() * (maxVerticalDistance - minVerticalDistance);
            nextFrontier.push(this.placeNear(parent, verticalDistance));
        }

        if(nextFrontier.length < WALL.HOLDS_PER_ROW_MAX && Math.random() < 0.45) {
            const base = nextFrontier[Math.floor(Math.random() * nextFrontier.length)];
            const verticalDistance = 10 + Math.random() * 25;
            nextFrontier.push(this.placeNear(base, verticalDistance));
        }

        this.frontier = nextFrontier;
        this.highestWorldY = Math.min(this.highestWorldY, ...nextFrontier.map(h => h.worldY));
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
        this.frontier = [];
    }
}