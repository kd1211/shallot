import { Plugin, State, System } from "@dylanebert/shallot";
import { Noise } from "noisejs";

const noise = new Noise(Math.random());
const CHUNK_SIZE = 16;
const TERRAIN_HEIGHT = 64;
const SCALE = 0.1;

interface Chunk {
    x: number;
    z: number;
    blocks: Uint8Array;
    generated: boolean;
}

const chunks = new Map<string, Chunk>();

export function getTerrainHeight(x: number, z: number): number {
    const baseHeight = noise.perlin2(x * SCALE, z * SCALE) * 32 + 32;
    return Math.floor(baseHeight);
}

export function getChunk(cx: number, cz: number): Chunk {
    const key = `${cx},${cz}`;
    if (chunks.has(key)) return chunks.get(key)!;

    const chunk: Chunk = {
        x: cx,
        z: cz,
        blocks: new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * TERRAIN_HEIGHT),
        generated: false,
    };

    // Generate terrain
    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
            const worldX = cx * CHUNK_SIZE + x;
            const worldZ = cz * CHUNK_SIZE + z;
            const height = getTerrainHeight(worldX, worldZ);

            for (let y = 0; y < height; y++) {
                let blockType = 2; // Stone
                if (y === height - 1) blockType = 1; // Grass on top
                else if (y > height - 4) blockType = 3; // Dirt layer
                else if (y > height - 8) blockType = 4; // Sand deeper

                const idx = x + z * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE;
                chunk.blocks[idx] = blockType;
            }
        }
    }

    chunk.generated = true;
    chunks.set(key, chunk);
    return chunk;
}

export function getBlock(x: number, y: number, z: number): number {
    if (y < 0 || y >= TERRAIN_HEIGHT) return 0;

    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    const chunk = getChunk(cx, cz);

    const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const idx = lx + lz * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE;

    return chunk.blocks[idx] || 0;
}

export function setBlock(x: number, y: number, z: number, type: number): void {
    if (y < 0 || y >= TERRAIN_HEIGHT) return;

    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    const chunk = getChunk(cx, cz);

    const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const idx = lx + lz * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE;

    chunk.blocks[idx] = type;
}

export const terrainPlugin: Plugin = {
    name: "Terrain",
    async initialize() {
        // Pre-generate some chunks
        for (let cx = -2; cx <= 2; cx++) {
            for (let cz = -2; cz <= 2; cz++) {
                getChunk(cx, cz);
            }
        }
    },
};
