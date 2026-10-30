"use client";

import { LiquidGlass, type LiquidGlassHandle } from "liquid-glass-web-react";
import { animate, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A row of items with a lens of liquid glass that springs to whichever one is
 * active, bending the labels underneath it the way a real lens would.
 *
 * Refraction comes from `liquid-glass-web-react`, which filters the row's own
 * pixels, so unlike backdrop-based glass it works in every browser.
 * Mark items with `data-lens-key` and pass the key to `active`.
 */

const RIM = [
  "inset 0 1px 1px rgb(255 255 255 / .55)",
  "inset 0 -1px 1.5px rgb(255 255 255 / .16)",
  "inset 0 0 0 .5px rgb(255 255 255 / .2)",
  "0 6px 18px -6px rgb(0 0 0 / .55)",
].join(", ");

type Box = { x: number; y: number; w: number; h: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function LensRow({
  active,
  children,
  className,
  inset = 0,
  strength = 0.07,
}: {
  active: string | null;
  children: ReactNode;
  className?: string;
  /** Shrink the lens inside the active item by this many px on each side. */
  inset?: number;
  strength?: number;
}) {
  const glass = useRef<LiquidGlassHandle>(null);
  const box = useRef<Box | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const root = glass.current?.element;
    const engine = glass.current?.engine;
    if (!root || !engine) return;
    let stop: (() => void) | undefined;

    const apply = (b: Box) => {
      box.current = b;
      engine.setOptions({
        width: Math.max(8, Math.round(b.w)),
        height: Math.max(8, Math.round(b.h)),
      });
      engine.setPosition(b.x, b.y);
    };

    const place = (instant: boolean) => {
      const target = active
        ? root.querySelector<HTMLElement>(`[data-lens-key="${CSS.escape(active)}"]`)
        : null;
      if (!target) {
        root.dataset.idle = "";
        return;
      }
      delete root.dataset.idle;
      const r = root.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const to: Box = {
        x: (t.left + t.width / 2 - r.left) / r.width,
        y: (t.top + t.height / 2 - r.top) / r.height,
        w: t.width - inset * 2,
        h: t.height - inset * 2,
      };
      stop?.();
      const from = box.current;
      if (instant || reduce || !from) {
        apply(to);
        return;
      }
      const controls = animate(0, 1, {
        type: "spring",
        stiffness: 380,
        damping: 30,
        mass: 0.8,
        onUpdate: (p) =>
          apply({
            x: lerp(from.x, to.x, p),
            y: lerp(from.y, to.y, p),
            // Stretch a little mid-flight, like a drop being pulled.
            w: lerp(from.w, to.w, p) * (1 + 0.18 * Math.sin(Math.min(p, 1) * Math.PI)),
            h: lerp(from.h, to.h, p) * (1 - 0.06 * Math.sin(Math.min(p, 1) * Math.PI)),
          }),
      });
      stop = () => controls.stop();
    };

    place(false);
    let first = true;
    const ro = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      place(true);
    });
    ro.observe(root);
    return () => {
      stop?.();
      ro.disconnect();
    };
  }, [active, inset, reduce]);

  return (
    <LiquidGlass
      ref={glass}
      className={cn("lens-row", className)}
      x={-1}
      radius="auto"
      strength={strength}
      depth={7}
      curvature={0.75}
      chromaticAberration={0.35}
      glow={0.16}
      edgeHighlight={0.42}
      quality={128}
      shadow={RIM}
    >
      {children}
    </LiquidGlass>
  );
}
