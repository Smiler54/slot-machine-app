"use client";
import { useEffect, useState, useRef } from "react";
import PixiSlot from "./PixiSlot";
import PixiFire from "./PixiFire";
import PixiFlame from "./PixiFlame";
import PixiWinner from "./PixiWinner";

// Simple inline banner for JEET alert
function JeetAlert({ show, lastSeller }: { show: boolean; lastSeller?: string }) {
  if (!show) return null;
  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 rounded-xl border border-red-400 bg-red-900/80 px-4 py-2 text-red-100 shadow">
      JEET ALERT 🚨 Someone just sold{lastSeller ? ` (${lastSeller})` : ""}!
    </div>
  );
}

type AppState = {
  creatorWallet: string;
  creatorWalletName: string;
  feesPoolWallet: string;
  feesPoolValue: number;
  minBuyUsd: number;
  marketCap: number;
  jackpotCooldownMs: number;
  lastBuyer?: { address: string; amountUsd: number };
};

export default function SlotMachine() {
  const [stopFlags, setStopFlags] = useState([false, false, false, false, false]);
  const [checked, setChecked] = useState(false);

  const [winPour, setWinPour] = useState(false);           // money pour toggle
  const [state, setState] = useState<AppState | null>(null);
  const [jeet, setJeet] = useState<{ show: boolean; seller?: string }>({ show: false });
  const spinTimerRef = useRef<number | null>(null);

  // fetch boot state
  const refreshState = async () => {
    const res = await fetch("/api/state", { cache: "no-store" });
    const json = (await res.json()) as AppState;
    setState(json);
  };

  // unified spin (stagger or instant)
  const spinThenStop = (stagger = true) => {
    // start spinning
    setStopFlags([false, false, false, false, false]);

    // schedule stop
    if (spinTimerRef.current) window.clearTimeout(spinTimerRef.current);
    spinTimerRef.current = window.setTimeout(() => {
      if (stagger) {
        [0,1,2,3,4].forEach((idx) => {
          setTimeout(() => {
            setStopFlags((prev) => {
              const copy = [...prev];
              copy[idx] = true;
              return copy;
            });
          }, idx * 280);
        });
      } else {
        setStopFlags([true, true, true, true, true]);
      }
    }, 1200);
  };

  // listen to SSE: buy/sell/win
  useEffect(() => {
    refreshState();

    const es = new EventSource("/api/events");
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "state") {
          setState(msg.payload);
        } else if (msg.type === "buy") {
          // spins every time someone buys
          spinThenStop(true);
        } else if (msg.type === "sell") {
          // jeet alert
          setJeet({ show: true, seller: msg.addr });
          setTimeout(() => setJeet({ show: false }), 2500);
        } else if (msg.type === "win") {
          // show winner overlay + money pour
          setChecked(true);
          setWinPour(true);
          setTimeout(() => setWinPour(false), 4000);
          setTimeout(() => setChecked(false), 4500);
        }
      } catch {}
    };
    es.onerror = () => {
      // auto-reconnect by replacing EventSource
      es.close();
      setTimeout(() => {
        // noop – user can refresh or just rely on Next hot reload
      }, 1000);
    };
    return () => es.close();
  }, []);

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
      <JeetAlert show={jeet.show} lastSeller={jeet.seller} />

      {/* Top Logo + FX */}
      <div className="w-4/5 mt-4 border-0 border-x-4 border-x-yellow-200 rounded bg-gray-900/20">
        <div className="border-y-2 border-y-amber-100/20">
          <div className="w-full h-32 bg-black/20 relative overflow-hidden">
            <PixiFire checked={checked} />
            {/* money pour overlay */}
            <PixiWinner checked={winPour} />
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

          <div className="flex justify-around font-bold text-center leading-4 divide-x-1 divide-orange-300/30 border-b border-orange-300/30 py-1">
            <div className="w-6/14 flex-col justify-between items-center">
              <span className="text-orange-300 uppercase">Creator Fees</span>
              <span className="block w-20 h-4 bg-red-400 mx-auto"></span>
              {/* <span className="text-orange-200 text-xs">{state?.creatorWalletName ?? ""} : {state?.creatorWallet ?? "—"}</span> */}
            </div>
            <span className="text-green-400 uppercase w-3/14">Pump Bonus</span>
            <span className="text-orange-300 uppercase w-5/14">Community Pool</span>
          </div>

          {/* <div className="flex justify-between items-center gap-3 p-2">
            <div className="flex-1">
              <p className="text-orange-100 text-sm">Creator:</p>
              <p className="text-orange-200 font-bold truncate">
                {state?.creatorWalletName ?? "Creator"} — {state?.creatorWallet ?? "—"}
              </p>
            </div>
            <div className="flex-1 text-right">
              <p className="text-orange-100 text-sm">Fees Pool:</p>
              <p className="text-orange-200 font-bold truncate">
                {state?.feesPoolWallet ?? "—"}
              </p>
              <p className="text-green-300 text-sm">
                ${state?.feesPoolValue?.toFixed(2) ?? "0.00"}
              </p>
            </div>
          </div> */}

          <div className="flex justify-around font-bold text-center leading-4 p-1 divide-x-1 divide-orange-300/30">
            <span className="text-red-400 w-3/5 uppercase">
              {state?.lastBuyer
                ? `Last Buy: ${state.lastBuyer.address} — $${state.lastBuyer.amountUsd.toFixed(2)}`
                : "Last Buyer Reward"}
            </span>
            <span className="text-orange-100 w-2/5">pump.fun</span>
          </div>
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
              onClick={testSell}
              className="bg-gradient-to-b from-orange-300 to-orange-400 text-lg font-bold px-5 py-0.5 rounded shadow shadow-orange-300 border border-gray-800/70 hover:from-yellow-300 hover:to-yellow-400 uppercase"
              title="Trigger a SELL event to test JEET alert"
            >
              SELL
            </button>
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
