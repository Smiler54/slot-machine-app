import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  // @ts-ignore
  res.json(globalThis.__LOCAL_GAME__.publicState());
}
