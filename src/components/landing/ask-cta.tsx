"use client";

import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useId, useState } from "react";
import { useLiquidLens } from "@/components/glass/use-liquid-lens";
import { DRAFT_KEY } from "@/lib/chat/store";
import { Reveal } from "./reveal";

const PROMPTS = [
  "Is it true we only use 10% of our brains?",
  "Write a debounce function in TypeScript",
  "SQLite or Postgres for a side project?",
  "Explain epsilon–delta limits to a programmer",
];

export function AskCta() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [hint, setHint] = useState(0);
  const inputId = useId();
  const lens = useLiquidLens<HTMLFormElement>({ radius: 999, bezel: 22, strength: 20, blur: 14 });

  useEffect(() => {
    if (value) return;
    const t = window.setInterval(() => setHint((i) => (i + 1) % PROMPTS.length), 3200);
    return () => window.clearInterval(t);
  }, [value]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = value.trim() || PROMPTS[hint] || "";
    // Hand the question over in session storage rather than the URL, so it
    // never lands in history, logs or referrers.
    try {
      sessionStorage.setItem(DRAFT_KEY, q);
    } catch {
      // Storage can be unavailable (private mode); the chat just opens empty.
    }
    router.push("/chat");
  };

  return (
    <section className="relative mx-auto mt-40 max-w-4xl px-6 text-center">
      <Reveal>
        <h2 className="display text-[clamp(2.8rem,7vw,5.6rem)]">Ask the first question.</h2>
        <p className="mx-auto mt-5 max-w-md text-[16.5px] text-ink-2">
          No account, no setup. Everything runs in this tab.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mx-auto mt-12 max-w-2xl">
        <form
          ref={lens.ref}
          onSubmit={submit}
          data-glass
          className="glass flex h-16 items-center gap-2 rounded-full pr-2 pl-6 text-left sm:h-[4.5rem] sm:pl-7"
        >
          {lens.filter}
          <label htmlFor={inputId} className="sr-only">
            Your question
          </label>
          <div className="relative min-w-0 flex-1">
            <input
              id={inputId}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={4000}
              autoComplete="off"
              className="peer h-12 w-full bg-transparent text-[16px] text-ink outline-none sm:text-[17px]"
            />
            <AnimatePresence mode="wait">
              {!value && (
                <motion.span
                  key={hint}
                  aria-hidden
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.35 }}
                  className="pointer-events-none absolute inset-0 truncate text-[16px] leading-[48px] text-ink-4 sm:text-[17px]"
                >
                  {PROMPTS[hint]}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <button
            type="submit"
            aria-label="Ask Epsilon"
            className="btn-luminous grid size-12 shrink-0 place-items-center rounded-full sm:size-14"
          >
            <ArrowUp className="size-5" strokeWidth={2.4} />
          </button>
        </form>
      </Reveal>
    </section>
  );
}
