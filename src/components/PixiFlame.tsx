"use client";

import { useEffect, useRef } from "react";
import { Application, Assets, Container, Text, TextStyle, Sprite, BlurFilter } from "pixi.js";
import flame from "@/assets/smokeparticle.png";

interface FlameParticle {
  sprite: Sprite;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export default function PixiFlame() {
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

        const flameTexture = await Assets.load(flame.src);

        // 🔥 Fire container
        const fireContainer = new Container();
        app.stage.addChild(fireContainer);

        const particles: FlameParticle[] = [];

        function spawnParticle() {
          const sprite = new Sprite(flameTexture);
          sprite.anchor.set(0.5);
          sprite.blendMode = 'screen';
          sprite.x = Math.random() * width; // cover whole background
          sprite.y = height + 20 - Math.random() * height / 2; // start just below screen
          sprite.scale.set(0.8 + Math.random() * 0.6); // large blobs
          sprite.alpha = 0.9;
          fireContainer.addChild(sprite);

          const p: FlameParticle = {
            sprite,
            vx: (Math.random() - 0.5) * 0.5, // gentle side sway
            vy: -1 - Math.random() * 0.5, // slow upward drift
            life: 0,
            maxLife: height + Math.random() * height / 2,
          };

          particles.push(p);
        }

        // 🔄 Animate
        app.ticker.add(() => {
          // spawn a few per frame
          for (let i = 0; i < 3; i++) {
            spawnParticle();
          }

          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.sprite.x += p.vx;
            p.sprite.y += p.vy;
            p.life++;

            const t = p.life / p.maxLife;

            // fade & slight shrink
            // p.sprite.alpha = 1 - t * 0.8;
            p.sprite.scale.set(1 - t * 0.5);

            // 🔥 tint by height (bottom yellow → orange → red)
            if (t < 0.1) p.sprite.tint = 0x993300;
            else if (t < 0.4) p.sprite.tint = 0xcc9933;
            else if (t < 0.7) p.sprite.tint = 0xcc3300;
            else p.sprite.tint = 0xcc3300;

            if (p.life >= p.maxLife) {
              fireContainer.removeChild(p.sprite);
              particles.splice(i, 1);
            }
          }
        });

        const textStyle = new TextStyle({
          fontFamily: "Arial Black",
          fontSize: 80,
          align: "center",
          fill: "#fff066",
          stroke: {
            color: "#fff066",
            width: 1,
          },
          dropShadow: {
            color: "black",
            blur: 2,
            distance: 1,
            angle: Math.PI / 2,
          },
        });
        const text = new Text({
          text: "$LAST",
          style: textStyle
        });
        text.anchor.set(0.5); // center anchor
        text.x = width / 2;
        text.y = height / 2;
        text.scale.set(1, 1.1);

        const glow = new Text({
          text: "$LAST",
          style: {
            fontFamily: "Arial Black",
            fontSize: 80,
            align: "center",
            fill: "#ffffff",
          },
        });
        glow.anchor.set(0.5);
        // glow.alpha = 0.6;
        glow.x = width / 2;
        glow.y = height / 2;
        glow.scale.set(1, 1.1);
        
        app.stage.addChild(text);
        app.stage.addChild(glow);

        const blur = new BlurFilter({
          strength: 0,     // start at 0 and animate upward
          quality: 4,      // lower if you need more perf
          resolution: 1,
          kernelSize: 7,
        });
        glow.filters = [blur];

        let tAccum = 0;
        const minStrength = 0;   // no blur at minimum
        const maxStrength = 8;   // feel free to tweak
        const minAlpha = 0.15;
        const maxAlpha = 0.85;
        const pulseSpeed = 0.00025;

        app.ticker.add((ticker) => {
          tAccum += ticker.deltaMS * pulseSpeed;

          // Ping-pong 0..1..0 using sine
          const phase = (Math.sin(tAccum * Math.PI * 2) + 1) / 2; // 0..1..0
          // Smoothstep to avoid harsh easing at edges
          const smooth = phase * phase * (3 - 2 * phase);

          // Animate blur strength, alpha, and a tiny scale puff
          blur.strength = minStrength + smooth * (maxStrength - minStrength);
          glow.alpha = minAlpha + smooth * (maxAlpha - minAlpha);

          const puff = 1 + smooth * 0.04; // subtle 4% puff
          glow.scale.set(puff, 1.1 * puff);
        });
      });

    return () => {
      app.destroy(true, { children: true });
    };
  }, []);

  return (
    <div ref={pixiRef} className="w-full h-full" />
  );
}
