import { ReactNode } from "react";
import Link from "next/link";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

export function AuthLayout({
  children,
  title,
  description,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="bg-black flex items-center justify-center rounded w-8 h-8">
          <div className="w-4 h-0.5 bg-white rotate-45" />
        </div>
        <span className="logo font-medium">Epsilon</span>
      </Link>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>

        <div className="border border-border/50 bg-card rounded-xl p-6 shadow-sm">
          {children}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {footerText}{" "}
          <Link href={footerLinkHref} className="underline hover:text-foreground">
            {footerLinkText}
          </Link>
        </div>
      </div>
    </div>
  );
}
