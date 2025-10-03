import { EventEmitter } from "events";

class Bus extends EventEmitter {}
export const bus = new Bus();

// Heartbeat to keep SSE clients alive
setInterval(() => bus.emit("tick", { t: Date.now() }), 25_000);