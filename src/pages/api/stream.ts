// pages/api/stream.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { bus } from "@/lib/bus";
import { gameState } from "@/lib/gameState";

export const config = { api: { bodyParser: false } };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const send = (obj: any) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  // Immediately send current state
  send({ type: "state", state: gameState.state() });

  const onEvent = (payload: any) => send(payload);
  const onTick = (payload: any) => send({ type: "tick", ...payload });

  bus.on("event", onEvent);
  bus.on("tick", onTick);

  req.on("close", () => {
    bus.off("event", onEvent);
    bus.off("tick", onTick);
    res.end();
  });
}
