// src/utils/const.ts

// =====================================================
// 🔹 Global Constants for Slot Machine dApp
// =====================================================

// === Timers & Intervals ===
export const WIN_CHECK_TIME = 22 * 1000;      // total time before win check
export const WIN_CHECK_DELAY = 1000;          // countdown update interval
export const BUY_TIMEOUT = 10 * 1000;         // disable buy button duration
export const SELL_TIMEOUT = 17 * 1000;        // reserved for sell action delay
export const NEXT_BUY_DELAY = 3000;       // min delay between buys

// === Amount Constraints ===
export const MIN_BUY_AMOUNT = 1;
export const MAX_BUY_AMOUNT = 500;

// === Slot Machine Motion ===
export const SPIN_SPEED = 16;                 // initial spin velocity
export const SPIN_DECAY = 0.85;               // deceleration rate
export const SPIN_IDLE_SPEED = 1.2;           // idle motion speed
export const SPIN_STOP_THRESHOLD = 1.5;       // speed threshold to align stop
export const SPIN_ALIGN_TOLERANCE = 2;        // pixel tolerance for stop alignment

// === Reels ===
export const REEL_COUNT = 5;
export const SYMBOLS_PER_REEL = 3;

// === Fire Effects ===
export const FIRST_COLOR = 0xffcc33;
export const SECOND_COLOR = 0xff9933;
export const THIRD_COLOR = 0xff6600;
export const LAST_COLOR = 0xcc3300;

// === Rewards & Payouts (for backend use) ===
export const BUY_FEE_POOL = 0.01;
export const BUY_FEE_CREATOR = 0.02;

// === Backend / Networking ===
export const STREAM_URL = process.env.NEXT_PUBLIC_STREAM_URL || "/api/stream";
export const PUMP_FUN_API_URL = "https://pump.fun/api"; // optional API integration
export const CREATOR_WALLET = "CREATOR_WALLET_ADDRESS_HERE"; // replace dynamically
