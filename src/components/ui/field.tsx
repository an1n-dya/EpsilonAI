"use client";

import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps, type ReactNode, useId, useState } from "react";
import { cn } from "@/lib/utils";

type FieldProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  icon?: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  aside?: ReactNode;
};

export function Field({ label, icon, hint, error, aside, className, type, ...input }: FieldProps) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-medium text-ink-2">
          {label}
        </label>
        {aside}
      </div>
      <div
        data-glass
        className={cn(
          "glass glass-thin group flex h-12 items-center gap-3 rounded-2xl px-4 transition-shadow duration-300",
          "focus-within:shadow-[0_0_0_1px_rgb(70_216_255/.5),0_0_0_5px_rgb(70_216_255/.12)]",
          error && "shadow-[0_0_0_1px_rgb(255_79_123/.55)]",
        )}
      >
        {icon && (
          <span className="text-ink-3 transition-colors group-focus-within:text-ink-2 [&_svg]:size-4">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={isPassword && reveal ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-4"
          {...input}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Hide password" : "Show password"}
            aria-pressed={reveal}
            className="-mr-1.5 grid size-8 place-items-center rounded-full text-ink-3 transition-colors hover:bg-white/[0.06] hover:text-ink"
          >
            {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-[12.5px] text-[#ff8fa8]">
          {error}
        </p>
      ) : hint ? (
        <div id={`${id}-hint`} className="mt-2 text-[12.5px] text-ink-3">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
