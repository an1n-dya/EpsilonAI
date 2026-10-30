"use client";

import { type ReactNode, useId } from "react";
import { LensRow } from "@/components/glass/lens-row";
import { cn } from "@/lib/utils";

export type SegmentOption<T extends string> = { value: T; label: ReactNode; hint?: string };

/**
 * A radio group whose selection is a lens of liquid glass sliding between
 * options. Built on native radios, so arrow keys and forms work for free.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const name = useId();

  return (
    <div data-glass className={cn("glass glass-thin inline-flex rounded-full", className)}>
      <LensRow active={value} strength={0.05}>
        <fieldset className="flex items-center p-1">
          <legend className="sr-only">{label}</legend>
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <label
                key={option.value}
                data-lens-key={option.value}
                title={option.hint}
                className={cn(
                  "cursor-pointer rounded-full font-medium transition-colors duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--focus)] has-[:focus-visible]:outline-offset-2",
                  size === "sm" ? "px-3.5 text-[12.5px] leading-7" : "px-5 text-[13.5px] leading-9",
                  selected ? "text-ink" : "text-ink-3 hover:text-ink-2",
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={selected}
                  onChange={() => onChange(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            );
          })}
        </fieldset>
      </LensRow>
    </div>
  );
}
