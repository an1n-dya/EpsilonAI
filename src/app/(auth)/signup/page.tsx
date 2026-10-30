"use client";

import { Lock, Mail, User } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AuthShell, EMAIL_RE, SocialButtons, SubmitButton } from "@/components/auth/auth-shell";
import { Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

const STRENGTH = [
  { label: "Too short", color: "#ff4f7b" },
  { label: "Weak", color: "#ff6a3d" },
  { label: "Fair", color: "#ffb547" },
  { label: "Good", color: "#46d8ff" },
  { label: "Strong", color: "#5ef0b4" },
];

function strength(pw: string) {
  if (pw.length < 8) return 0;
  let score = 1;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const score = strength(password);
  const tone = STRENGTH[score] ?? STRENGTH[0];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = {
      name: name.trim() ? undefined : "Tell us what to call you.",
      email: EMAIL_RE.test(email.trim()) ? undefined : "Enter a valid email address.",
      password: password.length >= 8 ? undefined : "Use at least 8 characters.",
    };
    setErrors(next);
    if (next.name || next.email || next.password) return;

    setLoading(true);
    window.setTimeout(() => {
      setPassword("");
      toast("Preview mode — no account was created. Taking you to chat.");
      router.push("/chat");
    }, 900);
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free while Epsilon is in preview."
      footer={
        <>
          Already have one?{" "}
          <Link href="/login" className="font-medium text-ink hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field
          label="Name"
          icon={<User />}
          placeholder="Ada Lovelace"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          maxLength={80}
          required
        />
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
          placeholder="At least 8 characters"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          minLength={8}
          required
          hint={
            password ? (
              <span className="flex items-center gap-3" aria-live="polite">
                <span className="flex flex-1 gap-1">
                  {[1, 2, 3, 4].map((n) => (
                    <motion.span
                      key={n}
                      className="h-1 flex-1 rounded-full"
                      animate={{
                        backgroundColor: n <= score ? tone?.color : "rgba(255,255,255,0.1)",
                      }}
                      transition={{ duration: 0.25 }}
                    />
                  ))}
                </span>
                <span style={{ color: tone?.color }}>{tone?.label}</span>
              </span>
            ) : (
              "Use 12+ characters with a mix of cases, numbers and symbols."
            )
          }
        />
        <SubmitButton loading={loading}>{loading ? "Creating…" : "Create account"}</SubmitButton>
      </form>
      <SocialButtons />
    </AuthShell>
  );
}
