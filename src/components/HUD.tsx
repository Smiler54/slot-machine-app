// components/HUD.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type StateMsg = {
  type: "state";
  state: {
    creatorWallet: string;
    creatorWalletName?: string;
    feesPoolWallet: string;
    feesPoolUsd: number;
    marketCapUsd: number;
    creatorWalletUsd: number;
    lastBuyer?: { wallet: string; name?: string; amountUsd: number; ts: number };
    nextJackpotAt: number;
    jackpotIntervalMs: number;
  };
};

type BuyMsg = { type: "buy"; buyer: string; buyerName?: string; amountUsd: number };
type SellMsg = { type: "sell"; seller: string; amountUsd: number };
type WinMsg = { type: "win"; winner: string; payoutSuggestion: number };

export default function HUD() {
  const [state, setState] = useState<StateMsg["state"] | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const alertTimer = useRef<any>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_STREAM_URL || "/api/stream";
    const es = new EventSource(url);

    es.onmessage = (e) => {
      const msg = JSON.parse(e.data) as StateMsg | BuyMsg | SellMsg | WinMsg;
      if (msg.type === "state") setState(msg.state);
      if (msg.type === "buy") {
        setAlert(`BUY: ${msg.buyer.slice(0, 4)}… • $${msg.amountUsd.toFixed(2)}`);
        resetAlert();
      }
      if (msg.type === "sell") {
        setAlert(`🧻 JEET ALERT: ${msg.seller.slice(0, 4)}… sold $${msg.amountUsd.toFixed(2)}`);
        resetAlert();
      }
      if (msg.type === "win") {
        setAlert(`🏆 WINNER: ${msg.winner.slice(0, 4)}… • suggested payout: $${msg.payoutSuggestion.toFixed(2)}`);
        resetAlert(5000);
      }
    };

    function resetAlert(ms = 2500) {
      if (alertTimer.current) clearTimeout(alertTimer.current);
      alertTimer.current = setTimeout(() => setAlert(null), ms);
    }

    return () => {
      es.close();
      if (alertTimer.current) clearTimeout(alertTimer.current);
    };
  }, []);

  if (!state) return null;

  const timeLeft = Math.max(0, state.nextJackpotAt - Date.now());
  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="w-full text-white">
      <div className="flex flex-wrap gap-4 justify-center text-sm sm:text-base">
        <div className="px-3 py-1 bg-black/50 rounded-xl">
          Creator: <b>{state.creatorWalletName || state.creatorWallet.slice(0, 6)}</b> • est: ${state.creatorWalletUsd.toFixed(2)}
        </div>
        <div className="px-3 py-1 bg-black/50 rounded-xl">
          Fees Pool: <b>{state.feesPoolWallet.slice(0, 6)}…</b> • ${state.feesPoolUsd.toFixed(2)}
        </div>
        <div className="px-3 py-1 bg-black/50 rounded-xl">
          MC est: ${state.marketCapUsd.toFixed(0)}
        </div>
        <div className="px-3 py-1 bg-black/50 rounded-xl">
          Next Jackpot in: {mins}:{secs.toString().padStart(2, "0")}
        </div>
        {state.lastBuyer && (
          <div className="px-3 py-1 bg-black/50 rounded-xl">
            Last Buyer: {state.lastBuyer.name || state.lastBuyer.wallet.slice(0, 6)} • ${state.lastBuyer.amountUsd.toFixed(2)}
          </div>
        )}
      </div>

      {alert && (
        <div className="mt-3 text-center">
          <div className="inline-block px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg shadow">
            {alert}
          </div>
        </div>
      )}
    </div>
  );
}
