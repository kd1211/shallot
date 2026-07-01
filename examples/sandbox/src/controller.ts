import { App, Player, ActiveCamera, Transform, Input } from "@dylanebert/shallot";
import { BlockManager } from "./blocks";
import { getBlock } from "./terrain";

const SPEED = 0.2;
const MOUSE_SENSITIVITY = 0.003;
const INTERACT_DISTANCE = 5;

export class SandboxController {
    private app: App;
    private blockManager: BlockManager;
    private yaw = 0;
    private pitch = 0;
    private lastMouseX = 0;
    private lastMouseY = 0;

    constructor(app: App, blockManager: BlockManager) {
        this.app = app;
        this.blockManager = blockManager;
        this.setupInputs();
    }

    private setupInputs(): void {
        document.addEventListener("click", () => {
            document.body.requestPointerLock();
        });

        document.addEventListener("mousemove", (e) => {
            if (document.pointerLockElement) {
                this.yaw -= e.movementX * MOUSE_SENSITIVITY;
                this.pitch -= e.movementY * MOUSE_SENSITIVITY;
                this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
            }
        });

        document.addEventListener("mousedown", (e) => {
            if (e.button === 0) this.placeBlock();
            if (e.button === 2) this.destroyBlock();
        });

        document.addEventListener("contextmenu", (e) => e.preventDefault());

        document.addEventListener("keydown", (e) => {
            if (e.key === "1") this.blockManager.selectBlockType(1);
            if (e.key === "2") this.blockManager.selectBlockType(2);
            if (e.key === "3") this.blockManager.selectBlockType(3);
            if (e.key === "4") this.blockManager.selectBlockType(4);
            if (e.key === "[") this.blockManager.cycleBlockType(-1);
            if (e.key === "]") this.blockManager.cycleBlockType(1);
        });
    }

    private getRaycastHit(): { x: number; y: number; z: number } | null {
        const camera = this.app.state.query([ActiveCamera])[0];
        if (!camera) return null;

        const transform = this.app.state.getComponent(camera, Transform);
        if (!transform) return null;

        const dir = [
            Math.sin(this.yaw) * Math.cos(this.pitch),
            Math.sin(this.pitch),
            Math.cos(this.yaw) * Math.cos(this.pitch),
        ];

        let px = transform.position[0];
        let py = transform.position[1];
        let pz = transform.position[2];

        for (let i = 0; i < INTERACT_DISTANCE * 10; i++) {
            px += dir[0] * 0.1;
            py += dir[1] * 0.1;
            pz += dir[2] * 0.1;

            const x = Math.floor(px);
            const y = Math.floor(py);
            const z = Math.floor(pz);

            if (getBlock(x, y, z) > 0) {
                return { x, y, z };
            }
        }

        return null;
    }

    private placeBlock(): void {
        const hit = this.getRaycastHit();
        if (hit) {
            // Place block next to hit
            const camera = this.app.state.query([ActiveCamera])[0];
            if (!camera) return;
            const transform = this.app.state.getComponent(camera, Transform);
            if (!transform) return;

            const dir = [
                Math.sin(this.yaw) * Math.cos(this.pitch),
                Math.sin(this.pitch),
                Math.cos(this.yaw) * Math.cos(this.pitch),
            ];

            const nx = Math.round(hit.x + dir[0] * 0.5);
            const ny = Math.round(hit.y + dir[1] * 0.5);
            const nz = Math.round(hit.z + dir[2] * 0.5);

            this.blockManager.placeBlock(nx, ny, nz);
        }
    }

    private destroyBlock(): void {
        const hit = this.getRaycastHit();
        if (hit) {
            this.blockManager.destroyBlock(hit.x, hit.y, hit.z);
        }
    }

    update(): void {
        const camera = this.app.state.query([ActiveCamera])[0];
        if (!camera) return;

        const transform = this.app.state.getComponent(camera, Transform);
        if (!transform) return;

        const move = [0, 0, 0];
        if (this.isKeyPressed("w")) {
            move[0] -= Math.sin(this.yaw) * SPEED;
            move[2] -= Math.cos(this.yaw) * SPEED;
        }
        if (this.isKeyPressed("s")) {
            move[0] += Math.sin(this.yaw) * SPEED;
            move[2] += Math.cos(this.yaw) * SPEED;
        }
        if (this.isKeyPressed("a")) {
            move[0] -= Math.cos(this.yaw) * SPEED;
            move[2] += Math.sin(this.yaw) * SPEED;
        }
        if (this.isKeyPressed("d")) {
            move[0] += Math.cos(this.yaw) * SPEED;
            move[2] -= Math.sin(this.yaw) * SPEED;
        }
        if (this.isKeyPressed(" ")) move[1] += SPEED;
        if (this.isKeyPressed("shift")) move[1] -= SPEED;

        transform.position[0] += move[0];
        transform.position[1] += move[1];
        transform.position[2] += move[2];

        // Update camera rotation
        transform.euler = [this.pitch, this.yaw, 0];
    }

    private isKeyPressed(key: string): boolean {
        const keyMap: Record<string, string> = {
            w: "KeyW",
            a: "KeyA",
            s: "KeyS",
            d: "KeyD",
            " ": "Space",
            shift: "ShiftLeft",
        };
        return (window as any).pressedKeys?.[keyMap[key]] ?? false;
    }
}

// Global key tracking
(window as any).pressedKeys = {};
document.addEventListener("keydown", (e) => {
    (window as any).pressedKeys[e.code] = true;
});
document.addEventListener("keyup", (e) => {
    (window as any).pressedKeys[e.code] = false;
});
