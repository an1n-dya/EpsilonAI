"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/logo";
import { useLiquidLens } from "@/components/glass/use-liquid-lens";
import { GitHubIcon, GoogleIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const lens = useLiquidLens<HTMLDivElement>({
    radius: 32,
    bezel: 24,
    strength: 18,
    blur: 30,
    saturate: 160,
  });

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-4 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <Link href="/" aria-label="Epsilon home" className="rounded-full">
        <Wordmark />
      </Link>

      <motion.div
        ref={lens.ref}
        data-glass
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
        className="glass glass-thick mt-8 w-full max-w-[420px] rounded-[32px] p-6 sm:p-9"
      >
        {lens.filter}
        <h1 className="title text-[30px]">{title}</h1>
        <p className="mt-2 text-[15px] text-ink-2">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </motion.div>

      <div className="mt-6 text-[14px] text-ink-3">{footer}</div>
      <p className="mt-8 max-w-xs text-center font-mono text-[11px] leading-relaxed text-ink-4">
        Preview build — accounts aren't live yet, and nothing you enter here is sent or stored.
      </p>
    </main>
  );
}

export function SocialButtons() {
  const toast = useToast();
  const notice = () => toast("Sign-in providers aren't connected in this preview.");
  return (
    <>
      <div className="my-6 flex items-center gap-3 text-[12px] text-ink-4">
        <span className="h-px flex-1 bg-white/10" />
        or continue with
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={notice}
          data-glass
          className="glass glass-thin glass-press inline-flex h-12 items-center justify-center gap-2 rounded-2xl text-[14px] font-medium"
        >
          <GoogleIcon className="size-4" /> Google
        </button>
        <button
          type="button"
          onClick={notice}
          data-glass
          className="glass glass-thin glass-press inline-flex h-12 items-center justify-center gap-2 rounded-2xl text-[14px] font-medium"
        >
          <GitHubIcon className="size-4" /> GitHub
        </button>
      </div>
    </>
  );
}

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className="btn-luminous inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium"
    >
      {loading && (
        <span className="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black/70" />
      )}
      {children}
    </button>
  );
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
