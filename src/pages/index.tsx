// import SlotMachine from "@/components/SlotMachine";

// export default function Home() {
//   return (
//     <div
//       className={`min-h-screen`}
//     >
//       <main className="flex flex-col gap-[32px] items-center">
//         <SlotMachine />
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//       </footer>
//     </div>
//   );
// }

import dynamic from "next/dynamic";
import HUD from "@/components/HUD";

const SlotMachine = dynamic(() => import("@/components/Machine"), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white flex flex-col items-center gap-6 py-8">
      <h1 className="text-3xl font-bold">Pump.fun Slot Machine Live</h1>
      <HUD />
      <div className="w-[960px] max-w-[95vw]">
        <SlotMachine />
      </div>
      <p className="text-xs text-white/60">
        *Jackpot interval adapts as market cap grows. Payout suggestion = 50% of creator wallet (manual send).
      </p>
    </div>
  );
}