"use client";
import { useEffect, useRef } from "react";
import { Application, Assets, Container, Sprite, Graphics } from "pixi.js";
import doge from "@/assets/doge.png";
import meme from "@/assets/meme.png";
import pepe from "@/assets/pepe.png";
import mask from "@/assets/mask.png";
import {
  REEL_COUNT,
  SPIN_DECAY,
  SPIN_SPEED,
  SPIN_IDLE_SPEED,
  SYMBOLS_PER_REEL,
  NEXT_BUY_DELAY,
} from "@/utils/const";

export default function PixiSlotMachine() {
  const pixiRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const reelItemsRef = useRef<Sprite[]>([]);

  // motion state
  const velocityRef = useRef(SPIN_IDLE_SPEED);
  const stopRequestedRef = useRef(false);
  const isSpinningRef = useRef(false);

  useEffect(() => {
    if (!pixiRef.current) return;

    const parent = pixiRef.current;
    const width = parent.clientWidth;
    const height = parent.clientHeight;

    const app = new Application();
    appRef.current = app;

    let destroyed = false;

    const init = async () => {
      await app.init({
        width,
        height,
        background: 0x1f1f1f,
        antialias: true,
      });

      if (destroyed) return;
      pixiRef.current?.appendChild(app.canvas);

      // Load images
      const textures = await Promise.all([
        Assets.load(doge.src),
        Assets.load(meme.src),
        Assets.load(pepe.src),
      ]);

      // Reel container
      const reel = new Container();
      app.stage.addChild(reel);
      const SYMBOL_SIZE = Math.floor(width / REEL_COUNT / 30) * 30 || 90; // each item height

      const reelItems: Sprite[] = [];
      // Create 3 coin sprites
      for (let k = 0; k < REEL_COUNT; k++) {
        for (let i = 0; i < SYMBOLS_PER_REEL; i++) {
          const randomTex = textures[Math.floor(Math.random() * textures.length)];
          const sprite = new Sprite(randomTex);
          sprite.width = SYMBOL_SIZE;
          sprite.height = SYMBOL_SIZE;
          sprite.anchor.set(0.5);
          sprite.x = app.screen.width / REEL_COUNT * k + app.screen.width / 10;
          sprite.y = i * SYMBOL_SIZE + SYMBOL_SIZE / 2;
          reel.addChild(sprite);
          reelItems.push(sprite);
        }
      }

      reelItemsRef.current = reelItems;

      // === Column separators ===
      const separators = new Graphics();
      const colWidth = width / REEL_COUNT;
      const lineColor = 0xff6633; // golden yellow
      const lineAlpha = 0.6;
      const lineWidth = 2;
      for (let i = 1; i < REEL_COUNT; i++) {
        const x = colWidth * i;
        separators.moveTo(x, 0);
        separators.lineTo(x, height);
      }
      separators.stroke({ width: lineWidth, color: lineColor, alpha: lineAlpha });
      app.stage.addChild(separators);

      // Mask decoration
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
      app.ticker.add(() => {
        for (let sprite of reelItemsRef.current) {
          sprite.y += velocityRef.current;
          if (sprite.y - SYMBOL_SIZE / 2 > app.screen.height) {
            sprite.y -= SYMBOL_SIZE * SYMBOLS_PER_REEL;
            sprite.texture = textures[Math.floor(Math.random() * textures.length)];
          }
        }

        if (isSpinningRef.current && stopRequestedRef.current) {
          if (velocityRef.current > SPIN_IDLE_SPEED) {
            velocityRef.current *= SPIN_DECAY;
          } else {
            const targetY = height - SYMBOL_SIZE / 2 - 15;
            let closest = reelItemsRef.current[0];
            let minDist = Math.abs(closest.y - targetY);
            for (let s of reelItemsRef.current) {
              const d = Math.abs(s.y - targetY);
              if (d < minDist) {
                minDist = d;
                closest = s;
              }
            }


            if (minDist < SPIN_IDLE_SPEED) {
              closest.y = targetY;
              velocityRef.current = 0;
              stopRequestedRef.current = false;
              isSpinningRef.current = false;

              // After stop, go back to idle slow scroll
              setTimeout(() => {
                velocityRef.current = SPIN_IDLE_SPEED;
              }, NEXT_BUY_DELAY);
            } else {
              velocityRef.current = SPIN_IDLE_SPEED;
            }
          }
        }
      });

      // Handle events
      const handleSpin = () => {
        if (isSpinningRef.current) return;
        // console.log("🎰 Slot spin triggered");
        isSpinningRef.current = true;
        velocityRef.current = SPIN_SPEED;
        stopRequestedRef.current = false;
        setTimeout(() => {
          stopRequestedRef.current = true;
        }, NEXT_BUY_DELAY / 2);
      };

      const handleWinner = () => {
        // console.log("🏆 Winner event triggered");
      }

      window.addEventListener("slot-spin", handleSpin);
      window.addEventListener("slot-winner", handleWinner);

      return () => {
        window.removeEventListener("slot-spin", () => { });
        window.removeEventListener("slot-winner", () => { });
      }
    };

    init();

    return () => {
      destroyed = true;
      try {
        app.ticker.stop();
        app.stage.removeChildren();
        app.destroy(true, { children: true, texture: true });
      } catch (err) { }
    };
  }, []);

  return (
    <div className="h-24 flex justify-center items-center overflow-hidden bg-black border-2 border-red-400/60 divide-x-2 divide-red-400/60">
      <div ref={pixiRef} className="w-full h-full" />
    </div>
  )
}
