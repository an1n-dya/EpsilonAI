"use client";

import { ArrowUp, Square } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
  useEffect,
  useId,
  useLayoutEffect,
  useState,
} from "react";
import { useLiquidLens } from "@/components/glass/use-liquid-lens";
import { cn } from "@/lib/utils";

const MAX = 8000;

export function Composer({
  onSend,
  onStop,
  busy,
  inputRef,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  busy: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const [value, setValue] = useState("");
  const id = useId();
  const lens = useLiquidLens<HTMLFormElement>({ radius: 28, bezel: 18, strength: 16, blur: 18 });
  const canSend = value.trim().length > 0 && !busy;

  // Grow with the text, up to a limit, then scroll.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure when the text changes
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [value, inputRef]);

  // "/" anywhere focuses the composer.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inputRef]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (busy) {
      onStop();
      return;
    }
    if (!canSend) return;
    onSend(value);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-5">
      <div className="pointer-events-auto mx-auto max-w-[760px]">
        <form
          ref={lens.ref}
          onSubmit={submit}
          data-glass
          className="glass flex items-end gap-2 rounded-[28px] py-2 pr-2 pl-5 [--g-fill-bottom:rgb(14_15_22/.45)] [--g-fill-top:rgb(30_32_44/.4)]"
        >
          {lens.filter}
          <label htmlFor={id} className="sr-only">
            Message Epsilon
          </label>
          <textarea
            id={id}
            ref={inputRef}
            rows={1}
            value={value}
            maxLength={MAX}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything…"
            enterKeyHint="send"
            className="max-h-[220px] min-h-11 flex-1 resize-none bg-transparent py-[11px] text-[16px] leading-[22px] text-ink outline-none placeholder:text-ink-4 sm:text-[15.5px]"
          />
          <button
            type="submit"
            disabled={!busy && !canSend}
            aria-label={busy ? "Stop generating" : "Send message"}
            className={cn(
              "relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full transition-[transform,opacity] duration-300",
              busy ? "glass glass-thin glass-press" : "btn-luminous",
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={busy ? "stop" : "send"}
                initial={{ scale: 0.4, opacity: 0, rotate: busy ? -90 : 90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className="grid place-items-center"
              >
                {busy ? (
                  <Square className="size-3.5 fill-current" />
                ) : (
                  <ArrowUp className="size-5" strokeWidth={2.4} />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </form>
        <p className="mt-2 hidden text-center text-[11.5px] text-ink-4 sm:block">
          Epsilon can be wrong — that's why it shows its work. <span className="kbd ml-1">/</span>{" "}
          to focus
        </p>
      </div>
    </div>
  );
}
