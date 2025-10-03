"use client";
import { useEffect, useState, useRef } from "react";
import PixiSlot from "./PixiSlot";
import PixiFire from "./PixiFire";
import PixiFlame from "./PixiFlame";
import PixiWinner from "./PixiWinner";

// --- Types from backend ---
type AppState = {
  creatorWallet: string;
  creatorWalletName: string;
  feesPoolWallet: string;
  communityPoolWallet: string;
  creatorFees: number;
  feesPool: number;
  pumpBonus: number;
  lastBuyerReward: number;
  minBuyUsd: number;
  lastBuyer?: { address: string; amountUsd: number };
};

type BuyEvent = {
  type: "buy";
  addr: string;
  amountUsd: number;
  result: string[];
  multi: number;
  reward: number;
  isWinner: boolean;
};

// --- Small banner to show result ---
function ResultToast({ show, text }: { show: boolean; text: string }) {
  if (!show) return null;
  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 rounded-xl border border-amber-400 bg-black/80 px-4 py-2 text-amber-100 shadow">
      {text}
    </div>
  );
}

export default function SlotMachine() {
  const [state, setState] = useState<AppState | null>(null);
  const [stopFlags, setStopFlags] = useState([false, false, false, false, false]);
  const [winnerFX, setWinnerFX] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; text: string }>({ show: false, text: "" });
  const [buying, setBuying] = useState(false);
  const spinTimerRef = useRef<number | null>(null);

  // spin animation (staggered stop)
  const spinThenStop = () => {
    setStopFlags([false, false, false, false, false]);
    if (spinTimerRef.current) window.clearTimeout(spinTimerRef.current);
    spinTimerRef.current = window.setTimeout(() => {
      [0, 1, 2, 3, 4].forEach((idx) => {
        setTimeout(() => {
          setStopFlags((prev) => {
            const copy = [...prev];
            copy[idx] = true;
            return copy;
          });
        }, idx * 250);
      });
    }, 900);
  };

  // boot + SSE
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/state");
      setState(await res.json());
    })();

    const es = new EventSource("/api/events");
    es.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);

      if (msg.type === "state") {
        setState(msg.payload as AppState);
      }

      if (msg.type === "buy") {
        const e = msg as BuyEvent;
        spinThenStop();

        const text = `Spin: ${e.result.join(" | ")} → ${e.multi}x | Reward $${e.reward.toFixed(2)}`;
        setToast({ show: true, text });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);

        if (e.isWinner) {
          setWinnerFX(true);
          setTimeout(() => setWinnerFX(false), 4000);
        }
      }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  // Trigger buy (local test)
  const handleBuy = async () => {
    if (!state) return;
    setBuying(true);
    try {
      await fetch("/api/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: "DemoWallet1111111", // later: replace with connected Solana wallet
          amountUsd: state.minBuyUsd,
        }),
      });
    } finally {
      setBuying(false);
    }
  };

// manual BUY button to test locally (sends $1.00)
  const testBuy = async () => {
    await fetch("/api/buy", {
      method: "POST",
      body: JSON.stringify({ address: "You", amountUsd: 1.0 }),
    });
  };

  // manual SELL to see jeet alert
  const testSell = async () => {
    await fetch("/api/sell", {
      method: "POST",
      body: JSON.stringify({ address: "PaperHands" }),
    });
  };

  return (
    <div className="w-sm flex flex-col items-center justify-center bg-black overflow-hidden relative">
      <ResultToast show={toast.show} text={toast.text} />

      {/* Top Logo + FX */}
      <div className="w-4/5 mt-4 border-0 border-x-4 border-x-yellow-200 rounded bg-gray-900/20">
        <div className="border-y-2 border-y-amber-100/20">
          <div className="w-full h-32 bg-black/20 relative overflow-hidden">
            <PixiFire checked={winnerFX} />
            <PixiWinner checked={winnerFX} />
          </div>
          <p className="text-center text-lg text-orange-300 font-bold scale-y-150 uppercase">
            Last Spin. Last Buy. Big Win.
          </p>
        </div>
      </div>

      {/* Wallets / Pools */}
      <div className="w-8/9 mt-3 border-0 border-x-4 border-x-yellow-200 rounded bg-gray-900/20">
        <div className="border-y-4 border-y-amber-100/10 px-2 py-1">
          <div className="w-full h-20">
            <PixiFlame />
          </div>

          {/* <div className="flex justify-around font-bold text-center leading-4 divide-x-1 divide-orange-300/30 border-b border-orange-300/30 py-1">
            <div className="w-6/14 flex-col justify-between items-center">
              <span className="text-orange-300 uppercase">Creator Fees</span>
              <span className="block w-20 h-4 bg-red-400 mx-auto"></span>
            </div>
            <span className="text-green-400 uppercase w-3/14">Pump Bonus</span>
            <span className="text-orange-300 uppercase w-5/14">Community Pool</span>
          </div> */}

          <div className="grid grid-cols-2 gap-3 p-2">
            <div className="text-orange-200">
              <p className="text-sm opacity-80">Creator</p>
              <p className="text-xs ont-bold truncate">
                {state?.creatorWalletName} — {state?.creatorWallet}
              </p>
              <p className="text-xs mt-1">Balance: ${state?.creatorFees.toFixed(2)}</p>
            </div>

            <div className="text-right text-orange-200">
              <p className="text-sm opacity-80">Fees Pool</p>
              <p className="text-xs font-bold truncate">{state?.feesPoolWallet}</p>
              <p className="text-xs mt-1 text-green-300">Balance: ${state?.feesPool.toFixed(2)}</p>
            </div>

            <div className="text-orange-200">
              <p className="text-sm opacity-80">Pump Bonus</p>
              <p className="text-xs font-bold">${state?.pumpBonus.toFixed(2)}</p>
            </div>

            <div className="text-right text-orange-200">
              <p className="text-sm opacity-80">Last Buyer Reward</p>
              <p className="text-xs font-bold">${state?.lastBuyerReward.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex justify-between items-center gap-2 p-2 border-t border-orange-300/20">
            <div className="text-orange-200">
              <p className="text-sm opacity-80">Last Buyer</p>
              <p className="text-xs font-bold truncate">
                {state?.lastBuyer
                  ? `${state.lastBuyer.address} — $${state.lastBuyer.amountUsd.toFixed(2)}`
                  : "—"}
              </p>
            </div>
            <div className="text-right text-orange-200">
              <p className="text-sm opacity-80">Community Pool</p>
              <p className="text-xs font-bold truncate">{state?.communityPoolWallet}</p>
            </div>
          </div>

          {/* <div className="flex justify-around font-bold text-center leading-4 p-1 divide-x-1 divide-orange-300/30">
            <span className="text-red-400 w-3/5 uppercase">
              {state?.lastBuyer
                ? `Last Buy: ${state.lastBuyer.address} — $${state.lastBuyer.amountUsd.toFixed(2)}`
                : "Last Buyer Reward"}
            </span>
            <span className="text-orange-100 w-2/5">pump.fun</span>
          </div> */}
        </div>
      </div>

      {/* Reels */}
      <div
        className="w-full border-0 border-x-4 border-x-yellow-200 rounded p-4 bg-gray-900/20"
        style={{
          transform: "perspective(1000px) rotateX(35deg) scaleX(0.98) scaleY(1.2) translateY(-10px)",
        }}
      >
        <div className="shadow-xl/10 shadow-white pb-24">
          <div className="h-30 bg-black grid grid-cols-5 border-2 border-red-400/60 divide-x-2 divide-red-400/60">
            {stopFlags.map((flag, i) => (
              <PixiSlot key={i} stopping={flag} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="py-4 px-5 text-sm absolute bottom-4 w-full flex-col">
        <p className="text-orange-200 text-right text-2xl font-bold uppercase">
          Min Buy: ${state?.minBuyUsd?.toFixed(2) ?? "1.00"}
        </p>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-orange-200 text-xl font-bold uppercase">Fees Pool:</p>
            <p className="truncate text-orange-200 font-bold">{state?.feesPoolWallet ?? "—"}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={testBuy}
              className="bg-gradient-to-b from-orange-300 to-orange-400 text-lg font-bold px-5 py-0.5 rounded shadow shadow-orange-300 border border-gray-800/70 hover:from-yellow-300 hover:to-yellow-400 uppercase"
            >
              BUY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
