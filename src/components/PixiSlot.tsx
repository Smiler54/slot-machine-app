"use client";
import { useEffect, useRef, useState } from "react";
import { Application, Assets, Container, Sprite } from "pixi.js";
import doge from "@/assets/doge.png";
import meme from "@/assets/meme.png";
import pepe from "@/assets/pepe.png";

export default function PixiSlot({ stopping }: { stopping: boolean }) {
  const pixiRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const reelItemsRef = useRef<Sprite[]>([]);

  // motion state
  const velocityRef = useRef(8);        // starting spin speed
  const minSpeed = 1;                   // crawl speed before stop
  const decelFactor = 0.98;             // smooth slowdown multiplier
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    if (!pixiRef.current) return;

    const parent = pixiRef.current;
    const width = parent.clientWidth;
    const height = parent.clientHeight;

    const app = new Application();
    app
      .init({
        width,
        height,
        backgroundAlpha: 0
      })
      .then(async () => {
        pixiRef.current?.appendChild(app.canvas);
        appRef.current = app;

        // Load images
        const textures = await Promise.all([
          Assets.load(doge.src),
          Assets.load(meme.src),
          Assets.load(pepe.src),
        ]);

        // Reel container
        const reel = new Container();
        app.stage.addChild(reel);

        const SYMBOL_SIZE = Math.floor(width / 30) * 30 || 90; // each item height

        const reelItems: Sprite[] = [];

        // Create 3 coin sprites
        for (let i = 0; i < 3; i++) {
          const randomTex = textures[Math.floor(Math.random() * textures.length)];
          const sprite = new Sprite(randomTex);
          sprite.width = SYMBOL_SIZE;
          sprite.height = SYMBOL_SIZE;
          sprite.x = (app.screen.width - SYMBOL_SIZE) / 2; // center horizontally
          sprite.y = i * SYMBOL_SIZE;
          reel.addChild(sprite);
          reelItems.push(sprite);
        }

        reelItemsRef.current = reelItems;

        // Animate reel scrolling
        app.ticker.add(() => {
          // move all symbols
          for (let sprite of reelItemsRef.current) {
            sprite.y += velocityRef.current;

            if (sprite.y > app.screen.height) {
              sprite.y -= SYMBOL_SIZE * 3; // wrap around
              sprite.texture = textures[Math.floor(Math.random() * textures.length)];
            }
          }

          // if stop was requested
          if (stopRequestedRef.current) {
            if (velocityRef.current > minSpeed) {
              // decelerate smoothly
              velocityRef.current *= decelFactor;
            } else {
              // crawl speed: wait until alignment
              const targetY = app.screen.height - SYMBOL_SIZE;

              const closest = reelItemsRef.current.reduce((prev, curr) => {
                return Math.abs(curr.y - targetY) < Math.abs(prev.y - targetY)
                  ? curr
                  : prev;
              });

              // if one symbol is at bottom → stop reel
              if (Math.abs(closest.y - targetY) < 2) {
                closest.y = targetY;
                velocityRef.current = 0;
                stopRequestedRef.current = false;
              }
            }
          }
        });
      });

    return () => {
      app.destroy(true, { children: true });
    };
  }, []);

  // 👇 React to "spinning" prop
  useEffect(() => {
    if (!appRef.current) return;

    if (stopping) {
      stopRequestedRef.current = true;
    } else {
      velocityRef.current = 8;      // reset to full speed
      stopRequestedRef.current = false;
    }

  }, [stopping]);

  return (
    <div className="flex items-center justify-center overflow-hidden">
      <div ref={pixiRef} className="w-full h-full" />
    </div>
  )
}
