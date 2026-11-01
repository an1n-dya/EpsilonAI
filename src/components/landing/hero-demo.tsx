"use client";

import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { Confidence, confidenceTone } from "@/components/chat/confidence";

type Exchange = {
  q: string;
  a: string;
  confidence: number;
  sources: string[];
  model: string;
};

const EXCHANGES: Exchange[] = [
  {
    q: "Is it true we only use 10% of our brains?",
    a: "No. Imaging shows activity across virtually every region over a normal day, including during sleep — and damage to almost any area causes some deficit, which couldn't happen if most of it sat idle.",
    confidence: 0.97,
    sources: ["Wikipedia", "Sci. American"],
    model: "E2 · Balanced",
  },
  {
    q: "Will it rain on my birthday next year?",
    a: "Nobody can tell you yet. Forecasts lose most of their skill beyond about ten days, so the honest answer for a date a year out is your city's historical odds for that week — not a prediction.",
    confidence: 0.22,
    sources: ["ECMWF"],
    model: "E3 · Deep",
  },
  {
    q: "Python or Rust as a first language?",
    a: "Python, for most people. You'll build working things sooner, and the concepts carry over. Rust is a great second language — its ownership rules make more sense once you've felt the bugs they prevent.",
    confidence: 0.78,
    sources: ["Rust Book", "python.org"],
    model: "E2 · Balanced",
  },
];

type Phase = "asking" | "thinking" | "answering" | "done";

export function HeroDemo() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("asking");
  const [shown, setShown] = useState(0);
  const ex = EXCHANGES[index] as Exchange;
  const words = ex.a.split(" ");
  const ref = useRef<HTMLDivElement>(null);
  // Typing re-renders every 55ms, so hold the loop while it's scrolled out of
  // view. It carries on from the same place when it's back.
  const visible = useInView(ref);

  useEffect(() => {
    if (!visible) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer: number;
    if (phase === "asking") {
      setShown(0);
      timer = window.setTimeout(() => setPhase("thinking"), reduce ? 0 : 900);
    } else if (phase === "thinking") {
      timer = window.setTimeout(() => setPhase("answering"), reduce ? 0 : 1300);
    } else if (phase === "answering") {
      if (reduce) {
        setShown(words.length);
        setPhase("done");
        return;
      }
      timer = window.setInterval(() => setShown((n) => n + 1), 55);
    } else {
      timer = window.setTimeout(() => {
        setIndex((i) => (i + 1) % EXCHANGES.length);
        setPhase("asking");
      }, 5200);
    }
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(timer);
    };
  }, [phase, words.length, visible]);

  useEffect(() => {
    if (phase === "answering" && shown >= words.length) setPhase("done");
  }, [phase, shown, words.length]);

  const tone = confidenceTone(ex.confidence);

  return (
    <div ref={ref} className="flex h-full flex-col">
      <div className="flex items-center justify-between border-hairline border-b px-5 py-3.5">
        <span className="eyebrow !text-[10.5px]">Live preview</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={ex.model}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="font-mono text-[11px] text-ink-3"
          >
            {ex.model}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="relative flex-1 space-y-5 overflow-hidden px-5 pt-5 pb-4" aria-live="off">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`q${index}`}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="ml-auto w-fit max-w-[85%] rounded-[20px] rounded-br-md bg-white/[0.1] px-4 py-2.5 text-[14.5px] text-ink shadow-[inset_0_1px_0_rgb(255_255_255/.12)]"
          >
            {ex.q}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3">
          <LogoMark size={26} className="mt-0.5" />
          <div className="min-h-[7.5rem] flex-1 text-[14.5px] leading-relaxed text-ink-2">
            {phase === "thinking" && (
              <span className="text-shimmer text-[13.5px]">Checking what's known…</span>
            )}
            {(phase === "answering" || phase === "done") && (
              <p>
                {words.slice(0, shown).join(" ")}
                {phase === "answering" && (
                  <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-caret bg-ink" />
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-[60px] items-center justify-between gap-3 border-hairline border-t px-5 py-3">
        <AnimatePresence mode="wait">
          {phase === "done" && (
            <motion.div
              key={`f${index}`}
              className="flex w-full flex-wrap items-center justify-between gap-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <div className="flex items-center gap-2.5">
                <Confidence value={ex.confidence} />
                <span className="hidden text-[11.5px] sm:inline" style={{ color: tone.color }}>
                  {tone.label}
                </span>
              </div>
              <div className="flex gap-1.5">
                {ex.sources.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-white/[0.07] px-2.5 py-1 font-mono text-[10.5px] text-ink-2"
                  >
                    {s}
                    <ArrowUpRight className="size-3 opacity-60" aria-hidden />
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
