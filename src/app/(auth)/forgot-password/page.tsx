"use client";

import { Mail, MailCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { AuthShell, EMAIL_RE, SubmitButton } from "@/components/auth/auth-shell";
import { Field } from "@/components/ui/field";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 900);
  };

  return (
    <AuthShell
      title={sent ? "Check your inbox" : "Reset your password"}
      subtitle={
        sent
          ? "If an account exists, a reset link is on its way."
          : "We'll email you a link to set a new one."
      }
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-ink hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-mint/10 text-mint shadow-[inset_0_0_0_1px_rgb(94_240_180/.25)]">
              <MailCheck className="size-7" />
            </div>
            <p className="mt-5 text-[14.5px] text-ink-2">
              Sent to <span className="font-medium text-ink">{email.trim()}</span>.
            </p>
            <p className="mt-2 font-mono text-[11.5px] text-ink-4">
              (In this preview, no email is actually sent.)
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-6 text-[14px] font-medium text-ink-2 hover:text-ink"
            >
              Use a different address
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            noValidate
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-5"
          >
            <Field
              label="Email"
              type="email"
              icon={<Mail />}
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              required
            />
            <SubmitButton loading={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </SubmitButton>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
