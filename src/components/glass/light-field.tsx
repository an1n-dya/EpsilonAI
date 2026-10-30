"use client";

import { useEffect } from "react";

/**
 * Treats the pointer as a light source. Every element marked `data-glass`
 * gets `--rim` (the angle its specular edge should face) and `--mx`/`--my`
 * (the pointer in its local space, for the sheen). One listener, one rAF.
 */
export function LightField() {
  useEffect(() => {
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let x = window.innerWidth * 0.3;
    let y = -200;
    let raf = 0;

    const update = () => {
      raf = 0;
      const els = document.querySelectorAll<HTMLElement>("[data-glass]");
      const vh = window.innerHeight;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -50 || r.top > vh + 50 || r.width === 0) continue;
        const dx = x - (r.left + r.width / 2);
        const dy = y - (r.top + r.height / 2);
        // CSS gradients start opposite their angle, so point away from the
        // light to put the bright end of the rim on the side facing it.
        const angle = (Math.atan2(dx, -dy) * 180) / Math.PI + 180;
        el.style.setProperty("--rim", `${angle.toFixed(1)}deg`);
        el.style.setProperty("--mx", `${(x - r.left).toFixed(0)}px`);
        el.style.setProperty("--my", `${(y - r.top).toFixed(0)}px`);
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true, capture: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", schedule, { capture: true });
    };
  }, []);

  return null;
}
