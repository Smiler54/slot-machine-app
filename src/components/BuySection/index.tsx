"use client";
import { useEffect, useMemo, useState } from "react";
import { StateMsg } from "../../utils/types";
import { formatCurrency } from "@/utils/utils";
import { MAX_BUY_AMOUNT, MIN_BUY_AMOUNT, NEXT_BUY_DELAY, WIN_CHECK_DELAY, WIN_CHECK_TIME } from "@/utils/const";

export default function BuySection({ state }: { state?: StateMsg["state"] | null }) {
  const [buyAmount, setBuyAmount] = useState(25);
  const [inputValue, setInputValue] = useState("$25.00");
  const [focused, setFocused] = useState<boolean>(false);
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [mins, setMins] = useState(0);
  const [secs, setSecs] = useState(0);
  const [nextJackpot, setNextJackpot] = useState<number>(Date.now() + WIN_CHECK_TIME);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.max(0, nextJackpot - now);
      setMins(Math.floor(timeLeft / 60000));
      setSecs(Math.floor((timeLeft % 60000) / 1000));

      // Auto reset every 30 min
      if (timeLeft <= 0) {
        console.log("🏆 Winner check: last buyer wins!");
        window.dispatchEvent(new CustomEvent("slot-winner"));
        setNextJackpot(Date.now() + WIN_CHECK_TIME);
      }
    }, WIN_CHECK_DELAY);
    return () => clearInterval(timer);
  }, [nextJackpot]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value.replace(/[^0-9.]/g, "");
    if (raw === "") {
      setInputValue("");
      setBuyAmount(0);
      return;
    }
    const val = parseFloat(raw);
    if (!isNaN(val)) {
      const limited = Math.max(MIN_BUY_AMOUNT, Math.min(MAX_BUY_AMOUNT, val));
      setBuyAmount(limited);
      setInputValue(raw);
    }
  }

  // Format when blur
  function handleBlur() {
    setFocused(false);
    setInputValue(
      `$${buyAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    );
  }

  // Show plain float on focus
  function handleFocus() {
    setFocused(true);
    setInputValue(buyAmount.toString());
  }

  function handleBuy(event?: React.MouseEvent<HTMLButtonElement>, isAuto = false) {
    if (isBuying) return; // prevent spam
    setIsBuying(true);

    // 1️⃣ Simulate "buy" broadcast event
    const fakeBuyer = "You";
    const amount = buyAmount;

    // send same event pattern as real server
    window.dispatchEvent(
      new CustomEvent("local-buy", { detail: { type: "buy", buyer: fakeBuyer, amountUsd: amount, } })
    );

    // 2️⃣ Trigger slot animation
    window.dispatchEvent(
      new CustomEvent("slot-spin", { detail: { buyer: fakeBuyer, amountUsd: amount } })
    );

    // 3️⃣ Restore button after short delay
    setTimeout(() => {
      setIsBuying(false);
    }, NEXT_BUY_DELAY);
  }

  if (!state) return null;

  useEffect(() => {
    const timeLeft = Math.max(0, state.nextJackpotAt - Date.now());
    setMins(Math.floor(timeLeft / 60000));
    setSecs(Math.floor((timeLeft % 60000) / 1000));
  }, [state.nextJackpotAt]);

  const feesFormatted = useMemo(() => formatCurrency(state?.feesPoolUsd), [state?.feesPoolUsd]);

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
          <p className="text-yellow-500 font-bold text-3xl">${feesFormatted}</p>
        </div>
      </div>
      <div className="flex justify-between items-center gap-1">
        <div className="w-1/4 text-yellow-500 text-sm uppercase text-center leading-none">Buy Amount</div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-1/3 px-2 text-xl font-bold outline-none ${focused ? "bg-amber-950/30 border border-amber-900 text-yellow-200" : "bg-amber-950/50 border border-amber-900 text-yellow-500"
            }`}
        />
        <div className="flex-1 flex justify-end">
          <button
            onClick={handleBuy}
            disabled={isBuying}
            className={`relative overflow-hidden text-lg font-bold px-5 py-0.5 rounded border uppercase text-black transition-all duration-200 
              ${isBuying
                ? "bg-gradient-to-b from-gray-400 to-gray-500 border-gray-600 text-gray-800 cursor-not-allowed"
                : "bg-gradient-to-b from-orange-300 to-orange-400 shadow shadow-orange-300 border border-gray-800/70 hover:from-yellow-300 hover:to-yellow-400"
              }`}
          >
            {isBuying ? "BUYING..." : "BUY"}
            {isBuying && (
              <span className="absolute inset-0 animate-pulse bg-yellow-200/20 rounded-lg pointer-events-none" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};