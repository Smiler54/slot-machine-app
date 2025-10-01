"use client";

import { useEffect, useRef } from "react";
import { Application, Assets, Container, Sprite } from "pixi.js";
import { Emitter } from "@pixi/particle-emitter";
import logoImage from "@/assets/logo.png";

export default function BurningLogo() {
  const pixiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pixiRef.current) return;

    const app = new Application();
    app
      .init({
        width: 400,
        height: 400,
        backgroundAlpha: 0,
      })
      .then(async () => {
        pixiRef.current?.appendChild(app.canvas);

        // Load logo
        const logoTexture = await Assets.load(logoImage.src);
        const logo = new Sprite(logoTexture);
        logo.anchor.set(0.5);
        logo.x = app.screen.width / 2;
        logo.y = app.screen.height / 2;
        logo.width = 250;
        logo.height = 250;
        app.stage.addChild(logo);

        // 🔥 Fire ring emitter
        const fireContainer = new Container();
        app.stage.addChild(fireContainer);
        const emitter = new Emitter(fireContainer, {
          lifetime: { min: 0.2, max: 0.6 },
          frequency: 0.01,
          maxParticles: 400,
          pos: { x: logo.x, y: logo.y },
          behaviors: [
            {
              type: "alpha",
              config: {
                alpha: {
                  list: [
                    { value: 1, time: 0 },
                    { value: 0, time: 1 },
                  ],
                },
              },
            },
            {
              type: "scale",
              config: {
                scale: {
                  list: [
                    { value: 0.5, time: 0 },
                    { value: 0, time: 1 },
                  ],
                },
              },
            },
            {
              type: "color",
              config: {
                color: {
                  list: [{ value: "ff9933" }, { value: "ff3300" }],
                },
              },
            },
            {
              type: "moveSpeed",
              config: {
                speed: {
                  list: [
                    { value: 60, time: 0 },
                    { value: 0, time: 1 },
                  ],
                },
              },
            },
            { type: "rotationStatic", config: { min: 0, max: 360 } },
            {
              type: "spawnShape",
              config: {
                type: "torus",
                data: { x: 0, y: 0, radius: 140, innerRadius: 120 },
              },
            },
          ],
        });

        // Update emitter each frame
        let elapsed = 0;
        app.ticker.add(() => {
          elapsed += 0.016;
          emitter.update(0.016);
        });
      });

    return () => {
      app.destroy(true, { children: true });
    };
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div ref={pixiRef} />
    </div>
  );
}
