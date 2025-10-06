// src/api/ws.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getWSServer } from "@/lib/wsServer";
import { startSolanaLogStream } from "@/lib/solana";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // @ts-ignore
  const server = res.socket?.server as any;
  if (!server) return res.status(500).json({ error: "No server socket" });

  if (!server._wssAttached) {
    getWSServer(server);
    server._wssAttached = true;

    // 🔥 Start listening to on-chain logs only once
    startSolanaLogStream().catch((e) =>
      console.error("[solana] subscription error:", e)
    );
  }

  res.status(200).json({ ok: true });
}

// import { subscribeProgramLogs } from "@/lib/solana";
// import { getLocalGame } from "@/lib/gameState"; // ensure you export a singleton accessor
// import { STREAM_PROGRAM_ID } from "@/utils/const"; // add this in const.ts (below)

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   // @ts-ignore - Next.js node server handle
//   const server = res.socket?.server as any;

//   if (!server) {
//     res.status(500).json({ error: "Server socket not available" });
//     return;
//   }

//   if (!server._wssAttached) {
//     getWSServer(server);
//     server._wssAttached = true;

//     // Start Solana subscription ONCE (forward to WS + update game state)
//     subscribeProgramLogs(STREAM_PROGRAM_ID, (events) => {
//       const game = getLocalGame();
//       for (const ev of events) {
//         if (ev.type === "buy") {
//           // Update state based on chain (implement recordBuyFromChain)
//           game.recordBuy({
//             type: "buy",
//             buyer: ev.buyer,
//             amountUsd: ev.amountUsd ?? 0,
//             txSig: ev.sig,
//           });
//           broadcast({ type: "buy", buyer: ev.buyer, amountUsd: ev.amountUsd ?? 0, sig: ev.sig });
//           broadcast({ type: "state", state: game.state() });
//         } else if (ev.type === "sell") {
//           broadcast({ type: "sell", seller: ev.seller, amountUsd: ev.amountUsd ?? 0, sig: ev.sig });
//           broadcast({ type: "state", state: game.state() });
//         } else if (ev.type === "win") {
//           broadcast({ type: "win", winner: ev.winner, payoutSuggestion: ev.payoutSuggestion ?? 0, sig: ev.sig });
//           broadcast({ type: "state", state: game.state() });
//         }
//       }
//     });
//   }

//   res.status(200).json({ ok: true });
// }
