"use client";

import { useEffect, useRef } from "react";
import { Application, Assets, Container, Sprite } from "pixi.js";
import flame from "@/assets/smoke.png";
import coin from "@/assets/coin.png";
import winner from "@/assets/winner.png";

interface FlameParticle {
  sprite: Sprite;
  angle: number;
  speed: number;
  life: number;
  maxLife: number;
}

export default function PixiWinner({ checked }: { checked: boolean }) {
  const pixiRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pixiRef.current) return;

    // Minimal PIXI Application: no sprites, emitters, or containers.
    const app = new Application();

    const parent = pixiRef.current;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    const initPromise = app
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

        const circleTexture = await Assets.load(coin.src);
        const circleSprite = new Sprite(circleTexture);
        circleSprite.anchor.set(0.5);
        circleSprite.x = width / 2;
        circleSprite.y = height / 2;
        app.stage.addChild(circleSprite);

        const flameTexture = await Assets.load(flame.src);

        const fireContainer = new Container();
        app.stage.addChild(fireContainer);

        const particles: FlameParticle[] = [];
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = height * 0.46;

        function spawnParticle() {
          const sprite = new Sprite(flameTexture);
          sprite.anchor.set(0.5);
          sprite.blendMode = "screen";
          sprite.scale.set(0.1 + Math.random() * 0.2);
          fireContainer.addChild(sprite);

          // pick random angle around circle
          const angle = Math.random() * Math.PI * 2;

          // place on circle edge
          sprite.x = centerX + Math.cos(angle) * radius;
          sprite.y = centerY + Math.sin(angle) * radius;

          const p: FlameParticle = {
            sprite,
            angle,
            speed: 0.6 - Math.random(), // outward drift
            life: 0,
            maxLife: 10 + Math.random() * 100,
          };

          particles.push(p);
        }

        app.ticker.add(() => {
          // spawn flames
          for (let i = 0; i < 10; i++) spawnParticle();

          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            const s = p.sprite;

            // drift outward along circle normal
            const nx = Math.cos(p.angle);
            const ny = Math.sin(p.angle);
            s.x += nx * p.speed;
            s.y += ny * p.speed;

            p.life++;
            const t = p.life / p.maxLife;

            // fade + shrink
            s.alpha = 1 - t;
            s.scale.set((1 - t * 0.5) * 0.25);

            // color shift
            if (t < 0.1) s.tint = 0xcc6600; // yellow
            else if (t < 0.4) s.tint = 0xff9933; // orange
            else if (t < 0.7) s.tint = 0xcc3300; // red
            else s.tint = 0x000000; // smoke

            if (p.life >= p.maxLife) {
              fireContainer.removeChild(s);
              particles.splice(i, 1);
            }
          }
        });

        const textTexture = await Assets.load(winner.src);
        const textSprite = new Sprite(textTexture);
        textSprite.anchor.set(0.5);
        textSprite.x = width / 2;
        textSprite.y = height / 2;
        app.stage.addChild(textSprite);
      });

    return () => {
      initPromise.then(() => {
        try {
          app.ticker.stop();
          app.destroy(true, { children: true });
        } catch (err) { };
      });
    };
  }, []);

  return (
    <div ref={pixiRef} className={`absolute mx-auto w-full h-full ${!checked
        ? "origin-hide"
        : "shrink-to-100-fade-in"}`
    } />
  );
}
