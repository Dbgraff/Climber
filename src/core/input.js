import { GAME_WIDTH, GAME_HEIGHT } from "../utils/constans";

export class Input{
    constructor(canvas) {
        this.canvas = canvas;

        this.pointerX = GAME_WIDTH / 2;
        this.pointerY = GAME_HEIGHT / 2;

        this.onPointerMove = this.onPointerMove.bind(this);
    }

    enable() {
        window.addEventListener('pointermove', this.onPointerMove);
        this.canvas.style.touchAction = 'none';
    }

    disable() {
        window.removeEventListener('pointermove', this.onPointerMove);
    }

    onPointerMove(e) {
        const rect = this.canvas.getBoundingClientRect();

        const scaleX = GAME_WIDTH / rect.width;
        const scaleY = GAME_HEIGHT / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        this.pointerX = Math.max(0, Math.min(GAME_WIDTH, x));
        this.pointerY = Math.max(0, Math.min(GAME_HEIGHT, y));
    }

    destroy() {
        this.disable();
        this.canvas = null;
    }
}