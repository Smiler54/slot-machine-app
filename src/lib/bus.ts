import { NEXT_BUY_DELAY } from "@/utils/const";
import { EventEmitter } from "events";

class Bus extends EventEmitter {}
export const bus = new Bus();

// Heartbeat to keep SSE clients alive
setInterval(() => bus.emit("tick", { t: Date.now() }), NEXT_BUY_DELAY);