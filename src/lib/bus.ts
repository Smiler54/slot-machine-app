// import { NEXT_BUY_DELAY } from "@/utils/const";
import { EventEmitter } from "events";
import { broadcast } from "./wsServer";

class GameBus extends EventEmitter {
  constructor() {
    super();

    // Forward every internal event to WebSocket broadcast
    this.on("event", (msg) => {
      try {
        broadcast(msg);
      } catch (err) {
        console.error("[bus] broadcast error:", err);
      }
    });
  }
}

export const bus = new GameBus();

// class Bus extends EventEmitter {}
// export const bus = new Bus();

// // Heartbeat to keep SSE clients alive
// setInterval(() => bus.emit("tick", { t: Date.now() }), NEXT_BUY_DELAY);