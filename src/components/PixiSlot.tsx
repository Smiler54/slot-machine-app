"use client";
import { useEffect, useRef } from "react";
import { Application, Assets, Container, Sprite, Graphics, Ticker } from "pixi.js";
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
        backgroundAlpha: 0,
        antialias: true,
      })
      .then(async () => {
        pixiRef.current?.appendChild(app.canvas);
        appRef.current = app;

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
          sprite.anchor.set(0.5);
          sprite.x = app.screen.width / 2;
          sprite.y = i * SYMBOL_SIZE + SYMBOL_SIZE / 2;
          reel.addChild(sprite);
          reelItems.push(sprite);
        }

        reelItemsRef.current = reelItems;

        // // Continuous coin/logo spin (rotation)
        // const spinner = new Container();
        // app.stage.addChild(spinner);
        // const spinSprite = new Sprite(textures[0]);
        // spinSprite.anchor.set(0.5);
        // spinSprite.width = SYMBOL_SIZE * 0.9;
        // spinSprite.height = SYMBOL_SIZE * 0.9;
        // spinSprite.x = app.screen.width / 2;
        // spinSprite.y = app.screen.height / 2;
        // spinner.addChild(spinSprite);

        // let texIdx = 0;
        // let timeAccum = 0;

        // Animate reel scrolling
        app.ticker.add((delta : Ticker) => {
          // // rotate coin
          // spinner.rotation += 0.05 * delta.deltaTime;
          // timeAccum += delta.deltaTime;
          // if (timeAccum > 45) {
          //   timeAccum = 0;
          //   texIdx = (texIdx + 1) % textures.length;
          //   spinSprite.texture = textures[texIdx];
          // }

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
