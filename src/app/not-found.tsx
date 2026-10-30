import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { LostLens } from "@/components/site/lost-lens";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16 text-center">
      <Link href="/" aria-label="Epsilon home" className="mb-10 rounded-full">
        <Wordmark />
      </Link>
      <h1 className="sr-only">Page not found</h1>
      <LostLens />
      <p className="title mt-6 text-[clamp(1.8rem,4vw,2.6rem)]">Outside the margin of error.</p>
      <p className="mt-3 max-w-sm text-[15.5px] text-ink-2">
        The page you're after doesn't exist, or it moved. Drag the lens if you'd like a closer look.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Button href="/" variant="luminous">
          Go home
        </Button>
        <Button href="/chat">
          Ask Epsilon <ArrowRight />
        </Button>
      </div>
    </main>
  );
}
