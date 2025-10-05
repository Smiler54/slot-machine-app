"use client";
import PixiTokenFire from "./PixiTokenFire";
import { StateMsg } from "../../utils/types";

export default function InfoSection({ state }: { state?: StateMsg["state"] | null }) {
  return (
    <div className="w-8/9 mt-3 border-0 border-x-4 border-x-yellow-200 rounded bg-gray-900/20">
      <div className="border-y-4 border-y-amber-100/10 px-2 py-1">
        <PixiTokenFire />

        <div className="flex flex-wrap justify-around font-bold text-center leading-4 divide-x-1 divide-orange-300/30 border-b border-orange-300/30 py-1">
          <div className="w-3/7 flex flex-col justify-around items-center">
            <span className="text-sm text-orange-300 uppercase">Creator Fees</span>
            <span className="text-lg -m-1 text-red-400 font-bold truncate">
              {'$'}{state?.creatorWalletUsd.toFixed(2)}
            </span>
          </div>
          <div className="w-2/7 flex flex-col justify-between items-center">
            <span className="text-sm text-green-400 uppercase">Pump Bonus</span>
          </div>
          <div className="w-2/7 flex flex-col justify-between items-center">
            <span className="text-sm text-orange-300 uppercase">Community Pool</span>
          </div>
        </div>

        <div className="flex justify-around font-bold text-center leading-4 p-1 divide-x-1 divide-orange-300/30">
          <span className="text-red-400 w-3/5 uppercase">
            {state?.lastBuyer
              ? `Last Buy : $${state.lastBuyer.amountUsd.toFixed(2)}`
              : "Last Buyer Reward"}
          </span>
          <span className="text-orange-100 w-2/5">pump.fun</span>
        </div>
      </div>
    </div>
  );
};