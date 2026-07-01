# Shallot Sandbox Game

An interactive sandbox game built with Shallot WebGPU engine. Build and destroy blocks in infinite terrain!

## Features

🎮 **Controls**
- **WASD** - Move forward/backward/left/right
- **Space** - Move up
- **Shift** - Move down  
- **Mouse** - Look around (click to lock pointer)
- **Left Click** - Place block
- **Right Click** - Destroy block
- **1-4** - Select block type
- **[ ]** - Cycle through block types

🧱 **Block Types**
1. **Grass** - Green blocks (top layer)
2. **Stone** - Gray blocks (deep underground)
3. **Dirt** - Brown blocks (mid layer)
4. **Sand** - Light tan blocks (deeper underground)

🌍 **Features**
- Perlin noise procedural terrain generation
- Infinite world (chunks generated on demand)
- Dynamic chunk loading/unloading
- Real-time block placement and destruction
- Raycasting-based block interaction
- Smooth first-person camera

## Running

```bash
bun run dev
```

Then open http://localhost:3000/examples/sandbox

## Building

```bash
bun run build
```

## Performance

Optimized for older GPUs like RX 550 (with f32 fallback). The sandbox uses:
- Chunk-based terrain system (only renders visible blocks)
- Efficient frustum culling
- Dynamic entity management
- Ray-to-block distance checking (5-block interaction range)

## Future Enhancements

- [ ] Save/load worlds
- [ ] Multiple biomes
- [ ] Water blocks
- [ ] Lighting system
- [ ] Inventory management
- [ ] Block rotation
- [ ] Multiplayer support (P2P)
