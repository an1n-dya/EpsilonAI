import { useId } from "react";
import { cn } from "@/lib/utils";

/** The mark: an ε held inside a drop of lit glass. */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${id}core`} cx="72%" cy="80%" r="95%">
          <stop offset="0" stopColor="#ffc46b" />
          <stop offset="0.32" stopColor="#ff6a3d" />
          <stop offset="0.62" stopColor="#ff4f7b" />
          <stop offset="1" stopColor="#6a5cff" />
        </radialGradient>
        <linearGradient id={`${id}rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`${id}gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="11" fill={`url(#${id}core)`} />
      <path
        d="M6 5.5c2.4-2 6-2.9 10-2.9s7.6.9 10 2.9c-2.5 3.2-6 4.6-10 4.6S8.5 8.7 6 5.5z"
        fill={`url(#${id}gloss)`}
      />
      <path
        d="M20.6 11.6a6.1 6.1 0 0 0-4.3-1.6c-2.9 0-4.9 1.5-4.9 3.6 0 1.8 1.6 2.9 3.9 2.9h1.6m-1.6 0c-2.6 0-4.4 1.4-4.4 3.4 0 2.2 2.2 3.6 5.2 3.6 1.9 0 3.5-.6 4.8-1.8"
        fill="none"
        stroke="#fff"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="10.5"
        fill="none"
        stroke={`url(#${id}rim)`}
        strokeWidth="1"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="title text-[19px] tracking-[-0.035em]">epsilon</span>
    </span>
  );
}
