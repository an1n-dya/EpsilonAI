"use client";

import { ArrowUpRight, Check, ChevronDown, Copy, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import type { Message } from "@/lib/chat/types";
import { getModel } from "@/lib/models";
import { cn, safeHref } from "@/lib/utils";
import { Confidence, confidenceTone } from "./confidence";
import { Markdown } from "./markdown";

const enter = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring" as const, stiffness: 320, damping: 30 },
};

export const MessageView = memo(function MessageView({
  message,
  onRegenerate,
}: {
  message: Message;
  onRegenerate?: (id: string) => void;
}) {
  if (message.role === "user") {
    return (
      <motion.div {...enter} className="flex justify-end">
        <div className="max-w-[85%] rounded-[22px] rounded-br-lg bg-white/[0.09] px-4 py-2.5 text-[15.5px] leading-relaxed whitespace-pre-wrap break-words text-ink shadow-[inset_0_1px_0_rgb(255_255_255/.1),inset_0_0_0_1px_rgb(255_255_255/.04)] sm:max-w-[75%]">
          {message.content}
        </div>
      </motion.div>
    );
  }
  return <AssistantMessage message={message} onRegenerate={onRegenerate} />;
});

function AssistantMessage({
  message,
  onRegenerate,
}: {
  message: Message;
  onRegenerate?: (id: string) => void;
}) {
  const { status = "done", content, reasoning = [], sources = [] } = message;
  const thinking = status === "thinking";
  const streaming = status === "streaming";
  const settled = status === "done" || status === "stopped";
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);
  const model = message.model ? getModel(message.model) : null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked; ignore.
    }
  };

  return (
    <motion.article {...enter} className="flex gap-3 sm:gap-4" aria-busy={!settled}>
      <div className="relative mt-0.5 shrink-0 self-start">
        <LogoMark size={28} />
        {!settled && (
          <span className="absolute -inset-1.5 animate-ping rounded-[14px] bg-ember/20 [animation-duration:1.8s]" />
        )}
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        {reasoning.length > 0 && (
          <Reasoning steps={reasoning} shown={message.stepsShown ?? 0} thinking={thinking} />
        )}

        {thinking && reasoning.length === 0 && (
          <p className="text-shimmer py-1 text-[14px]">Thinking…</p>
        )}

        {content && (
          <Markdown
            // Hide a citation marker that's only half arrived, e.g. "[^".
            text={streaming ? content.replace(/\[\^?\d*$/, "") : content}
            sources={sources}
            className={cn(streaming && "is-streaming")}
          />
        )}

        {status === "stopped" && (
          <p className="mt-3 font-mono text-[11.5px] text-ink-4">
            {content ? "Stopped." : "Stopped before answering."}
          </p>
        )}

        <AnimatePresence>
          {status === "done" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.1 }}
              className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2"
            >
              {typeof message.confidence === "number" && (
                <span className="inline-flex items-center gap-2.5">
                  <Confidence value={message.confidence} />
                  <span
                    className="hidden text-[11.5px] sm:inline"
                    style={{ color: confidenceTone(message.confidence).color }}
                  >
                    {confidenceTone(message.confidence).label}
                  </span>
                </span>
              )}
              {sources.length > 0 && (
                <button
                  type="button"
                  aria-expanded={showSources}
                  onClick={() => setShowSources((v) => !v)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white/[0.06] px-3.5 font-mono sm:h-8 sm:px-3 text-[11.5px] text-ink-2 transition-colors hover:bg-white/[0.1] hover:text-ink"
                >
                  {sources.length} {sources.length === 1 ? "source" : "sources"}
                  <ChevronDown
                    className={cn("size-3.5 transition-transform", showSources && "rotate-180")}
                  />
                </button>
              )}
              <span className="ml-auto flex items-center gap-0.5 text-ink-3">
                {model && (
                  <span className="mr-2 hidden font-mono text-[10.5px] text-ink-4 sm:inline">
                    {model.name} · {model.nick}
                  </span>
                )}
                <IconButton label={copied ? "Copied" : "Copy answer"} onClick={copy}>
                  {copied ? <Check className="text-mint" /> : <Copy />}
                </IconButton>
                {onRegenerate && (
                  <IconButton label="Regenerate" onClick={() => onRegenerate(message.id)}>
                    <RotateCcw />
                  </IconButton>
                )}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {showSources && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="overflow-hidden"
            >
              <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                {sources.map((s, i) => {
                  const href = safeHref(s.url);
                  let host = "";
                  try {
                    host = new URL(s.url).hostname.replace(/^www\./, "");
                  } catch {
                    host = "";
                  }
                  return (
                    <li key={s.url}>
                      <a
                        href={href ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-glass
                        className="glass glass-thin glass-press flex items-start gap-3 rounded-2xl p-3 pr-3.5"
                      >
                        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-white/10 font-mono text-[11px] text-ink-2">
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-mono text-[10.5px] text-tide">
                            {host}
                          </span>
                          <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-ink">
                            {s.title}
                          </span>
                        </span>
                        <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-ink-3" />
                      </a>
                    </li>
                  );
                })}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

function Reasoning({
  steps,
  shown,
  thinking,
}: {
  steps: string[];
  shown: number;
  thinking: boolean;
}) {
  const [toggled, setToggled] = useState<boolean | null>(null);
  const open = toggled ?? thinking;

  return (
    <div className="mb-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setToggled(!open)}
        className="inline-flex h-8 items-center gap-2 rounded-full pr-2 text-[13px] text-ink-3 transition-colors hover:text-ink-2"
      >
        {thinking ? (
          <span className="text-shimmer">Reasoning</span>
        ) : (
          <span>
            Reasoning <span className="text-ink-4">· {steps.length} steps</span>
          </span>
        )}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="overflow-hidden"
          >
            <ol className="mt-1 ml-1 space-y-2 border-hairline border-l py-1 pl-4">
              {steps.slice(0, Math.max(shown, thinking ? 0 : steps.length)).map((step, i) => (
                <motion.li
                  key={step}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2.5 text-[13px] leading-snug text-ink-3"
                >
                  <span className="mt-[3px] font-mono text-[10.5px] text-ink-4">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {step}
                </motion.li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-11 place-items-center rounded-full transition-colors hover:bg-white/[0.07] hover:text-ink sm:size-9 [&_svg]:size-4"
    >
      {children}
    </button>
  );
}
