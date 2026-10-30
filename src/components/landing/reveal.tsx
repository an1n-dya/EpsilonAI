"use client";

import { type HTMLMotionProps, motion } from "motion/react";

/**
 * Rises into view once. Animates the element itself (never an ancestor of
 * glass) because opacity or filter on an ancestor would cut glass off from
 * the backdrop it refracts.
 */
const rise = (delay: number) =>
  ({
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { type: "spring", stiffness: 110, damping: 20, delay },
  }) as const;

export function Reveal({ delay = 0, ...props }: HTMLMotionProps<"div"> & { delay?: number }) {
  return <motion.div {...rise(delay)} {...props} />;
}

export function RevealItem({ delay = 0, ...props }: HTMLMotionProps<"li"> & { delay?: number }) {
  return <motion.li {...rise(delay)} {...props} />;
}
