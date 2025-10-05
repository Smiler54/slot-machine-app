"use client";
import { useEffect, useState, useRef } from "react";
import ResultToast from "./ResultToast";
import LogoSection from "./LogoSection";
import InfoSection from "./InfoSection";
import BuySection from "./BuySection";
import PixiSlotMachine from "./SlotSection/PixiSlotMachine";
import { StateMsg, BuyMsg, SellMsg, WinMsg } from "@/utils/types";
import { STREAM_URL } from "@/utils/const";

export default function SlotMachine() {
  const [state, setState] = useState<StateMsg["state"] | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const alertTimer = useRef<any>(null);
  const lastBuyer = useRef<any>(null);

  useEffect(() => {
    const es = new EventSource(STREAM_URL);

    es.onmessage = (e) => {
      const msg = JSON.parse(e.data) as StateMsg | BuyMsg | SellMsg | WinMsg;
      if (msg.type === "state") setState(msg.state);
      if (msg.type === "buy") {
        setAlert(`💰 BUY : ${msg.buyer} • $${msg.amountUsd.toFixed(2)}`);
        resetAlert();
      }
      if (msg.type === "sell") {
        setAlert(`🧻 JEET : ${msg.seller} SOLD $${msg.amountUsd.toFixed(2)}`);
        resetAlert();
      }
      if (msg.type === "win") {
        setAlert(`🏆 WINNER : ${msg.winner} • suggested payout: $${msg.payoutSuggestion.toFixed(2)}`);
        resetAlert(5000);
      }
    };

    // === simulate local buy same as EventSource ===
    window.addEventListener("local-buy", (e: any) => {
      const msg = e.detail;
      if (msg?.type === "buy") {
        setAlert(`💰 BUY: ${msg.buyer} • $${msg.amountUsd.toFixed(2)}`);
        resetAlert();

        // Update state optimistically
        if (!lastBuyer.current) {
          lastBuyer.current = msg.buyer;
  
          console.log(msg);
          setState((prev) => prev
            ? {
              ...prev,
              marketCapUsd: prev.marketCapUsd + msg.amountUsd,
              lastBuyer: {
                wallet: msg.buyer,
                amountUsd: msg.amountUsd,
                ts: Date.now(),
              },
            }
            : prev
          );
        } else {
          lastBuyer.current = null;
        }
      }
    });

    function resetAlert(ms = 4000) {
      if (alertTimer.current) clearTimeout(alertTimer.current);
      alertTimer.current = setTimeout(() => setAlert(null), ms);
    }

    return () => {
      es.close();
      if (alertTimer.current) clearTimeout(alertTimer.current);
      window.removeEventListener("local-buy", () => { });
    };
  }, []);

  if (!state) return null;

  return (
    <div className="w-md flex flex-col items-center justify-center bg-black overflow-hidden relative border border-white/20 rounded-lg p-6">
      <ResultToast text={alert} />

      {/* Top Logo + FX */}
      <LogoSection alert={alert} />

      {/* Wallets / Pools */}
      <InfoSection state={state} />

      <div
        className="w-full border-0 border-x-4 border-x-yellow-200 rounded p-2 bg-gray-900/20"
        style={{ transform: "perspective(500px) rotateX(20deg) scaleY(1.1) translateY(-0px)" }}
      >
        <div className="shadow-xl/10 shadow-white p-2 border-1 border-gray-300/20 rounded-lg">
          {/* Reels */}
          <PixiSlotMachine />

          {/* Bottom Info */}
          <BuySection state={state} />
        </div>
      </div>
    </div>
  );
}
