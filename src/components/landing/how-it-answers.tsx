"use client";

import { Check } from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useId, useRef, useState } from "react";
import { Confidence, confidenceTone } from "@/components/chat/confidence";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function HowItAnswers() {
  return (
    <section id="how" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 pt-16">
      <Reveal className="max-w-2xl">
        <p className="eyebrow">How it answers</p>
        <h2 className="title mt-4 text-[clamp(2.4rem,5vw,3.9rem)]">Built to be checked.</h2>
        <p className="mt-5 max-w-lg text-[16.5px] leading-relaxed text-ink-2">
          Most assistants sound equally certain about everything. Epsilon has three habits that make
          its answers easy to trust — or easy to challenge.
        </p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          index="01"
          title="Reasoning in the open"
          description="Every answer keeps its working. Expand it to see what was checked, and in what order."
          demo={<ReasoningTrace />}
          delay={0}
        />
        <Card
          index="02"
          title="Sources, inline"
          description="Claims carry their citations right where they're made, not in a pile at the end. Tap or hover one."
          demo={<InlineSources />}
          delay={0.08}
        />
        <Card
          index="03"
          title="Confidence it means"
          description="A number, a margin and wording to match. Drag the slider to watch the same answer change as certainty drops."
          demo={<CalibrationDemo />}
          delay={0.12}
          wide
        />
      </div>
    </section>
  );
}

function Card({
  index,
  title,
  description,
  demo,
  delay,
  wide = false,
}: {
  index: string;
  title: string;
  description: string;
  demo: React.ReactNode;
  delay: number;
  wide?: boolean;
}) {
  return (
    <Reveal
      delay={delay}
      data-glass
      className={cn(
        "glass glass-thick flex min-w-0 flex-col rounded-[30px] p-6 text-[15px] leading-relaxed sm:p-8",
        wide &&
          "lg:col-span-2 lg:grid lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-center lg:gap-14",
      )}
    >
      <div>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] text-ink-4">{index}</span>
          <h3 className="title text-[23px]">{title}</h3>
        </div>
        <p className="mt-3 max-w-md text-ink-2">{description}</p>
      </div>
      <div className={cn("mt-7 flex-1", wide && "lg:mt-0")}>{demo}</div>
    </Reveal>
  );
}

/* 01 ---------------------------------------------------------------------- */

const STEPS = [
  { text: "Restate the claim: “only 10% of the brain is used”", ms: "0.2s" },
  { text: "Check imaging studies — fMRI and PET activity maps", ms: "1.1s" },
  { text: "Check lesion evidence — does damage anywhere matter?", ms: "0.9s" },
  { text: "Look for where the myth came from", ms: "0.6s" },
];

function ReasoningTrace() {
  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <ol ref={ref} className="space-y-1 rounded-2xl bg-black/25 p-2 font-mono text-[12.5px]">
      {STEPS.map((step, i) => (
        <motion.li
          key={step.text}
          initial={{ opacity: 0, x: -10 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.25 + i * 0.45, type: "spring", stiffness: 260, damping: 24 }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-ink-2"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ delay: 0.55 + i * 0.45, type: "spring", stiffness: 500, damping: 20 }}
            className="grid size-[18px] shrink-0 place-items-center rounded-full bg-mint/15 text-mint"
          >
            <Check className="size-3" strokeWidth={3} />
          </motion.span>
          <span className="min-w-0 flex-1 truncate">{step.text}</span>
          <span className="text-ink-4">{step.ms}</span>
        </motion.li>
      ))}
    </ol>
  );
}

/* 02 ---------------------------------------------------------------------- */

const CITES = [
  {
    n: 1,
    title: "Ten percent of the brain myth",
    host: "en.wikipedia.org",
    note: "Overview of the myth's origins and the evidence against it.",
  },
  {
    n: 2,
    title: "Do people only use 10 percent of their brains?",
    host: "scientificamerican.com",
    note: "A neurologist on why no part of the brain is spare.",
  },
];

function InlineSources() {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();

  return (
    <div className="relative rounded-2xl bg-black/25 p-5 text-[14.5px] leading-[1.85] text-ink-2">
      <p>
        Imaging shows activity across virtually every region over a day
        <Cite n={1} open={open} setOpen={setOpen} id={id} />, and damage to almost any area causes
        some deficit
        <Cite n={2} open={open} setOpen={setOpen} id={id} /> — which couldn't happen if 90% sat
        idle.
      </p>
      <AnimatePresence>
        {open !== null && (
          <motion.div
            key={open}
            id={`${id}-${open}`}
            role="tooltip"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            data-glass
            className="glass glass-thick absolute inset-x-4 -bottom-3 translate-y-full rounded-2xl p-4 text-[13px] leading-snug sm:inset-x-auto sm:right-4 sm:w-72"
          >
            <p className="font-mono text-[10.5px] text-tide">{CITES[open - 1]?.host}</p>
            <p className="mt-1.5 font-medium text-ink">{CITES[open - 1]?.title}</p>
            <p className="mt-1 text-ink-3">{CITES[open - 1]?.note}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Cite({
  n,
  open,
  setOpen,
  id,
}: {
  n: number;
  open: number | null;
  setOpen: (n: number | null) => void;
  id: string;
}) {
  return (
    <button
      type="button"
      aria-describedby={open === n ? `${id}-${n}` : undefined}
      aria-label={`Source ${n}`}
      onPointerEnter={() => setOpen(n)}
      onPointerLeave={() => setOpen(null)}
      onFocus={() => setOpen(n)}
      onBlur={() => setOpen(null)}
      onClick={() => setOpen(open === n ? null : n)}
      className={cn(
        "mx-1 inline-grid h-[18px] min-w-[18px] -translate-y-px place-items-center rounded-md px-1 align-middle font-mono text-[10.5px] transition-colors",
        open === n ? "bg-tide/25 text-ink" : "bg-white/10 text-ink-2 hover:bg-white/15",
      )}
    >
      {n}
    </button>
  );
}

/* 03 ---------------------------------------------------------------------- */

const PHRASINGS = [
  {
    min: 0.9,
    text: "Yes. The load path checks out against your spec with a wide margin on every member.",
  },
  {
    min: 0.7,
    text: "Probably. The numbers work, but they assume the steel grade on your spec sheet — worth confirming with the supplier.",
  },
  {
    min: 0.45,
    text: "Unclear. It hinges on the joint welds, which I can't see from this. Have an engineer inspect them before relying on it.",
  },
  {
    min: 0,
    text: "I can't tell from what's here, and a guess would be worse than nothing. I'd need the weld specs and a site survey.",
  },
];

function CalibrationDemo() {
  const [value, setValue] = useState(0.86);
  const phrasing = PHRASINGS.find((p) => value >= p.min) ?? PHRASINGS[3];
  const tone = confidenceTone(value);
  const inputId = useId();

  return (
    <div className="rounded-2xl bg-black/25 p-5 sm:p-6">
      <div className="ml-auto w-fit max-w-[85%] rounded-[18px] rounded-br-md bg-white/[0.09] px-4 py-2 text-[14px] text-ink">
        Will this footbridge design hold 40 tonnes?
      </div>
      <div className="mt-4 min-h-[5.5rem]">
        <AnimatePresence mode="wait">
          <motion.p
            key={phrasing?.min}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="text-[15px] leading-relaxed text-ink"
          >
            {phrasing?.text}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-hairline border-t pt-5">
        <Confidence value={value} />
        <span className="text-[12px]" style={{ color: tone.color }}>
          {tone.label}
        </span>
      </div>
      <label htmlFor={inputId} className="sr-only">
        Confidence
      </label>
      <input
        id={inputId}
        type="range"
        min={0.05}
        max={0.99}
        step={0.01}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="glass-range mt-5 w-full"
        style={
          {
            "--fill": `${((value - 0.05) / 0.94) * 100}%`,
            "--tone": tone.color,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
