import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { address, amountUsd } = JSON.parse(req.body || "{}");

  // @ts-ignore
  const result = globalThis.__LOCAL_GAME__.recordBuy({
    address: String(address || "Buyer"),
    amountUsd: Number(amountUsd) || 1,
  });

  res.json({ ok: true, ...result });
}
