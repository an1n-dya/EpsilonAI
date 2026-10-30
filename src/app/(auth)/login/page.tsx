"use client";

import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AuthShell, EMAIL_RE, SocialButtons, SubmitButton } from "@/components/auth/auth-shell";
import { Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = {
      email: EMAIL_RE.test(email.trim()) ? undefined : "Enter a valid email address.",
      password: password ? undefined : "Enter your password.",
    };
    setErrors(next);
    if (next.email || next.password) return;

    // No backend in this build: pretend to sign in, keep nothing.
    setLoading(true);
    window.setTimeout(() => {
      setPassword("");
      toast("Preview mode — taking you straight to chat.");
      router.push("/chat");
    }, 900);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={
        <>
          New to Epsilon?{" "}
          <Link href="/signup" className="font-medium text-ink hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field
          label="Email"
          type="email"
          icon={<Mail />}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />
        <Field
          label="Password"
          type="password"
          icon={<Lock />}
          placeholder="Your password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
          aside={
            <Link href="/forgot-password" className="text-[12.5px] text-ink-3 hover:text-ink">
              Forgot?
            </Link>
          }
        />
        <SubmitButton loading={loading}>{loading ? "Signing in…" : "Sign in"}</SubmitButton>
      </form>
      <SocialButtons />
    </AuthShell>
  );
}
