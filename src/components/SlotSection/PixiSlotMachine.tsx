"use client";
import { useEffect, useRef } from "react";
import { Application, Assets, Container, Sprite, Graphics, Ticker } from "pixi.js";
import doge from "@/assets/doge.png";
import meme from "@/assets/meme.png";
import pepe from "@/assets/pepe.png";
import mask from "@/assets/mask.png";
// import { StateMsg, BuyMsg, SellMsg, WinMsg } from "../../utils/types";

export default function PixiSlotMachine() {
  const pixiRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const reelItemsRef = useRef<Sprite[]>([]);

  // motion state
  const velocityRef = useRef(8);        // starting spin speed
  const minSpeed = 3;                   // crawl speed before stop
  const decelFactor = 0.98;             // smooth slowdown multiplier
  const stopRequestedRef = useRef(false);

  // const alertTimer = useRef<any>(null);

  useEffect(() => {
    if (!pixiRef.current) return;

    const parent = pixiRef.current;
    const width = parent.clientWidth;
    const height = parent.clientHeight;

    const app = new Application();
    const initPromise = app
      .init({
        width,
        height,
        backgroundAlpha: 0,
        antialias: true,
      })
      .then(async () => {
        if (!app || !app.stage) return;
        pixiRef.current?.appendChild(app.canvas);
        appRef.current = app;

        // Load images
        const textures = await Promise.all([
          Assets.load(doge.src),
          Assets.load(meme.src),
          Assets.load(pepe.src),
        ]);

        // Finish-line flag background (checkerboard)
        const flag = new Graphics();
        const cell = Math.max(6, Math.floor(width / 18));
        for (let y = 0; y < height; y += cell) {
          for (let x = 0; x < width; x += cell) {
            const dark = ((x / cell) + (y / cell)) % 2 === 0;
            flag.rect(x, y, cell, cell).fill(dark ? 0x111111 : 0x333333);
          }
        }
        app.stage.addChild(flag);

        // Reel container
        const reel = new Container();
        app.stage.addChild(reel);

        const SYMBOL_SIZE = Math.floor(width / 5 / 30) * 30 || 90; // each item height

        const reelItems: Sprite[] = [];

        // Create 3 coin sprites
        for (let k = 0; k < 5; k++) {
          for (let i = 0; i < 3; i++) {
            const randomTex = textures[Math.floor(Math.random() * textures.length)];
            const sprite = new Sprite(randomTex);
            sprite.width = SYMBOL_SIZE;
            sprite.height = SYMBOL_SIZE;
            sprite.anchor.set(0.5);
            sprite.x = app.screen.width / 5 * k + app.screen.width / 10;
            sprite.y = i * SYMBOL_SIZE + SYMBOL_SIZE / 2;
            reel.addChild(sprite);
            reelItems.push(sprite);
          }
        }

        reelItemsRef.current = reelItems;

        const maskTex = await Assets.load(mask.src);
        const container = new Container();
        const topMask = new Sprite(maskTex);
        topMask.anchor.set(0.5);
        topMask.rotation = Math.PI;
        topMask.x = app.screen.width / 2;
        topMask.y = 15;
        topMask.scale.set(app.screen.width / 10, 1);

        const botMask = new Sprite(maskTex);
        botMask.anchor.set(0.5);
        botMask.x = app.screen.width / 2;
        botMask.y = app.screen.height - 15;
        botMask.scale.set(app.screen.width / 10, 1);

        container.addChild(topMask);
        container.addChild(botMask);
        app.stage.addChild(container);

        // Animate reel scrolling
        app.ticker.add((delta: Ticker) => {
          // reel scroll
          for (let sprite of reelItemsRef.current) {
            sprite.y += velocityRef.current;
            if (sprite.y - SYMBOL_SIZE / 2 > app.screen.height) {
              sprite.y -= SYMBOL_SIZE * 3;
              sprite.texture = textures[Math.floor(Math.random() * textures.length)];
            }
          }

          // if stop was requested
          if (stopRequestedRef.current) {
            if (velocityRef.current > minSpeed) {
              velocityRef.current *= decelFactor;
            } else {
              const targetY = app.screen.height - SYMBOL_SIZE / 2;
              const closest = reelItemsRef.current.reduce((prev, curr) => {
                return Math.abs(curr.y - targetY) < Math.abs(prev.y - targetY)
                  ? curr
                  : prev;
              });

              // if one symbol is at bottom → stop reel
              if (Math.abs(closest.y - targetY) < minSpeed) {
                closest.y = targetY;
                velocityRef.current = 0;
                stopRequestedRef.current = false;
              }
            }
          }
        });
      });

    return () => {
      initPromise.then(() => {
        try {
          app.ticker.stop();
          app.stage.removeChildren();
          app.destroy(true, { children: true, texture: true });
        } catch (err) { }
      });
    };
  }, []);

  // useEffect(() => {
  //   const url = process.env.NEXT_PUBLIC_STREAM_URL || "/api/stream";
  //   const es = new EventSource(url);

  //   es.onmessage = (e) => {
  //     const msg = JSON.parse(e.data) as StateMsg | BuyMsg | SellMsg | WinMsg;
  //     if (msg.type === "buy") {
  //       velocityRef.current = 16;      // reset to full speed
  //       stopRequestedRef.current = false;
  //       resetAnim();
  //     }
  //   };

  //   function resetAnim(ms = 2000) {
  //     if (alertTimer.current) clearTimeout(alertTimer.current);
  //     alertTimer.current = setTimeout(() => {
  //       stopRequestedRef.current = true;
  //     }, ms);
  //   }

  //   return () => {
  //     es.close();
  //     if (alertTimer.current) clearTimeout(alertTimer.current);
  //   }
  // }, []);

  return (
    <div className="h-24 flex justify-center items-center overflow-hidden bg-black border-2 border-red-400/60 divide-x-2 divide-red-400/60">
      <div ref={pixiRef} className="w-full h-full" />
    </div>
  )
}
