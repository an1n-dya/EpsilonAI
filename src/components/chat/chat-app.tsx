"use client";

import { ArrowDown, Menu, PanelLeft, SquarePen } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { replyTo, SUGGESTIONS } from "@/lib/chat/responses";
import { playReply } from "@/lib/chat/simulate";
import {
  loadConversations,
  loadModel,
  saveConversations,
  saveModel,
  takeDraft,
  titleFrom,
} from "@/lib/chat/store";
import type { Conversation, Message } from "@/lib/chat/types";
import { DEFAULT_MODEL, getModel, type ModelId } from "@/lib/models";
import { cn, uid } from "@/lib/utils";
import { Composer } from "./composer";
import { MessageView } from "./message";
import { ModelPicker } from "./model-picker";
import { type ConversationSummary, Sidebar } from "./sidebar";

type Busy = { convId: string; msgId: string };

export function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL);
  const [busy, setBusy] = useState<Busy | null>(null);
  const [ready, setReady] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [panel, setPanel] = useState(true);
  const [announcement, setAnnouncement] = useState("");

  const cancelRef = useRef<(() => void) | null>(null);
  const pendingDraft = useRef<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const latest = useRef(conversations);
  latest.current = conversations;

  // Move focus into the drawer when it opens, keep it there, and hand it back
  // to the menu button when it closes.
  const drawerWasOpen = useRef(false);
  useEffect(() => {
    if (drawer) {
      drawerWasOpen.current = true;
      requestAnimationFrame(() => drawerRef.current?.querySelector<HTMLElement>("button")?.focus());
    } else if (drawerWasOpen.current) {
      drawerWasOpen.current = false;
      if (!document.activeElement || document.activeElement === document.body) {
        menuRef.current?.focus();
      }
    }
  }, [drawer]);

  const trapFocus = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !drawerRef.current) return;
    const items = drawerRef.current.querySelectorAll<HTMLElement>("a[href], button, input");
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  };

  const active = conversations.find((c) => c.id === activeId) ?? null;

  /* Load & persist ------------------------------------------------------- */

  useEffect(() => {
    setConversations(loadConversations());
    const saved = loadModel();
    if (saved) setModel(saved);
    const draft = takeDraft();
    if (draft) pendingDraft.current = draft;
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !busy) saveConversations(conversations);
  }, [conversations, busy, ready]);

  useEffect(() => {
    // Save mid-stream state too if the tab is closed; it reloads as "stopped".
    const flush = () => saveConversations(latest.current);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      cancelRef.current?.();
    };
  }, []);

  /* Streaming ------------------------------------------------------------ */

  const patch = useCallback((convId: string, msgId: string, changes: Partial<Message>) => {
    setConversations((cs) =>
      cs.map((c) =>
        c.id !== convId
          ? c
          : { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...changes } : m)) },
      ),
    );
  }, []);

  const run = useCallback(
    (convId: string, prompt: string, modelId: ModelId, replaceId?: string) => {
      const reply = replyTo(prompt);
      const m = getModel(modelId);
      // Always a fresh id, so a regenerated answer remounts with clean state.
      const msgId = uid("m");
      const assistant: Message = {
        id: msgId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        model: modelId,
        confidence: reply.confidence,
        sources: reply.sources,
        reasoning: m.sim.showsReasoning ? reply.reasoning : [],
        stepsShown: 0,
        status: "thinking",
      };
      setConversations((cs) =>
        cs.map((c) =>
          c.id !== convId
            ? c
            : {
                ...c,
                updatedAt: Date.now(),
                messages: replaceId
                  ? c.messages.map((x) => (x.id === replaceId ? assistant : x))
                  : [...c.messages, assistant],
              },
        ),
      );
      setBusy({ convId, msgId });
      cancelRef.current = playReply(reply, m, {
        onStep: (n) => patch(convId, msgId, { stepsShown: n }),
        onStart: () => patch(convId, msgId, { status: "streaming" }),
        onText: (content) => patch(convId, msgId, { content }),
        onDone: () => {
          patch(convId, msgId, { status: "done" });
          setAnnouncement(`Epsilon answered: ${titleFrom(prompt)}`);
          cancelRef.current = null;
          setBusy(null);
        },
      });
    },
    [patch],
  );

  const stop = useCallback(() => {
    if (!busy) return;
    cancelRef.current?.();
    cancelRef.current = null;
    patch(busy.convId, busy.msgId, { status: "stopped" });
    setBusy(null);
  }, [busy, patch]);

  const send = useCallback(
    (text: string) => {
      const prompt = text.trim();
      if (!prompt || busy) return;
      const now = Date.now();
      const user: Message = { id: uid("m"), role: "user", content: prompt, createdAt: now };
      let convId = activeId;
      if (!convId || !latest.current.some((c) => c.id === convId)) {
        convId = uid("c");
        const conversation: Conversation = {
          id: convId,
          title: titleFrom(prompt),
          createdAt: now,
          updatedAt: now,
          model,
          messages: [user],
        };
        setConversations((cs) => [conversation, ...cs]);
        setActiveId(convId);
      } else {
        const id = convId;
        setConversations((cs) =>
          cs.map((c) =>
            c.id === id ? { ...c, model, updatedAt: now, messages: [...c.messages, user] } : c,
          ),
        );
      }
      run(convId, prompt, model);
    },
    [activeId, busy, model, run],
  );

  const regenerate = useCallback(
    (msgId: string) => {
      if (!active || busy) return;
      const index = active.messages.findIndex((m) => m.id === msgId);
      const prompt = active.messages
        .slice(0, index)
        .reverse()
        .find((m) => m.role === "user")?.content;
      if (prompt) run(active.id, prompt, model, msgId);
    },
    [active, busy, model, run],
  );

  // A question handed over from the landing page.
  useEffect(() => {
    if (!ready || !pendingDraft.current) return;
    const draft = pendingDraft.current;
    pendingDraft.current = null;
    send(draft);
  }, [ready, send]);

  /* Navigation ----------------------------------------------------------- */

  const newChat = useCallback(() => {
    stop();
    setActiveId(null);
    setDrawer(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [stop]);

  // Callbacks below stay stable while an answer streams, so the memoised
  // sidebar, composer and model picker can skip those renders.
  const select = useCallback(
    (id: string) => {
      if (id !== activeId) stop();
      setActiveId(id);
      setDrawer(false);
    },
    [activeId, stop],
  );

  const remove = useCallback(
    (id: string) => {
      if (busy?.convId === id) stop();
      setConversations((cs) => cs.filter((c) => c.id !== id));
      if (id === activeId) setActiveId(null);
    },
    [activeId, busy, stop],
  );

  const changeModel = useCallback((id: ModelId) => {
    setModel(id);
    saveModel(id);
  }, []);

  const hidePanel = useCallback(() => setPanel(false), []);
  const closeDrawer = useCallback(() => setDrawer(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        newChat();
      } else if (e.key === "Escape") {
        // An open menu (the model picker) handles its own Escape.
        if (document.querySelector('[role="menu"]')) return;
        if (drawer) setDrawer(false);
        else if (busy) stop();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [newChat, drawer, busy, stop]);

  /* Scrolling ------------------------------------------------------------ */

  const scrollRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const [atBottom, setAtBottom] = useState(true);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    stick.current = near;
    setAtBottom(near);
  };

  const scrollToEnd = (smooth: boolean) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  };

  // Follow the stream while the reader is at the bottom; leave them alone if
  // they've scrolled up to read.
  // biome-ignore lint/correctness/useExhaustiveDependencies: follow every content change
  useLayoutEffect(() => {
    if (stick.current) scrollToEnd(false);
  }, [active?.messages]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on conversation change
  useLayoutEffect(() => {
    stick.current = true;
    setAtBottom(true);
    scrollToEnd(false);
  }, [activeId]);

  const lastAssistant = active?.messages.findLast((m) => m.role === "assistant")?.id;

  const sendFromComposer = useCallback(
    (text: string) => {
      stick.current = true;
      send(text);
    },
    [send],
  );

  // The sidebar shows titles and dates only. Streaming replaces the active
  // conversation on every chunk, so derive a list that changes only when
  // something it shows does.
  const summaryKey = JSON.stringify(conversations.map((c) => [c.id, c.title, c.updatedAt]));
  // biome-ignore lint/correctness/useExhaustiveDependencies: summaryKey covers every field used
  const summaries = useMemo<ConversationSummary[]>(
    () => conversations.map(({ id, title, updatedAt }) => ({ id, title, updatedAt })),
    [summaryKey],
  );

  /* Render --------------------------------------------------------------- */

  const sidebarProps = {
    conversations: summaries,
    activeId,
    busyId: busy?.convId ?? null,
    onSelect: select,
    onNew: newChat,
    onDelete: remove,
  };

  return (
    <div className="flex h-[100dvh] gap-3 overflow-hidden md:p-3">
      {/* Desktop panel. With presenceAffectsLayout on (the default), AnimatePresence
          hands its children a new context on every render, which would reach the
          sidebar's rows through its memo and make them re-measure their layout on
          every streamed chunk. Nothing here animates its layout, so turn it off. */}
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {panel && (
          <motion.aside
            key="panel"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 284, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="hidden shrink-0 overflow-hidden md:block"
          >
            <div data-glass className="glass glass-thick h-full w-[284px] rounded-[28px]">
              <Sidebar {...sidebarProps} variant="panel" onClose={hidePanel} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile drawer (presenceAffectsLayout: see above) */}
      <AnimatePresence presenceAffectsLayout={false}>
        {drawer && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
              className="fixed inset-0 z-40 bg-black/55 md:hidden"
              aria-hidden
            />
            <motion.aside
              key="drawer"
              ref={drawerRef}
              onKeyDown={trapFocus}
              role="dialog"
              aria-modal="true"
              aria-label="Conversations"
              initial={{ x: "-105%" }}
              animate={{ x: 0 }}
              exit={{ x: "-105%" }}
              transition={{ type: "spring", stiffness: 420, damping: 40 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0.5, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70 || info.velocity.x < -400) setDrawer(false);
              }}
              data-glass
              className="glass glass-thick fixed inset-y-2 left-2 z-50 w-[min(20rem,calc(100vw-3rem))] rounded-[28px] pt-[env(safe-area-inset-top)] md:hidden"
            >
              <Sidebar {...sidebarProps} variant="drawer" onClose={closeDrawer} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main
        data-glass
        className="glass glass-thick relative flex min-w-0 flex-1 flex-col overflow-hidden [--g-fill-bottom:rgb(10_11_17/.62)] [--g-fill-top:rgb(18_20_28/.5)] md:rounded-[28px]"
      >
        <header className="absolute inset-x-0 top-0 z-20 flex h-16 items-center gap-2 px-2 pt-[env(safe-area-inset-top)] sm:px-4">
          <button
            ref={menuRef}
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open conversations"
            aria-expanded={drawer}
            className="grid size-11 place-items-center rounded-full text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink md:hidden"
          >
            <Menu className="size-5" />
          </button>
          {!panel && (
            <button
              type="button"
              onClick={() => setPanel(true)}
              aria-label="Show sidebar"
              className="hidden size-10 place-items-center rounded-full text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink md:grid"
            >
              <PanelLeft className="size-[18px]" />
            </button>
          )}
          <h1 className="min-w-0 flex-1 truncate px-1 text-[14.5px] font-medium text-ink-2">
            {active?.title ?? "New conversation"}
          </h1>
          <span className="hidden rounded-full bg-flare/10 px-2.5 py-1 font-mono text-[10.5px] text-flare/90 lg:inline">
            Preview · simulated answers
          </span>
          <ModelPicker value={model} onChange={changeModel} />
          <button
            type="button"
            onClick={newChat}
            aria-label="New conversation"
            className="grid size-11 place-items-center rounded-full text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink md:hidden"
          >
            <SquarePen className="size-[18px]" />
          </button>
        </header>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain [mask-image:linear-gradient(to_bottom,transparent,transparent_56px,#000_104px,#000_calc(100%-28px),transparent)]"
        >
          {!ready ? null : !active ? (
            <EmptyState onPick={send} />
          ) : (
            <div className="mx-auto max-w-[760px] space-y-8 px-4 pt-28 pb-44 sm:px-6">
              {active.messages.map((m) => (
                <MessageView
                  key={m.id}
                  message={m}
                  onRegenerate={m.id === lastAssistant && !busy ? regenerate : undefined}
                />
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {!atBottom && active && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              onClick={() => {
                stick.current = true;
                scrollToEnd(true);
              }}
              aria-label="Jump to latest"
              data-glass
              className="glass glass-thin glass-press absolute bottom-32 left-1/2 z-20 grid size-10 -translate-x-1/2 place-items-center rounded-full sm:bottom-36"
            >
              <ArrowDown className="size-4" />
            </motion.button>
          )}
        </AnimatePresence>

        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>

        <Composer
          onSend={sendFromComposer}
          onStop={stop}
          busy={busy !== null}
          inputRef={inputRef}
        />
      </main>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="mx-auto flex min-h-full max-w-[760px] flex-col items-center justify-center px-4 pt-24 pb-40 text-center sm:px-6">
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
      >
        <LogoMark size={56} className="drop-shadow-[0_10px_30px_rgb(255_106_61/.45)]" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.06 }}
        className="display mt-7 text-[clamp(2.3rem,7vw,3.6rem)]"
      >
        What should we check?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.12 }}
        className="mt-4 max-w-md text-[15.5px] leading-relaxed text-ink-2"
      >
        Ask anything. Each answer arrives with its reasoning, its sources and how sure it is.
      </motion.p>

      <ul className="mt-10 grid w-full gap-2.5 text-left sm:grid-cols-2">
        {SUGGESTIONS.map((s, i) => (
          <motion.li
            key={s.prompt}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 24, delay: 0.18 + i * 0.05 }}
            className={cn(
              i === SUGGESTIONS.length - 1 && SUGGESTIONS.length % 2 === 1 && "sm:col-span-2",
            )}
          >
            <button
              type="button"
              onClick={() => onPick(s.prompt)}
              data-glass
              className="glass glass-thin glass-press flex h-full w-full flex-col items-start gap-1.5 rounded-[20px] px-4 py-3.5 text-left"
            >
              <span className="eyebrow !text-[10px]">{s.label}</span>
              <span className="text-[14.5px] leading-snug text-ink">{s.prompt}</span>
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
