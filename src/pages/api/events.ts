import type { NextApiRequest, NextApiResponse } from "next";
import "../../lib/serverState";

export const config = {
  api: { bodyParser: false }, // SSE must not use bodyParser
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Create Server-Sent Events connection
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (msg: any) => {
    res.write(`data: ${JSON.stringify(msg)}\n\n`);
  };

  // ✅ Now __LOCAL_GAME__ is guaranteed to exist
  // @ts-ignore
  const id = globalThis.__LOCAL_GAME__.addClient(send);

  // send initial snapshot
  // @ts-ignore
  send({ type: "state", payload: globalThis.__LOCAL_GAME__.publicState() });

  req.on("close", () => {
    // @ts-ignore
    globalThis.__LOCAL_GAME__.removeClient(id);
  });
}
