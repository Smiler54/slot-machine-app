import { memo } from "react";

function ResultToastImpl({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div className={`fixed top-2 right-2 z-50 px-4 py-2 rounded-3xl border shadow ${
      text.startsWith("💰")
      ? "bg-yellow-500/20 border-yellow-300 text-white"
      : text.startsWith("🏆")
      ? "bg-green-500/20 border-green-400 text-white"
      : "bg-red-500/20 border-red-400 text-white"
    }`}>
      {text}
    </div>
  );
}

const ResultToast = memo(ResultToastImpl);
export default ResultToast;