"use client";
import { useEffect, useState } from "react";
import { StateMsg } from "../../utils/types";
import { formatCurrency } from "@/utils/utils";

export default function BuySection({ state }: { state?: StateMsg["state"] | null }) {
  const [mins, setMins] = useState(0);
  const [secs, setSecs] = useState(0);

  if (!state) return null;

  useEffect(() => {
    const timeLeft = Math.max(0, state.nextJackpotAt - Date.now());
    setMins(Math.floor(timeLeft / 60000));
    setSecs(Math.floor((timeLeft % 60000) / 1000));
  }, [state.nextJackpotAt]);

  return (
    <div className="text-sm w-full flex-col pt-2">
      {/* Bottom Info */}
      <div className="flex justify-between items-start gap-2">
        <div className="w-2/5 flex flex-col py-1 justify-center items-center bg-amber-950/50 border border-amber-900">
          <span className="text-yellow-500 uppercase font-bold">Buys remaining</span>
          <span className="text-yellow-200 text-sm">{mins}:{secs.toString().padStart(2, "0")}</span>
        </div>
        <div className="w-3/5 flex flex-col justify-center items-center">
          <p className="text-yellow-500 font-bold uppercase">Fees Pool:</p>
          <p className="text-yellow-500 font-bold text-3xl">${formatCurrency(state?.marketCapUsd)}</p>
        </div>
      </div>
      <div className="flex justify-between items-end gap-1">
        <div className="w-1/4 text-yellow-500 text-sm uppercase text-center">Buy remaining</div>
        <div className="w-1/3 px-2 bg-amber-950/50 border border-amber-900 text-yellow-500 text-xl font-bold">$25.00</div>
        <div className="flex-1 flex justify-end">
          <button className="bg-gradient-to-b from-orange-300 to-orange-400 text-lg font-bold px-5 py-0.5 rounded shadow shadow-orange-300 border border-gray-800/70 hover:from-yellow-300 hover:to-yellow-400 uppercase text-black">
            BUY
          </button>
        </div>
      </div>
    </div>
  );
};