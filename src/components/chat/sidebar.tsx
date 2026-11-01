"use client";

import { PanelLeftClose, Search, SquarePen, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { memo, useEffect, useMemo, useState } from "react";
import { Wordmark } from "@/components/brand/logo";
import type { Conversation } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

/** All the sidebar shows of a conversation. */
export type ConversationSummary = Pick<Conversation, "id" | "title" | "updatedAt">;

type Group = { label: string; items: ConversationSummary[] };

function groupByDate(conversations: ConversationSummary[]): Group[] {
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const day = 86_400_000;
  const buckets: Group[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Older", items: [] },
  ];
  for (const c of conversations) {
    const t = c.updatedAt;
    const i =
      t >= startOfToday ? 0 : t >= startOfToday - day ? 1 : t >= startOfToday - 7 * day ? 2 : 3;
    buckets[i]?.items.push(c);
  }
  return buckets.filter((b) => b.items.length > 0);
}

// Memoised: the chat re-renders on every streamed chunk, and the list's rows
// carry layout animations that would measure themselves each time.
export const Sidebar = memo(function Sidebar({
  conversations,
  activeId,
  busyId,
  onSelect,
  onNew,
  onDelete,
  onClose,
  variant,
}: {
  conversations: ConversationSummary[];
  activeId: string | null;
  busyId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  variant: "panel" | "drawer";
}) {
  const [query, setQuery] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);
  const [shortcut, setShortcut] = useState("Ctrl ⇧ O");

  useEffect(() => {
    if (/mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent)) setShortcut("⇧⌘O");
  }, []);

  useEffect(() => {
    if (!confirming) return;
    const t = window.setTimeout(() => setConfirming(null), 3000);
    return () => window.clearTimeout(t);
  }, [confirming]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...conversations]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .filter((c) => !q || c.title.toLowerCase().includes(q));
    return groupByDate(list);
  }, [conversations, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between pr-2 pl-4">
        <Link href="/" aria-label="Epsilon home" className="rounded-full">
          <Wordmark />
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label={variant === "drawer" ? "Close conversations" : "Hide sidebar"}
          className="grid size-11 place-items-center rounded-full text-ink-3 transition-colors hover:bg-white/[0.06] hover:text-ink md:size-10"
        >
          {variant === "drawer" ? (
            <X className="size-5" />
          ) : (
            <PanelLeftClose className="size-[18px]" />
          )}
        </button>
      </div>

      <div className="space-y-2 px-3">
        <button
          type="button"
          onClick={onNew}
          data-glass
          className="glass glass-thin glass-press flex h-11 w-full items-center gap-2.5 rounded-2xl px-3.5 text-[14px] font-medium"
        >
          <SquarePen className="size-4 text-ink-2" />
          New conversation
          <span className="kbd ml-auto hidden md:inline-grid">{shortcut}</span>
        </button>
        <div className="flex h-11 items-center gap-2.5 rounded-2xl bg-black/20 px-3.5 shadow-[inset_0_0_0_1px_rgb(255_255_255/.05)] focus-within:shadow-[inset_0_0_0_1px_rgb(70_216_255/.4)]">
          <Search className="size-4 shrink-0 text-ink-4" />
          <label htmlFor="conversation-search" className="sr-only">
            Search conversations
          </label>
          <input
            id="conversation-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-4 md:text-[14px]"
          />
        </div>
      </div>

      <nav
        aria-label="Conversations"
        className="fade-edges-y mt-3 min-h-0 flex-1 overflow-y-auto px-3 py-3"
      >
        {groups.length === 0 ? (
          <p className="px-3 py-6 text-center text-[13px] leading-relaxed text-ink-4">
            {query
              ? "No conversations match."
              : "Your conversations will appear here. They're saved on this device only."}
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.label} className="mb-5">
              <h2 className="eyebrow mb-1.5 px-3 !text-[10px]">{group.label}</h2>
              <ul className="space-y-0.5">
                <AnimatePresence initial={false}>
                  {group.items.map((c) => {
                    const active = c.id === activeId;
                    const confirm = confirming === c.id;
                    return (
                      <motion.li
                        key={c.id}
                        layout
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12, height: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 34 }}
                        className="group relative"
                      >
                        <button
                          type="button"
                          onClick={() => onSelect(c.id)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex h-11 w-full items-center gap-2 rounded-xl pr-11 pl-3 text-left text-[14px] transition-colors",
                            active
                              ? "bg-white/[0.09] text-ink"
                              : "text-ink-2 hover:bg-white/[0.045] hover:text-ink",
                          )}
                        >
                          {busyId === c.id && (
                            <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-ember" />
                          )}
                          <span className="truncate">{c.title}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => (confirm ? onDelete(c.id) : setConfirming(c.id))}
                          onBlur={() => confirm && setConfirming(null)}
                          aria-label={
                            confirm ? `Confirm delete “${c.title}”` : `Delete “${c.title}”`
                          }
                          className={cn(
                            "absolute top-1/2 right-1.5 grid h-8 -translate-y-1/2 place-items-center rounded-lg transition-all",
                            confirm
                              ? "w-auto bg-rose/20 px-2.5 text-[12px] font-medium text-[#ff9ab4]"
                              : "w-8 text-ink-4 hover:bg-white/[0.07] hover:text-ink md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100",
                            active && !confirm && "md:opacity-100",
                          )}
                        >
                          {confirm ? "Delete" : <Trash2 className="size-3.5" />}
                        </button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </section>
          ))
        )}
      </nav>

      <div className="shrink-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="rounded-2xl bg-black/20 p-3.5 text-[12.5px] leading-relaxed text-ink-3 shadow-[inset_0_0_0_1px_rgb(255_255_255/.05)]">
          <p>
            <span className="font-medium text-ink-2">Preview build.</span> Answers are simulated;
            chats stay in this browser.
          </p>
          <Link href="/login" className="mt-2 inline-block font-medium text-ink-2 hover:text-ink">
            Sign in →
          </Link>
        </div>
      </div>
    </div>
  );
});
