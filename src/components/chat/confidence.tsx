"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function confidenceTone(value: number) {
  if (value >= 0.9)
    return { label: "High confidence", color: "#5ef0b4", glow: "rgb(94 240 180 / .55)" };
  if (value >= 0.7)
    return { label: "Fair confidence", color: "#46d8ff", glow: "rgb(70 216 255 / .5)" };
  if (value >= 0.45)
    return { label: "Low confidence", color: "#ffb547", glow: "rgb(255 181 71 / .5)" };
  return { label: "Can't know yet", color: "#ff4f7b", glow: "rgb(255 79 123 / .55)" };
}

/**
 * Epsilon's signature: how sure it is, and the band of doubt around that.
 * The bright fill is the estimate; the faint halo at its end is ±ε.
 */
export function Confidence({
  value,
  className,
  compact = false,
}: {
  value: number;
  className?: string;
  compact?: boolean;
}) {
  const tone = confidenceTone(value);
  const pct = Math.round(value * 100);
  const epsilon = Math.max(0.01, (1 - value) * 0.6);

  return (
    <div
      className={cn("inline-flex items-center gap-2.5", className)}
      role="img"
      aria-label={`${tone.label}: ${pct}%, margin of error ${epsilon.toFixed(2)}`}
    >
      <span className="relative h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.08]">
        <motion.span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: tone.color, boxShadow: `0 0 12px ${tone.glow}` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
        <motion.span
          className="absolute inset-y-0 rounded-full"
          style={{ background: tone.color, opacity: 0.28 }}
          initial={{ left: 0, width: 0 }}
          animate={{
            left: `${Math.max(0, (value - epsilon) * 100)}%`,
            width: `${Math.min(100, epsilon * 200)}%`,
          }}
          transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.15 }}
        />
      </span>
      <span className="font-mono text-[11.5px] tabular-nums text-ink-2">
        {pct}%{!compact && <span className="text-ink-4"> · ε {epsilon.toFixed(2)}</span>}
      </span>
    </div>
  );
}
