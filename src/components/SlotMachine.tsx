"use client";
import { useState } from "react";
import Image from "next/image";
import logo from "@/assets/logo.png";
import PixiSlot from "./PixiSlot";

export default function SlotMachine() {
  const [stopFlags, setStopFlags] = useState([false, false, false, false, false]);

  const handleBuy = () => {
    // trigger staggered stopping
    [0, 1, 2, 3, 4].forEach((idx) => {
      setTimeout(() => {
        setStopFlags((prev) => {
          const copy = [...prev];   // ✅ clone
          copy[idx] = true;         // mark stop requested
          // console.log("Updated flags:", copy);
          return copy;              // ✅ new reference returned
        });
      }, idx * 800);
    });

    setTimeout(() => {
      // const count = stopFlags.map(value => value === false ? 1 : 0).reduce((a: number, b: number) => a + b, 0);
      // if (count === 0) {}
      setStopFlags([false, false, false, false, false]);
    }, 12000);
  };

  return (
    <div className="w-sm flex flex-col items-center justify-center bg-black overflow-hidden relative">
      {/* Top Logo */}
      <div className="w-4/5 mt-4 border-0 border-x-4 border-x-yellow-200 rounded bg-gray-900/20">
        <div className="border-y-2 border-y-amber-100/20">
          <Image className="mx-auto w-auto h-32" src={logo} alt="Logo" />
          <p className="text-center text-lg text-orange-300 font-bold scale-y-150 uppercase">
            Last Spin. Last Buy. Big Win.
          </p>
        </div>
      </div>

      <div className="w-8/9 mt-3 border-0 border-x-4 border-x-yellow-200 rounded bg-gray-900/20">
        <div className="border-y-4 border-y-amber-100/10 px-2 py-1">
          {/* Middle Info Section */}
          <div className="w-full bg-yellow-600 text-center">
            <h2 className="text-8xl font-extrabold text-shadow-black text-shadow-sm  text-yellow-200">$LAST</h2>
          </div>

          <div className="flex justify-around font-bold text-center uppercase leading-4 divide-x-1 divide-orange-300/30 border-b border-orange-300/30 py-1">
            <div className="w-6/14 flex-col justify-between items-center">
              <span className="text-orange-300">Creator Fees</span>
              <span className="block w-20 h-4 bg-red-400 mx-auto"></span>
            </div>
            <span className="text-green-400 w-3/14">Pump Bonus</span>
            <span className="text-orange-300 w-5/14">Community Pool</span>
          </div>

          <div className="flex justify-around font-bold text-center leading-4 p-1 divide-x-1 divide-orange-300/30">
            <span className="text-red-400 w-3/5 uppercase">Last Buyer Reward</span>
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
        <p className="text-orange-200 text-right text-2xl font-bold uppercase">Min Buy: $1.00</p>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-orange-200 text-xl font-bold uppercase">Fees Pool:</p>
            <p className="truncate text-orange-200 font-bold">J32jV4WAkY4yXTTrMTAHzAzL</p>
          </div>
          <button
            className="bg-gradient-to-b from-orange-300 to-orange-400 text-lg font-bold px-5 py-0.3 rounded shadow shadow-orange-300 border-1 border-gray-800/70 hover:from-yellow-300 hover:to-yellow-400"
            onClick={handleBuy}
          >
            BUY
          </button>
        </div>
      </div>
    </div>
  );
}
