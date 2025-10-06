"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const PixiLogoFire = dynamic(() => import("./PixiLogoFire"), { ssr: false });
const PixiWinner = dynamic(() => import("./PixiWinner"), { ssr: false });

import { memo } from "react";

function LogoSectionImpl({ alert }: { alert?: string | null }) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (alert && alert.startsWith("🏆 WINNER")) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [alert]);

  return (
    <div className="w-4/5 border-0 border-x-4 border-x-yellow-200 rounded bg-gray-900/20">
      <div className="border-y-2 border-y-amber-100/20">
        <div className="w-full h-32 bg-black/20 relative overflow-hidden">
          <PixiLogoFire checked={checked} />
          <PixiWinner checked={checked} />
        </div>
        <p className="text-center text-lg text-orange-300 font-bold scale-y-150 uppercase">
          Last Spin. Last Buy. Big Win.
        </p>
      </div>
    </div>
  );
}

const LogoSection = memo(LogoSectionImpl);
export default LogoSection;