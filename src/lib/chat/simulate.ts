import type { Model } from "@/lib/models";
import type { Reply } from "./types";

type Handlers = {
  /** A reasoning step was revealed (1-based count). */
  onStep: (shown: number) => void;
  /** Thinking is over; text starts arriving. */
  onStart: () => void;
  onText: (text: string) => void;
  onDone: () => void;
};

/**
 * Plays a reply back the way a streaming model would: a thinking pause that
 * reveals reasoning steps, then text in small uneven chunks with short rests
 * at punctuation. Returns a cancel function; nothing fires after cancelling.
 */
export function playReply(reply: Reply, model: Model, handlers: Handlers): () => void {
  const timers = new Set<number>();
  let cancelled = false;

  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      if (!cancelled) fn();
    }, ms);
    timers.add(t);
  };

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const steps = model.sim.showsReasoning ? reply.reasoning.length : 0;
  const thinkMs = reduce ? 0 : model.sim.thinkMs + steps * 120;
  const text = reply.content;

  for (let i = 0; i < steps; i++) {
    later(() => handlers.onStep(i + 1), (thinkMs / (steps + 1)) * (i + 1));
  }

  const tick = (pos: number) => {
    if (pos >= text.length) {
      handlers.onText(text);
      handlers.onDone();
      return;
    }
    // Code streams in bigger bites than prose.
    const inCode = (text.slice(0, pos).match(/```/g)?.length ?? 0) % 2 === 1;
    const size = (inCode ? 6 : 2) + Math.floor(Math.random() * (inCode ? 10 : 5));
    const next = Math.min(text.length, pos + size);
    handlers.onText(text.slice(0, next));
    const last = text[next - 1] ?? "";
    let delay = (size / model.sim.charsPerSecond) * 1000;
    if (!inCode) {
      if (".!?".includes(last)) delay += 110;
      else if (last === "\n") delay += 70;
      else if (",;:".includes(last)) delay += 35;
    }
    later(() => tick(next), delay);
  };

  later(() => {
    if (steps) handlers.onStep(steps);
    handlers.onStart();
    if (reduce) {
      handlers.onText(text);
      handlers.onDone();
    } else {
      tick(0);
    }
  }, thinkMs);

  return () => {
    cancelled = true;
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
}
