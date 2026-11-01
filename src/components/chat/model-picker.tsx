"use client";

import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useEffect, useId, useRef, useState } from "react";
import { MODELS, type ModelId } from "@/lib/models";
import { cn } from "@/lib/utils";

export const ModelPicker = memo(function ModelPicker({
  value,
  onChange,
}: {
  value: ModelId;
  onChange: (id: ModelId) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const current = MODELS.find((m) => m.id === value) ?? MODELS[1];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    // Focus the selected option when the menu opens.
    const index = MODELS.findIndex((m) => m.id === value);
    requestAnimationFrame(() => itemRefs.current[index]?.focus());
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, value]);

  const onMenuKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        data-glass
        className="glass glass-thin glass-press inline-flex h-10 items-center gap-2 rounded-full pr-3 pl-4 text-[13.5px] font-medium"
      >
        <span className="text-ink">{current?.name}</span>
        <span className="hidden text-ink-3 sm:inline">{current?.nick}</span>
        <ChevronDown
          className={cn(
            "size-4 text-ink-3 transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label="Choose a model"
            onKeyDown={onMenuKey}
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ type: "spring", stiffness: 480, damping: 32 }}
            style={{ transformOrigin: "top right" }}
            data-glass
            className="glass glass-thick absolute top-12 right-0 z-40 w-[min(19rem,calc(100vw-1.5rem))] rounded-[24px] p-1.5"
          >
            {MODELS.map((m, i) => {
              const selected = m.id === value;
              return (
                <button
                  key={m.id}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => {
                    onChange(m.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-[18px] px-3.5 py-3 text-left transition-colors focus-visible:outline-offset-[-2px]",
                    selected ? "bg-white/[0.08]" : "hover:bg-white/[0.05]",
                  )}
                >
                  <span className="title mt-0.5 w-7 text-[17px]">{m.name}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium text-ink">{m.nick}</span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-3">
                      {m.blurb}
                    </span>
                  </span>
                  <Check
                    className={cn("mt-1 size-4 shrink-0 text-tide", !selected && "invisible")}
                  />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
