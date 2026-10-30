"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, useSpring } from "motion/react";
import { type PointerEvent, useRef } from "react";
import { useLiquidLens } from "@/components/glass/use-liquid-lens";
import { Button } from "@/components/ui/button";
import { HeroDemo } from "./hero-demo";

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring" as const, stiffness: 140, damping: 22, delay },
});

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const card = useLiquidLens<HTMLDivElement>({
    radius: 32,
    bezel: 28,
    strength: 24,
    blur: 16,
    saturate: 170,
    dispersion: true,
  });
  const drop = useLiquidLens<HTMLDivElement>({
    radius: 999,
    bezel: 52,
    strength: 38,
    blur: 0.4,
    saturate: 150,
    dispersion: true,
  });

  const rx = useSpring(0, { stiffness: 140, damping: 18 });
  const ry = useSpring(0, { stiffness: 140, damping: 18 });

  const onPointerMove = (e: PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !card.ref.current) return;
    const r = card.ref.current.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
    const ny = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
    ry.set(nx * 14);
    rx.set(-ny * 10);
  };

  const onPointerLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative mx-auto grid min-h-[100svh] max-w-6xl grid-cols-1 items-center gap-14 px-6 pt-32 pb-20 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:pt-28"
    >
      <div>
        <motion.p {...enter(0.05)} className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-display text-[15px] normal-case tracking-normal text-ink">ε</span>
          <span className="font-sans text-[12.5px] normal-case italic tracking-normal">
            ep·si·lon
          </span>
          <span className="hidden h-px w-6 bg-white/20 sm:block" />
          <span>the smallest amount that still matters</span>
        </motion.p>

        <motion.h1
          {...enter(0.12)}
          className="display mt-7 text-[clamp(3.3rem,8.4vw,6.9rem)] text-ink"
        >
          Answers with a margin of error
          <span
            aria-hidden
            className="spectrum ml-[0.04em] inline-block size-[0.17em] translate-y-[-0.02em] rounded-full shadow-[0_0_24px_rgb(255_106_61/.7)]"
          />
        </motion.h1>

        <motion.p
          {...enter(0.2)}
          className="mt-7 max-w-[30rem] text-[17.5px] leading-relaxed text-ink-2"
        >
          Epsilon reasons in the open, cites as it goes and tells you how sure it is — so you know
          exactly which parts to double-check.
        </motion.p>

        <motion.div {...enter(0.28)} className="mt-10 flex flex-wrap items-center gap-3">
          <Button href="/chat" variant="luminous" size="lg">
            Start a conversation <ArrowRight />
          </Button>
          <Button href="#how" size="lg">
            How it answers
          </Button>
        </motion.div>

        <motion.p {...enter(0.36)} className="mt-6 font-mono text-[11.5px] text-ink-4">
          Front-end preview · no account needed · runs entirely in your browser
        </motion.p>
      </div>

      <div className="relative [perspective:1400px]">
        <motion.div
          ref={card.ref}
          data-glass
          initial={{ opacity: 0, y: 40, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.25 }}
          style={{ rotateX: rx, rotateY: ry }}
          className="glass relative mx-auto h-[25.5rem] w-full max-w-[29rem] overflow-hidden rounded-[32px]"
        >
          {card.filter}
          <HeroDemo />
        </motion.div>

        <motion.div
          ref={drop.ref}
          data-glass
          aria-hidden
          drag
          dragConstraints={sectionRef}
          dragElastic={0.18}
          dragTransition={{ bounceStiffness: 260, bounceDamping: 18 }}
          whileDrag={{ scale: 1.08 }}
          whileHover={{ scale: 1.04 }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.7 }}
          className="glass glass-clear absolute -top-12 -left-6 hidden size-36 cursor-grab touch-none rounded-full active:cursor-grabbing md:block lg:-left-14"
        >
          {drop.filter}
          <span className="pointer-events-none absolute top-[14%] left-[22%] h-[18%] w-[34%] -rotate-[28deg] rounded-full bg-white/50 blur-[6px]" />
        </motion.div>
      </div>
    </section>
  );
}
