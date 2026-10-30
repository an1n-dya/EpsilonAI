"use client";

import { motion } from "motion/react";
import { useLiquidLens } from "@/components/glass/use-liquid-lens";

/** A big drop of clear glass with the ε suspended in it. */
export function EpsilonLens() {
  const lens = useLiquidLens<HTMLDivElement>({
    radius: 999,
    bezel: 70,
    strength: 46,
    blur: 1,
    saturate: 150,
    dispersion: true,
  });

  return (
    <motion.div
      ref={lens.ref}
      data-glass
      aria-hidden
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 0.6 },
        scale: { type: "spring", stiffness: 120, damping: 14 },
        y: { duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
      }}
      className="glass glass-clear relative grid size-64 place-items-center rounded-full sm:size-72"
    >
      {lens.filter}
      <span className="display spectrum-text translate-y-[-4%] text-[11rem] leading-none sm:text-[12.5rem]">
        ε
      </span>
      <span className="pointer-events-none absolute top-[12%] left-[20%] h-[16%] w-[34%] -rotate-[28deg] rounded-full bg-white/40 blur-[10px]" />
    </motion.div>
  );
}
