import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { EpsilonLens } from "@/components/landing/epsilon-lens";
import { Reveal, RevealItem } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Epsilon shows its reasoning, its sources and its confidence — and what this build is.",
};

const PRINCIPLES = [
  {
    title: "Say how sure you are.",
    body: "Confidence is part of the answer, not a disclaimer at the bottom. A number, a margin, and wording that matches both.",
  },
  {
    title: "Show the working.",
    body: "Reasoning stays attached to the conclusion, so you can check the one step you doubt instead of re-deriving the lot.",
  },
  {
    title: "Cite where you claim.",
    body: "A source belongs beside the sentence it supports. If a claim has no source, that should be visible too.",
  },
  {
    title: "Prefer “I don't know” to a guess.",
    body: "An honest gap is more useful than a confident fiction. Epsilon would rather tell you what it would need to find out.",
  },
];

const COLOPHON = [
  ["Framework", "Next.js 16 and React 19, exported as static files"],
  ["Motion", "Motion's spring physics; CSS springs for the small stuff"],
  ["Light", "A WebGL fragment shader of silk ribbons in a warped noise field"],
  ["Glass", "SVG displacement maps for refraction, via backdrop-filter and liquid-glass-web-react"],
  ["Type", "Bricolage Grotesque, Geist and Geist Mono"],
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pt-36 sm:pt-40">
      <section className="grid grid-cols-1 items-center gap-12 md:grid-cols-[1fr_auto]">
        <Reveal>
          <p className="eyebrow">About</p>
          <h1 className="display mt-6 text-[clamp(3rem,7.5vw,5.8rem)]">
            The smallest error you'll accept.
          </h1>
          <p className="mt-7 max-w-xl text-[17.5px] leading-relaxed text-ink-2">
            In analysis, ε is the tolerance: the margin of error you're prepared to live with. Every
            proof that something converges begins with{" "}
            <em className="text-ink">for every ε &gt; 0</em>. We liked the idea of an assistant that
            begins there too — by telling you how wrong it might be.
          </p>
        </Reveal>
        <div className="flex justify-center md:justify-end">
          <EpsilonLens />
        </div>
      </section>

      <section className="mt-32">
        <Reveal>
          <p className="eyebrow">Principles</p>
          <h2 className="title mt-4 text-[clamp(2.2rem,4.5vw,3.4rem)]">
            Four rules it doesn't break.
          </h2>
        </Reveal>
        <ol className="mt-12 grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <RevealItem key={p.title} delay={i * 0.06} className="border-hairline border-t pt-6">
              <span className="font-mono text-[12px] text-ink-4">0{i + 1}</span>
              <h3 className="title mt-3 text-[26px]">{p.title}</h3>
              <p className="mt-3 max-w-md text-[15.5px] leading-relaxed text-ink-2">{p.body}</p>
            </RevealItem>
          ))}
        </ol>
      </section>

      <section className="mt-32 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Reveal data-glass className="glass glass-thick rounded-[30px] p-7 sm:p-9">
          <p className="eyebrow">What this build is</p>
          <p className="mt-5 text-[16px] leading-relaxed text-ink-2">
            This is Epsilon's front end: the interface, the motion and the material.{" "}
            <span className="text-ink">There's no model behind it yet.</span> Answers to the sample
            questions are written by hand so you can see the whole experience; anything else gets an
            honest “not connected”.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-2">
            Conversations are kept in your browser's local storage. Nothing you type is sent
            anywhere, and accounts aren't live.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/chat" variant="luminous">
              Try it <ArrowRight />
            </Button>
            <Button href="https://github.com/an1n-dya/EpsilonAI">
              <GitHubIcon /> Source
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.08} data-glass className="glass glass-thin rounded-[30px] p-7 sm:p-9">
          <p className="eyebrow">Colophon</p>
          <dl className="mt-5 space-y-4">
            {COLOPHON.map(([term, detail]) => (
              <div key={term} className="grid grid-cols-[6.5rem_1fr] gap-4 text-[14.5px]">
                <dt className="font-mono text-[12px] leading-[1.6rem] text-ink-4">{term}</dt>
                <dd className="leading-relaxed text-ink-2">{detail}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>
    </div>
  );
}
