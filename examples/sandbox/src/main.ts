import { App, Input, Transform, Part, Mesh, Player, ActiveCamera, Render } from "@dylanebert/shallot";
import { terrainPlugin } from "./terrain";
import { BlockManager } from "./blocks";
import { SandboxController } from "./controller";

const app = new App();
await app.initialize({
    plugins: [terrainPlugin],
});

// Create player
const player = app.add({
    Transform: { position: [0, 64, 0] },
    Player: {},
    ActiveCamera: {},
});

// Initialize managers
const blockManager = new BlockManager(app);
const controller = new SandboxController(app, blockManager);

// Update loop
app.frame(async () => {
    controller.update();
    blockManager.updateVisibleChunks();
});

app.run();
