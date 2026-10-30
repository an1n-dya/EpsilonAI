"use client";

import { LiquidGlass } from "liquid-glass-web-react";

/**
 * A lens you can drag across the 404. `liquid-glass-web-react` refracts the
 * live text under it, so this works in every browser, not just Chromium.
 */
export function LostLens() {
  return (
    <LiquidGlass
      draggable
      x={0.68}
      y={0.52}
      width={170}
      height={170}
      radius="auto"
      strength={0.11}
      depth={34}
      curvature={0.9}
      chromaticAberration={0.6}
      glow={0.18}
      edgeHighlight={0.5}
      quality={256}
      className="mx-auto w-fit touch-none select-none rounded-[40px]"
      aria-label="Drag the lens across the number"
    >
      <p
        aria-hidden
        className="display spectrum-text px-6 py-4 text-[clamp(8rem,30vw,17rem)] leading-[0.95]"
      >
        404
      </p>
    </LiquidGlass>
  );
}
