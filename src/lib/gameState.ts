// lib/gameState.ts
import { BUY_FEE_CREATOR, BUY_FEE_POOL, BUY_TIMEOUT, SELL_TIMEOUT, WIN_CHECK_TIME } from "@/utils/const";
import { bus } from "./bus";

export type BuyEvent = {
  type: "buy";
  buyer: string;          // wallet
  buyerName?: string;     // optional display handle
  amountUsd: number;
  txSig?: string;
};

export type SellEvent = {
  type: "sell";
  seller: string;
  amountUsd: number;
  txSig?: string;
};

export type WinEvent = {
  type: "win";
  winner: string;         // last buyer wallet
  payoutSuggestion: number; // 50% of creator wallet (manual payout by owner)
};

export type StateEvent = {
  type: "state";
  state: PublicState;
};

export type PublicState = {
  // creator’s Pump.fun revenue wallet (display only)
  creatorWallet: string;
  creatorWalletName?: string;
  // community / fees pool (display only)
  feesPoolWallet: string;
  // tracked values
  feesPoolUsd: number;
  marketCapUsd: number;
  creatorWalletUsd: number;
  lastBuyer?: { wallet: string; name?: string; amountUsd: number; ts: number };
  nextJackpotAt: number;
  jackpotIntervalMs: number;
};

function adaptiveJackpotIntervalMs(marketCapUsd: number) {
  // Base 30 min, scale up with market cap to make jackpots rarer as MC grows.
  const base = WIN_CHECK_TIME; // 30 min
  // Simple curve: +1 minute per $10k MC, capped at +120 min
  const extra = Math.min(120, Math.floor(marketCapUsd / 10_000)) * 60_000;
  return base + extra;
}

class GameState {
  private _state: PublicState;
  private jackpotTimer?: NodeJS.Timeout;

  constructor() {
    const now = Date.now();
    this._state = {
      creatorWallet: "CREATOR_WALLET_HERE",
      creatorWalletName: "Creator",
      feesPoolWallet: "J32jV4WAkY4yXTTrMTAHzAzl",
      feesPoolUsd: 0,
      marketCapUsd: 0,
      creatorWalletUsd: 0,
      nextJackpotAt: now + adaptiveJackpotIntervalMs(0),
      jackpotIntervalMs: adaptiveJackpotIntervalMs(0),
    };
    this.scheduleJackpot();
  }

  public state(): PublicState {
    return this._state;
  }

  /** Call when a buy happens */
  recordBuy(ev: BuyEvent) {
    // Update tracked numbers (these are approximations for UI; plug real values later)
    this._state.feesPoolUsd += ev.amountUsd * BUY_FEE_POOL;
    this._state.creatorWalletUsd += ev.amountUsd * BUY_FEE_CREATOR;
    this._state.marketCapUsd += ev.amountUsd - (ev.amountUsd * (BUY_FEE_POOL + BUY_FEE_CREATOR));
    this._state.lastBuyer = {
      wallet: ev.buyer,
      name: ev.buyerName,
      amountUsd: ev.amountUsd,
      ts: Date.now(),
    };

    // Recompute jackpot schedule as MC changed
    this.resetJackpotSchedule();

    bus.emit("event", ev);
    this.emitState();
  }

  /** Call when a sell happens */
  recordSell(ev: SellEvent) {
    // Visualize MC down for demo (replace with real pull)
    this._state.marketCapUsd = Math.max(0, this._state.marketCapUsd - ev.amountUsd * 1.5);
    bus.emit("event", ev);
    this.emitState();
  }

  private emitState() {
    const payload: StateEvent = { type: "state", state: this._state };
    bus.emit("event", payload);
  }

  private resetJackpotSchedule() {
    if (this.jackpotTimer) clearTimeout(this.jackpotTimer);
    const ms = adaptiveJackpotIntervalMs(this._state.marketCapUsd);
    this._state.jackpotIntervalMs = ms;
    this._state.nextJackpotAt = Date.now() + ms;
    this.scheduleJackpot();
  }

  private scheduleJackpot() {
    const delay = Math.max(1000, this._state.nextJackpotAt - Date.now());
    this.jackpotTimer = setTimeout(() => this.runJackpot(), delay);
  }

  private runJackpot() {
    const last = this._state.lastBuyer;
    if (last) {
      const payoutSuggestion = Math.max(0, this._state.creatorWalletUsd * 0.5);
      const win: WinEvent = {
        type: "win",
        winner: last.wallet,
        payoutSuggestion,
      };
      // NOTE: Payout is MANUAL by the owner; we only notify the front-end.
      bus.emit("event", win);
      // Show “money pour” by dropping creatorWalletUsd visually (demo only)
      this._state.creatorWalletUsd = Math.max(0, this._state.creatorWalletUsd - payoutSuggestion);
    }
    // Reschedule next jackpot with the current MC
    this.resetJackpotSchedule();
    this.emitState();
  }
}

export const gameState = new GameState();

/** MOCK MODE: generate random buys/sells so you can see the app move */
if (process.env.USE_MOCK === "1") {
  const rndWallet = () => {
    let randString = Math.random().toString(36).slice(2);
    return randString.slice(0, 6);
  };
  
  // Every BUY_TIMEOUT ms, generate a random buy
  setInterval(() => {
    gameState.recordBuy({
      type: "buy",
      buyer: rndWallet(),
      buyerName: "buyer",
      amountUsd: Math.round((Math.random() * 40 + 10) * 100) / 100,
    });
  }, BUY_TIMEOUT);

  // Every SELL_TIMEOUT ms, generate a random sell
  setInterval(() => {
    gameState.recordSell({
      type: "sell",
      seller: rndWallet(),
      amountUsd: Math.round((Math.random() * 50 + 5) * 100) / 100,
    });
  }, SELL_TIMEOUT);
}
