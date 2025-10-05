// --- Types from backend ---
export type StateMsg = {
  type: "state";
  state: {
    creatorWallet: string;
    creatorWalletName?: string;
    feesPoolWallet: string;
    feesPoolUsd: number;
    marketCapUsd: number;
    creatorWalletUsd: number;
    lastBuyer?: { wallet: string; name?: string; amountUsd: number; ts: number };
    nextJackpotAt: number;
    jackpotIntervalMs: number;
  };
};

export type BuyMsg = {
  type: "buy";
  buyer: string;
  buyerName?: string;
  amountUsd: number
};

export type SellMsg = {
  type: "sell";
  seller: string;
  amountUsd: number
};

export type WinMsg = {
  type: "win";
  winner: string;
  payoutSuggestion: number
};