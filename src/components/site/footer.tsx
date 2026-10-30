import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { GitHubIcon } from "@/components/ui/icons";

const REPO = "https://github.com/an1n-dya/EpsilonAI";

export function Footer() {
  return (
    <footer className="relative mt-32 border-hairline border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-14 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Wordmark />
          <p className="mt-4 text-[13.5px] leading-relaxed text-ink-3">
            An assistant that shows its working. This build is a front-end preview — answers are
            simulated in your browser.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-16 gap-y-3 text-[14px]">
          <span className="eyebrow col-span-2 mb-1">Explore</span>
          <Link className="text-ink-2 transition-colors hover:text-ink" href="/chat">
            Chat
          </Link>
          <Link className="text-ink-2 transition-colors hover:text-ink" href="/about">
            About
          </Link>
          <Link className="text-ink-2 transition-colors hover:text-ink" href="/signup">
            Create account
          </Link>
          <a
            className="inline-flex items-center gap-1.5 text-ink-2 transition-colors hover:text-ink"
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon className="size-3.5" /> Source
          </a>
        </nav>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 pb-10 text-[12px] text-ink-4 sm:flex-row sm:justify-between">
        <span className="font-mono">© {new Date().getFullYear()} Epsilon · GPL-3.0</span>
        <span className="font-mono">ε → 0</span>
      </div>
    </footer>
  );
}
