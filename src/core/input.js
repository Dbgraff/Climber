export class Input{
    constructor(canvas){
        this.isPressed = false;
        this.canvas = canvas;

        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
    }

    enable() {
        this.canvas.addEventListener('pointerdown', this.onPointerDown);
        this.canvas.addEventListener('pointerup', this.on)
    }

    disable() {
        this.canvas.removeEventListener('pointerdown', this.onPointerDown);
        this.canvas.removeEventListener('pointerup', this.on);
        this.isPressed = false;
    }

    onPointerDown() {
        this.isPressed = true;
    }

    onPointerUp() {
        this.isPressed = false;
    }

    destroy() {
        this.disable();
        this.canvas = null;
    }
}