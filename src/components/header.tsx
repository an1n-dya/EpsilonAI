"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-black flex items-center justify-center rounded w-8 h-8">
              ε
            </div>
            <span className="logo font-medium">Epsilon</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-muted-foreground"
            asChild
          >
            <Link href="/login">Sign in</Link>
          </Button>
          <Button
            size="sm"
            className="bg-white text-black hover:bg-white/90 rounded-full font-medium text-sm"
            asChild
          >
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
