"use client";

import { useEffect, useRef } from "react";
import { Application, Assets, Container, Sprite, Text, TextStyle, Graphics, Ticker } from "pixi.js";
import flame from "@/assets/smokeparticle.png";
import circle from "@/assets/circle.png";
import winner from "@/assets/winner.png";

type Coin = { g: Graphics; vy: number; rot: number };

interface FlameParticle {
  sprite: Sprite;
  angle: number;
  speed: number;
  life: number;
  maxLife: number;
}

export default function PixiWinner({ checked } : { checked: boolean }) {
  const pixiRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pixiRef.current) return;

    // Minimal PIXI Application: no sprites, emitters, or containers.
    const app = new Application();

    const parent = pixiRef.current;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    app
      .init({
        width,
        height,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
      })
      .then(async () => {
        // Append the canvas to the div
        pixiRef.current?.appendChild(app.canvas);

        const layer = new Container();
        app.stage.addChild(layer);

        const coins: Coin[] = [];

        function spawnCoin() {
          const g = new Graphics();
          const r = 6 + Math.random() * 8;
          g.circle(0, 0, r).fill(0xFFD700).stroke({ color: 0xAA8800, width: 2 }); // gold coin
          g.moveTo(-r / 2, 0).lineTo(r / 2, 0).stroke({ color: 0xAA8800, width: 2 }); // $ stripe
          g.x = Math.random() * width;
          g.y = -20;
          layer.addChild(g);
          coins.push({ g, vy: 1.5 + Math.random() * 1.5, rot: (Math.random() - 0.5) * 0.08 });
        }

        let pourTime = 0;
        app.ticker.add((delta : Ticker) => {
          if (checked && pourTime < 240) {
            // ~4s of pouring
            for (let i = 0; i < 10; i++) spawnCoin();
            pourTime += delta.deltaTime;
          }
          for (let i = coins.length - 1; i >= 0; i--) {
            const c = coins[i];
            c.g.y += c.vy * delta.deltaTime;
            c.g.rotation += c.rot * delta.deltaTime;
            if (c.g.y > height + 30) {
              layer.removeChild(c.g);
              coins.splice(i, 1);
            }
          }
        });

        // const circleTexture = await Assets.load(circle.src);
        // const circleSprite = new Sprite(circleTexture);
        // circleSprite.anchor.set(0.5);
        // circleSprite.x = width / 2;
        // circleSprite.y = height / 2;
        // app.stage.addChild(circleSprite);

        // const flameTexture = await Assets.load(flame.src);

        // const fireContainer = new Container();
        // app.stage.addChild(fireContainer);

        // const particles: FlameParticle[] = [];
        // const centerX = width / 2;
        // const centerY = height / 2;
        // const radius = height * 0.46;

        // function spawnParticle() {
        //   const sprite = new Sprite(flameTexture);
        //   sprite.anchor.set(0.5);
        //   sprite.blendMode = "screen";
        //   sprite.scale.set(0.1 + Math.random() * 0.2);
        //   fireContainer.addChild(sprite);

        //   // pick random angle around circle
        //   const angle = Math.random() * Math.PI * 2;

        //   // place on circle edge
        //   sprite.x = centerX + Math.cos(angle) * radius;
        //   sprite.y = centerY + Math.sin(angle) * radius;

        //   const p: FlameParticle = {
        //     sprite,
        //     angle,
        //     speed: 0.6 - Math.random(), // outward drift
        //     life: 0,
        //     maxLife: 10 + Math.random() * 120,
        //   };

        //   particles.push(p);
        // }

        // app.ticker.add(() => {
        //   // spawn flames
        //   for (let i = 0; i < 5; i++) spawnParticle();

        //   for (let i = particles.length - 1; i >= 0; i--) {
        //     const p = particles[i];
        //     const s = p.sprite;

        //     // drift outward along circle normal
        //     const nx = Math.cos(p.angle);
        //     const ny = Math.sin(p.angle);
        //     s.x += nx * p.speed;
        //     s.y += ny * p.speed;

        //     p.life++;
        //     const t = p.life / p.maxLife;

        //     // fade + shrink
        //     s.alpha = 1 - t;
        //     s.scale.set((1 - t * 0.5) * 0.5);

        //     // color shift
        //     if (t < 0.1) s.tint = 0xcc6600; // yellow
        //     else if (t < 0.4) s.tint = 0xff9933; // orange
        //     else if (t < 0.7) s.tint = 0xcc3300; // red
        //     else s.tint = 0x000000; // smoke

        //     if (p.life >= p.maxLife) {
        //       fireContainer.removeChild(s);
        //       particles.splice(i, 1);
        //     }
        //   }
        // });

        // const textTexture = await Assets.load(winner.src);
        // const textSprite = new Sprite(textTexture);
        // textSprite.anchor.set(0.5);
        // textSprite.x = width / 2;
        // textSprite.y = height / 2;
        // app.stage.addChild(textSprite);
      });

    return () => {
      app.destroy(true, { children: true });
    };
  }, []);

  return (
    // <div ref={pixiRef} className={`absolute mx-auto w-full h-full ${
    //   !checked
    //   ? "origin-hide"
    //   : "shrink-to-100-fade-in"}`
    // } />
    <div
      ref={pixiRef}
      className={`absolute inset-0 mx-auto w-full h-full pointer-events-none ${
        checked ? "opacity-100" : "opacity-0"
      } transition-opacity duration-300`}
    />
  );
}
