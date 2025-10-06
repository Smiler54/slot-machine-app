// src/lib/solana.ts
import { SOLANA_RPC_HTTP, SOLANA_RPC_WS, STREAM_PROGRAM_ID } from "@/utils/const";
import { Connection, PublicKey, LogsCallback, Logs } from "@solana/web3.js";
import { getLocalGame } from "./gameState";

let _conn: Connection | null = null;

export function getSolanaConnection(): Connection {
  if (_conn) return _conn;
  _conn = new Connection(SOLANA_RPC_HTTP, {
    wsEndpoint: SOLANA_RPC_WS,
    commitment: "confirmed",
  });
  return _conn;
}

function parseProgramLogs(logs: Logs) {
  const events: any[] = [];
  const sig = logs.signature;
  for (const line of logs.logs ?? []) {
    if (line.includes("BUY:")) {
      const buyer = line.match(/buyer=([A-Za-z0-9]+)/)?.[1];
      const amount = parseFloat(line.match(/amount=([\d.]+)/)?.[1] ?? "0");
      events.push({ type: "buy", buyer, amountUsd: amount, txSig: sig });
    } else if (line.includes("SELL:")) {
      const seller = line.match(/seller=([A-Za-z0-9]+)/)?.[1];
      const amount = parseFloat(line.match(/amount=([\d.]+)/)?.[1] ?? "0");
      events.push({ type: "sell", seller, amountUsd: amount, txSig: sig });
    } else if (line.includes("WIN:")) {
      const winner = line.match(/winner=([A-Za-z0-9]+)/)?.[1];
      const payout = parseFloat(line.match(/payout=([\d.]+)/)?.[1] ?? "0");
      events.push({ type: "win", winner, payoutSuggestion: payout, txSig: sig });
    }
  }
  return events;
}

/** Subscribe to program logs and push events into gameState + bus */
export async function startSolanaLogStream() {
  const conn = getSolanaConnection();
  const program = new PublicKey(STREAM_PROGRAM_ID);
  const game = getLocalGame();

  console.log("[solana] subscribing to logs for", STREAM_PROGRAM_ID);

  await conn.onLogs(program, (logs) => {
    const events = parseProgramLogs(logs);
    for (const ev of events) {
      if (ev.type === "buy") game.recordBuy(ev);
      else if (ev.type === "sell") game.recordSell(ev);
      else if (ev.type === "win") game.recordWin(ev);
    }
  }, "confirmed");
}

// export type ChainEvent =
//   | { type: "buy"; buyer: string; amountUsd?: number; sig: string }
//   | { type: "sell"; seller: string; amountUsd?: number; sig: string }
//   | { type: "win"; winner: string; payoutSuggestion?: number; sig: string };

// export function parseProgramLogs(logs: Logs): ChainEvent[] {
//   const out: ChainEvent[] = [];
//   const sig = logs.signature;
//   const lines = logs.logs || [];
//   for (const l of lines) {
//     if (l.includes("BUY:")) {
//       const mBuyer = l.match(/buyer=([A-Za-z0-9]+)/);
//       const mAmt   = l.match(/amount=([\d.]+)/);
//       out.push({
//         type: "buy",
//         buyer: mBuyer?.[1] ?? "unknown",
//         amountUsd: mAmt ? parseFloat(mAmt[1]) : undefined,
//         sig,
//       });
//     } else if (l.includes("SELL:")) {
//       const mSeller = l.match(/seller=([A-Za-z0-9]+)/);
//       const mAmt    = l.match(/amount=([\d.]+)/);
//       out.push({
//         type: "sell",
//         seller: mSeller?.[1] ?? "unknown",
//         amountUsd: mAmt ? parseFloat(mAmt[1]) : undefined,
//         sig,
//       });
//     } else if (l.includes("WIN:")) {
//       const mWinner = l.match(/winner=([A-Za-z0-9]+)/);
//       const mPay    = l.match(/payout=([\d.]+)/);
//       out.push({
//         type: "win",
//         winner: mWinner?.[1] ?? "unknown",
//         payoutSuggestion: mPay ? parseFloat(mPay[1]) : undefined,
//         sig,
//       });
//     }
//   }
//   return out;
// }

// // Subscribe to logs for a program (e.g., Pump.fun program)
// let _subId: number | null = null;

// export async function subscribeProgramLogs(
//   programId: string,
//   onEvents: (events: ChainEvent[]) => void,
// ) {
//   const conn = getSolanaConnection();
//   const pubkey = new PublicKey(programId);

//   // Clean old subscription (hot reload guard)
//   if (_subId != null) {
//     try { await conn.removeOnLogsListener(_subId); } catch {}
//     _subId = null;
//   }

//   const cb: LogsCallback = (logs) => {
//     try {
//       const evs = parseProgramLogs(logs);
//       if (evs.length) onEvents(evs);
//     } catch (e) {
//       console.error("[parseProgramLogs] error:", e);
//     }
//   };

//   _subId = await conn.onLogs(pubkey, cb, "confirmed");
//   console.log("[solana] subscribed logs for program:", programId, "subId:", _subId);
// }
