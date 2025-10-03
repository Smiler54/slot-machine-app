// pages/api/ingest.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { gameState } from "@/lib/gameState";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { type, wallet, name, amountUsd } = req.body || {};
  if (type === "buy") {
    gameState.recordBuy({ type: "buy", buyer: wallet, buyerName: name, amountUsd: Number(amountUsd) || 0 });
    return res.json({ ok: true });
  }
  if (type === "sell") {
    gameState.recordSell({ type: "sell", seller: wallet, amountUsd: Number(amountUsd) || 0 });
    return res.json({ ok: true });
  }
  return res.status(400).json({ error: "expected {type: 'buy'|'sell', wallet, amountUsd}" });
}
