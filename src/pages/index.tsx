import dynamic from "next/dynamic";

const SlotMachine = dynamic(() => import("@/components/SlotMachine"), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white flex flex-col items-center gap-6 py-8">
      <h1 className="text-3xl font-bold">Pump.fun Slot Machine Live</h1>

      <div className="flex justify-center">
        <SlotMachine />
      </div>

      <p className="text-xs text-white/60">
        *Jackpot interval adapts as market cap grows. Payout suggestion = 50% of creator wallet (manual send).
      </p>
    </div>
  );
}