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
 
    constructor(game: Game) {
        this.game = game;
    }
 
    reset(startWorldY: number): Hold {
        for (const hold of this.holds) hold.destroy();
        this.holds = [];
        this.highestWorldY = startWorldY;
 
        const startHold = new Hold(GAME_WIDTH / 2, startWorldY, true);
        this.addHold(startHold);
 
        for (let i = 0; i < WALL.ROWS_AHEAD; i++) {
            this.generateNextRow();
        }
 
        return startHold;
    }
 
    private addHold(hold: Hold) {
        this.holds.push(hold);
        this.game.layers.wall.addChild(hold.graphics);
        hold.graphics.on('pointerdown', () => this.game.onHoldClicked(hold));
    }
 
    private generateNextRow() {
        this.highestWorldY -= WALL.ROW_HEIGHT;
 
        const count = WALL.HOLDS_PER_ROW_MIN +
            Math.floor(Math.random() * (WALL.HOLDS_PER_ROW_MAX - WALL.HOLDS_PER_ROW_MIN + 1));
 
        // "опорная" X-координата ряда — вокруг неё группируем зацепы,
        // чтобы снизу всегда было чем дотянуться до нового ряда
        const anchorX = WALL.MARGIN_X + Math.random() * (GAME_WIDTH - WALL.MARGIN_X * 2);
 
        for (let i = 0; i < count; i++) {
            const x = clamp(
                anchorX + (Math.random() - 0.5) * WALL.REACH_X,
                WALL.MARGIN_X,
                GAME_WIDTH - WALL.MARGIN_X
            );
            this.addHold(new Hold(x, this.highestWorldY));
        }
    }
 
    /** @returns true, если зацеп под игроком в этом кадре обвалился */
    update(dt: number, playerWorldY: number, playerCurrentHoldId: number): boolean {
        while (this.highestWorldY > playerWorldY - WALL.ROWS_AHEAD * WALL.ROW_HEIGHT) {
            this.generateNextRow();
        }
 
        let brokeUnderPlayer = false;
 
        for (let i = this.holds.length - 1; i >= 0; i--) {
            const hold = this.holds[i];
 
            if (hold.id === playerCurrentHoldId) {
                if (hold.update(dt) === 'broke') brokeUnderPlayer = true;
            }
 
            if (hold.worldY > playerWorldY + WALL.CULL_BELOW) {
                this.game.layers.wall.removeChild(hold.graphics);
                hold.destroy();
                this.holds.splice(i, 1);
            }
        }
 
        return brokeUnderPlayer;
    }
 
    getHoldById(id: number): Hold | undefined {
        return this.holds.find(h => h.id === id);
    }
 
    destroy() {
        for (const hold of this.holds) hold.destroy();
        this.holds = [];
    }
}