export class Physics {
    constructor() {
        this.gravity = 800;
    }

    applyGravity(entity, dt) {
        entity.vy += this.gravity * dt;
    }

    clampSpeed(entity, maxSpeed) {
        entity.vy = Math.max(-maxSpeed, Math.min(maxSpeed, entity.vy));
    }

    checkAABB(a, b) { // axis-aligned bounding box
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        )
    }
}