// lib/serverState.ts

// Type for our local game singleton
export interface LocalGame {
  publicState(): PublicState;
  addClient(fn: (msg: any) => void): number;
  removeClient(id: number): void;
  recordBuy(p: BuyPayload): {
    reward: number;
    multi: number;
    result: string[];
    isWinner: boolean;
  };
}

export type BuyPayload = { address: string; amountUsd: number };

export type PublicState = {
  creatorWallet: string;
  creatorWalletName: string;
  feesPoolWallet: string;
  communityPoolWallet: string;
  creatorFees: number;
  feesPool: number;
  pumpBonus: number;
  lastBuyerReward: number;
  minBuyUsd: number;
  lastBuyer?: { address: string; amountUsd: number };
};

type ClientFn = (msg: any) => void;

declare global {
  // eslint-disable-next-line no-var
  var __LOCAL_GAME__: LocalGame;
}

const CREATOR_FEE_PCT = 0.10;
const FEES_POOL_PCT   = 0.05;
const PUMP_BONUS_PCT  = 0.05;
const LBR_TOPUP_PCT   = 0.80;

const PAYOUT_TABLE: Record<number, number> = {
  5: 12.0,
  4: 4.0,
  3: 2.0,
  2: 0.0,
  1: 0.0,
};

const SYMBOLS = ["pepe", "doge", "fart"];
const WEIGHTS: Record<string, number> = { pepe: 1, doge: 1, fart: 1 };

const CREATOR = { name: "Creator", addr: "So1anaCreatorWalletXXXXXXXXXXXXXX" };
const FEES_POOL_ADDR = "Fe3sPo0lXXXXXXXXXXXXXX";
const COMMUNITY_POOL_ADDR = "C0mmunityPo0lXXXXXXXXXXXXX";

let creatorFees = 1000;
let feesPool = 500;
let pumpBonus = 200;
let lastBuyerReward = 300;
let lastBuyer: PublicState["lastBuyer"] | undefined;

let nextId = 1;
const clients = new Map<number, ClientFn>();

function pickSymbol(): string {
  const total = SYMBOLS.reduce((s, k) => s + (WEIGHTS[k] || 1), 0);
  let r = Math.random() * total;
  for (const s of SYMBOLS) {
    r -= (WEIGHTS[s] || 1);
    if (r <= 0) return s;
  }
  return SYMBOLS[0];
}

function spinReels(n = 5): string[] {
  return Array.from({ length: n }, () => pickSymbol());
}

function multiplierFromResult(result: string[]): number {
  const counts: Record<string, number> = {};
  result.forEach(s => (counts[s] = (counts[s] || 0) + 1));
  const best = Math.max(...Object.values(counts));
  return PAYOUT_TABLE[best] ?? 0;
}

function broadcast(msg: any) {
  for (const [, fn] of clients) fn(msg);
  const snapshot = publicState();
  for (const [, fn] of clients) fn({ type: "state", payload: snapshot });
}

function publicState(): PublicState {
  return {
    creatorWallet: CREATOR.addr,
    creatorWalletName: CREATOR.name,
    feesPoolWallet: FEES_POOL_ADDR,
    communityPoolWallet: COMMUNITY_POOL_ADDR,
    creatorFees,
    feesPool,
    pumpBonus,
    lastBuyerReward,
    minBuyUsd: 1,
    lastBuyer,
  };
}

function addClient(fn: ClientFn) {
  const id = nextId++;
  clients.set(id, fn);
  return id;
}
function removeClient(id: number) {
  clients.delete(id);
}

function recordBuy(p: BuyPayload) {
  const amount = Math.max(0, Number(p.amountUsd) || 0);
  creatorFees     += amount * CREATOR_FEE_PCT;
  feesPool        += amount * FEES_POOL_PCT;
  pumpBonus       += amount * PUMP_BONUS_PCT;
  lastBuyerReward += amount * LBR_TOPUP_PCT;

  const result = spinReels(5);
  const multi = multiplierFromResult(result);
  const reward = +(amount * multi).toFixed(2);
  const isWinner = reward > amount;

  const paid = Math.min(reward, lastBuyerReward);
  lastBuyerReward = +(lastBuyerReward - paid).toFixed(2);

  lastBuyer = { address: p.address, amountUsd: amount };

  broadcast({ type: "buy", addr: p.address, amountUsd: amount, result, multi, reward: paid, isWinner });

  return { reward: paid, multi, result, isWinner };
}

function ensureSingleton() {
  if (!globalThis.__LOCAL_GAME__) {
    globalThis.__LOCAL_GAME__ = {
      publicState,
      addClient,
      removeClient,
      recordBuy,
    };
  }
}
ensureSingleton();
