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

    const set = (el: HTMLElement, name: string, value: string) => {
      if (el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
    };

    const update = () => {
      raf = 0;
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-glass]"));
      const vh = window.innerHeight;
      // Measure everything before writing anything: interleaving the two
      // forces a fresh style and layout pass for every surface.
      const rects = els.map((el) => el.getBoundingClientRect());
      els.forEach((el, i) => {
        const r = rects[i];
        if (!r || r.bottom < -50 || r.top > vh + 50 || r.width === 0) return;
        const dx = x - (r.left + r.width / 2);
        const dy = y - (r.top + r.height / 2);
        // CSS gradients start opposite their angle, so point away from the
        // light to put the bright end of the rim on the side facing it.
        const angle = (Math.atan2(dx, -dy) * 180) / Math.PI + 180;
        set(el, "--rim", `${angle.toFixed(1)}deg`);
        set(el, "--mx", `${(x - r.left).toFixed(0)}px`);
        set(el, "--my", `${(y - r.top).toFixed(0)}px`);
      });
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
