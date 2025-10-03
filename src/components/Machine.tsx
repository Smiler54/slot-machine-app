// components/SlotMachine.tsx
"use client";

import { useEffect, useRef } from "react";
import { Application, Assets, Container, Sprite, Text, Ticker } from "pixi.js";

// Easing functions (since pixi.js does not export Easing)
const Easing = {
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

const SYMBOLS = ["/pepe.png", "/doge.png", "/fart.png"];

export default function SlotMachine() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const app = new Application();

    (async () => {
      await app.init({
        width: 900,
        height: 500,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
      });
      rootRef.current!.appendChild(app.canvas);

      // Load assets
      const assets = await Assets.load([
        "/finish.png",
        "/coin.png",
        ...SYMBOLS,
      ]);
      const finish = await Assets.load("/finish.png"); // assets["/finish.png"];
      const coin = await Assets.load("/coin.png"); // assets["/coin.png"];
      const memes = await Promise.all([
        Assets.load(SYMBOLS[0]),
        Assets.load(SYMBOLS[1]),
        Assets.load(SYMBOLS[2])
      ]);
      //SYMBOLS.map(async (key) => await Assets.load(key)); //assets[key]

      // Background finish line
      const bg = new Sprite(finish);
      bg.width = app.screen.width;
      bg.height = app.screen.height;
      bg.alpha = 0.25;
      app.stage.addChild(bg);

      // Continuous spinning coin
      const coinSpr = new Sprite(coin);
      coinSpr.anchor.set(0.5);
      coinSpr.x = app.screen.width - 120;
      coinSpr.y = 110;
      coinSpr.scale.set(0.8);
      app.stage.addChild(coinSpr);

      // Reel area
      const reels: Container[] = [];
      for (let i = 0; i < 3; i++) {
        const reel = new Container();
        reel.x = 160 + i * 200;
        reel.y = 280;
        const slot = new Sprite(memes[i % memes.length]);
        slot.anchor.set(0.5);
        slot.scale.set(0.6);
        reel.addChild(slot);
        app.stage.addChild(reel);
        reels.push(reel);
      }

      // A simple “money pour” container for win effect
      const rainLayer = new Container();
      app.stage.addChild(rainLayer);

      // Spin animation
      function spinOnce() {
        // swap symbols & nudge reels
        reels.forEach((reel, i) => {
          const spr = reel.children[0] as Sprite;
          const img = memes[Math.floor(Math.random() * memes.length)];
          spr.texture = img;
          // little bump animation
          const startY = reel.y;
          const targetY = startY - 40;
          let t = 0;
          const dur = 300 + i * 120;
          const tick = (dt: Ticker) => {
            t += dt.deltaTime * 16.6667;
            const p = Math.min(1, t / dur);
            reel.y = startY + (targetY - startY) * Easing.outCubic(Math.min(1, p));
            if (p >= 1) {
              // drop back
              app.ticker.remove(tick);
              const t2Start = reel.y;
              const t2End = startY;
              let t2 = 0;
              const tick2 = (dt2: Ticker) => {
                t2 += dt2.deltaTime * 16.6667;
                const pp = Math.min(1, t2 / 260);
                reel.y = t2Start + (t2End - t2Start) * Easing.inOutCubic(pp);
                if (pp >= 1) app.ticker.remove(tick2);
              };
              app.ticker.add(tick2);
            }
          };
          app.ticker.add(tick);
        });
      }

      // Money rain (win)
      function moneyPour() {
        for (let i = 0; i < 40; i++) {
          const c = new Sprite(coin);
          c.anchor.set(0.5);
          c.x = 120 + Math.random() * (app.screen.width - 240);
          c.y = -20 - Math.random() * 150;
          c.scale.set(0.25 + Math.random() * 0.25);
          (c as any).vy = 2 + Math.random() * 3;
          rainLayer.addChild(c);
        }
      }
      app.ticker.add(() => {
        // continuous coin rotate
        coinSpr.rotation += 0.07;
        // update money rain
        for (const child of [...rainLayer.children]) {
          const s = child as Sprite & { vy: number };
          s.y += s.vy || 3;
          if (s.y > app.screen.height + 30) {
            s.destroy();
          }
        }
      });

      // Hook up SSE
      const url = process.env.NEXT_PUBLIC_STREAM_URL || "/api/stream";
      const es = new EventSource(url);
      es.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === "buy") spinOnce();
        if (msg.type === "sell") {
          // quick “jeet flash” border
          flashBorder(app);
        }
        if (msg.type === "win") {
          // money pour celebration
          moneyPour();
        }
      };

      // stylistic “finish line” flash on sell (jeet alert)
      function flashBorder(app: Application) {
        const mask = new Container();
        const border = new Text("🧻 JEET ALERT", { fontSize: 42, fill: 0x000000 });
        border.anchor.set(0.5);
        border.x = app.screen.width / 2;
        border.y = 70;
        app.stage.addChild(mask);
        app.stage.addChild(border);
        let t = 0;
        const tick = (dt: Ticker) => {
          t += dt.deltaTime;
          border.alpha = 0.25 + 0.75 * Math.abs(Math.sin(t * 0.4));
          if (t > 40) {
            app.ticker.remove(tick);
            border.destroy();
            mask.destroy();
          }
        };
        app.ticker.add(tick);
      }

      // Cleanup
      return () => {
        es.close();
        app.destroy(true, { children: true });
      };
    })();

    return () => {
      // no-op; the inner cleanup handles destroy
    };
  }, []);

  return <div ref={rootRef} className="w-full h-[520px] rounded-2xl bg-black/40 border border-white/10 overflow-hidden" />;
}
