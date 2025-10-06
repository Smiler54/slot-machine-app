// src/lib/wsServer.ts
import { Server as WebSocketServer } from "ws";
import WebSocket from "ws";

type WSMsg = { type: string; [k: string]: any };
let _wss: WebSocketServer | null = null;

export function getWSServer(server: any): WebSocketServer {
  if (_wss) return _wss;

  _wss = new WebSocketServer({ server, path: "/api/ws" });
  _wss.on("connection", (socket: WebSocket) => {
    console.log("[ws] new connection");
    socket.send(JSON.stringify({ type: "hello", payload: "connected" }));
  });

  console.log("[ws] WebSocketServer ready on /api/ws");
  return _wss;
}

export function broadcast(msg: WSMsg) {
  if (!_wss) return;
  const data = JSON.stringify(msg);
  for (const client of _wss.clients) {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  }
}
