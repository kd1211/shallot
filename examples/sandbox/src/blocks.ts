import { App, Transform, Part, Mesh } from "@dylanebert/shallot";
import { getBlock, setBlock, getChunk, CHUNK_SIZE, TERRAIN_HEIGHT } from "./terrain";

const BLOCK_COLORS = {
    0: 0x000000, // Empty
    1: 0x22aa22, // Grass
    2: 0x777777, // Stone
    3: 0x8b7355, // Dirt
    4: 0xddaa66, // Sand
};

const BLOCK_NAMES = {
    0: "Empty",
    1: "Grass",
    2: "Stone",
    3: "Dirt",
    4: "Sand",
};

export class BlockManager {
    private app: App;
    private blockEntities = new Map<string, number>();
    private selectedBlockType = 1;

    constructor(app: App) {
        this.app = app;
    }

    private getBlockKey(x: number, y: number, z: number): string {
        return `${x},${y},${z}`;
    }

    updateVisibleChunks(): void {
        // Get player position
        const camera = this.app.state.query([activeCamera])[0];
        if (!camera) return;

        const player = this.app.state.getComponent(camera, Transform);
        if (!player) return;

        const px = Math.floor(player.position[0]);
        const py = Math.floor(player.position[1]);
        const pz = Math.floor(player.position[2]);

        const renderDistance = 3;
        const visibleBlocks = new Set<string>();

        for (let x = px - renderDistance * CHUNK_SIZE; x < px + renderDistance * CHUNK_SIZE; x++) {
            for (let z = pz - renderDistance * CHUNK_SIZE; z < pz + renderDistance * CHUNK_SIZE; z++) {
                for (let y = Math.max(0, py - 16); y < Math.min(TERRAIN_HEIGHT, py + 16); y++) {
                    const blockType = getBlock(x, y, z);
                    const key = this.getBlockKey(x, y, z);

                    if (blockType > 0) {
                        visibleBlocks.add(key);
                        if (!this.blockEntities.has(key)) {
                            this.createBlockEntity(x, y, z, blockType);
                        }
                    } else if (this.blockEntities.has(key)) {
                        this.destroyBlockEntity(key);
                    }
                }
            }
        }

        // Remove far away blocks
        for (const [key, eid] of this.blockEntities) {
            if (!visibleBlocks.has(key)) {
                this.destroyBlockEntity(key);
            }
        }
    }

    private createBlockEntity(x: number, y: number, z: number, blockType: number): void {
        const key = this.getBlockKey(x, y, z);
        const eid = this.app.add({
            Transform: { position: [x, y, z], scale: [1, 1, 1] },
            Part: {
                shape: "box",
                color: BLOCK_COLORS[blockType as keyof typeof BLOCK_COLORS],
                sizeX: 1,
                sizeY: 1,
                sizeZ: 1,
            },
        });
        this.blockEntities.set(key, eid);
    }

    private destroyBlockEntity(key: string): void {
        const eid = this.blockEntities.get(key);
        if (eid !== undefined) {
            this.app.remove(eid);
            this.blockEntities.delete(key);
        }
    }

    placeBlock(x: number, y: number, z: number): void {
        setBlock(x, y, z, this.selectedBlockType);
        const key = this.getBlockKey(x, y, z);
        if (this.blockEntities.has(key)) this.destroyBlockEntity(key);
        this.createBlockEntity(x, y, z, this.selectedBlockType);
    }

    destroyBlock(x: number, y: number, z: number): void {
        setBlock(x, y, z, 0);
        const key = this.getBlockKey(x, y, z);
        if (this.blockEntities.has(key)) this.destroyBlockEntity(key);
    }

    selectBlockType(type: number): void {
        this.selectedBlockType = Math.max(1, Math.min(4, type));
        this.updateUI();
    }

    cycleBlockType(direction: number): void {
        this.selectedBlockType += direction;
        if (this.selectedBlockType < 1) this.selectedBlockType = 4;
        if (this.selectedBlockType > 4) this.selectedBlockType = 1;
        this.updateUI();
    }

    private updateUI(): void {
        const ui = document.getElementById("block-info");
        if (ui) {
            ui.textContent = `Selected: ${BLOCK_NAMES[this.selectedBlockType as keyof typeof BLOCK_NAMES]} (${this.selectedBlockType})`;
        }
    }
}
