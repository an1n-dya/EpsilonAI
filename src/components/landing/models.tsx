"use client";

import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { getModel, MODELS, type ModelId } from "@/lib/models";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

const METERS = [
  { key: "speed", label: "Speed" },
  { key: "depth", label: "Depth" },
  { key: "sourcing", label: "Sourcing" },
] as const;

export function Models() {
  const [id, setId] = useState<ModelId>("e2");
  const model = getModel(id);

  return (
    <section className="relative mx-auto mt-36 max-w-6xl px-6">
      <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1fr_auto]">
        <Reveal className="max-w-xl">
          <p className="eyebrow">Models</p>
          <h2 className="title mt-4 text-[clamp(2.4rem,5vw,3.9rem)]">Pick your precision.</h2>
          <p className="mt-5 text-[16.5px] leading-relaxed text-ink-2">
            Three models, one temperament. Faster ones skim; deeper ones dig and show more of the
            dig. Switch any time, mid-conversation.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <Segmented
            label="Model"
            value={id}
            onChange={setId}
            options={MODELS.map((m) => ({ value: m.id, label: `${m.name} · ${m.nick}` }))}
          />
        </Reveal>
      </div>

      <Reveal
        delay={0.12}
        data-glass
        className="glass glass-thick mt-10 overflow-hidden rounded-[32px]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="grid grid-cols-1 gap-10 p-6 sm:p-10 md:grid-cols-[1.2fr_1fr]"
          >
            <div>
              <div className="flex items-baseline gap-4">
                <span className="display text-[clamp(4rem,10vw,7.5rem)] leading-none spectrum-text">
                  {model.name}
                </span>
                <span className="title text-[24px] text-ink-2">{model.nick}</span>
              </div>
              <p className="mt-6 max-w-md text-[16.5px] leading-relaxed text-ink-2">
                {model.blurb}
              </p>
              <Button href="/chat" size="md" className="mt-8">
                Try {model.name} <ArrowRight />
              </Button>
            </div>

            <div className="flex flex-col justify-between gap-8">
              <dl className="space-y-4">
                {METERS.map((m) => (
                  <div key={m.key} className="flex items-center justify-between gap-6">
                    <dt className="eyebrow">{m.label}</dt>
                    <dd className="flex gap-1.5">
                      <span className="sr-only">{model[m.key]} out of 5</span>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <motion.span
                          key={n}
                          initial={false}
                          animate={{
                            opacity: n <= model[m.key] ? 1 : 0.18,
                            scaleY: n <= model[m.key] ? 1 : 0.6,
                          }}
                          transition={{
                            delay: n * 0.03,
                            type: "spring",
                            stiffness: 400,
                            damping: 22,
                          }}
                          className={cn(
                            "h-5 w-7 rounded-md",
                            n <= model[m.key] ? "spectrum" : "bg-white",
                          )}
                        />
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
              <div>
                <p className="eyebrow">Best for</p>
                <ul className="mt-3 space-y-2 text-[15px] text-ink">
                  {model.bestFor.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="size-1.5 rounded-full bg-ink-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </Reveal>
    </section>
  );
}
