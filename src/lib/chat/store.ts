import { MODELS, type ModelId } from "@/lib/models";
import type { Conversation, Message, Source } from "./types";

/**
 * Conversations live in localStorage on this device only. Everything read
 * back is validated: storage is user-editable, so a corrupt or hand-crafted
 * entry must never crash the app or smuggle in unexpected shapes.
 */

const KEY = "epsilon:conversations:v1";
export const DRAFT_KEY = "epsilon:draft";
export const MODEL_KEY = "epsilon:model";

const MAX_CONVERSATIONS = 60;
const MAX_MESSAGES = 200;
const MAX_CONTENT = 20_000;

const modelIds = new Set<string>(MODELS.map((m) => m.id));

const isString = (v: unknown, max = MAX_CONTENT): v is string =>
  typeof v === "string" && v.length <= max;
const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function readSource(v: unknown): Source | null {
  if (!v || typeof v !== "object") return null;
  const s = v as Record<string, unknown>;
  if (!isString(s.title, 300) || !isString(s.url, 2000)) return null;
  return { title: s.title, url: s.url };
}

function readMessage(v: unknown): Message | null {
  if (!v || typeof v !== "object") return null;
  const m = v as Record<string, unknown>;
  if (!isString(m.id, 100) || !isString(m.content) || !isNumber(m.createdAt)) return null;
  if (m.role !== "user" && m.role !== "assistant") return null;

  const message: Message = { id: m.id, role: m.role, content: m.content, createdAt: m.createdAt };
  if (isString(m.model, 10) && modelIds.has(m.model)) message.model = m.model as ModelId;
  if (m.confidence === null || (isNumber(m.confidence) && m.confidence >= 0 && m.confidence <= 1)) {
    message.confidence = m.confidence;
  }
  if (Array.isArray(m.sources)) {
    message.sources = m.sources
      .map(readSource)
      .filter((s): s is Source => s !== null)
      .slice(0, 12);
  }
  if (Array.isArray(m.reasoning)) {
    message.reasoning = m.reasoning.filter((s): s is string => isString(s, 400)).slice(0, 12);
    message.stepsShown = message.reasoning.length;
  }
  if (m.role === "assistant") {
    // Anything still in flight when the page closed was cut short.
    message.status = m.status === "done" ? "done" : "stopped";
  }
  return message;
}

function readConversation(v: unknown): Conversation | null {
  if (!v || typeof v !== "object") return null;
  const c = v as Record<string, unknown>;
  if (!isString(c.id, 100) || !isString(c.title, 200)) return null;
  if (!isNumber(c.createdAt) || !isNumber(c.updatedAt) || !Array.isArray(c.messages)) return null;
  const messages = c.messages
    .map(readMessage)
    .filter((m): m is Message => m !== null)
    .slice(-MAX_MESSAGES);
  if (messages.length === 0) return null;
  const model = isString(c.model, 10) && modelIds.has(c.model) ? (c.model as ModelId) : "e2";
  return {
    id: c.id,
    title: c.title,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    model,
    messages,
  };
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(readConversation)
      .filter((c): c is Conversation => c !== null)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_CONVERSATIONS);
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]) {
  try {
    const keep = conversations
      .filter((c) => c.messages.length > 0)
      .slice(0, MAX_CONVERSATIONS)
      .map((c) => ({ ...c, messages: c.messages.slice(-MAX_MESSAGES) }));
    localStorage.setItem(KEY, JSON.stringify(keep));
  } catch {
    // Quota exceeded or storage disabled: the session still works in memory.
  }
}

export function clearConversations() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function takeDraft(): string | null {
  try {
    const draft = sessionStorage.getItem(DRAFT_KEY);
    sessionStorage.removeItem(DRAFT_KEY);
    return draft && draft.length <= 4000 ? draft : null;
  } catch {
    return null;
  }
}

export function loadModel(): ModelId | null {
  try {
    const m = localStorage.getItem(MODEL_KEY);
    return m && modelIds.has(m) ? (m as ModelId) : null;
  } catch {
    return null;
  }
}

export function saveModel(id: ModelId) {
  try {
    localStorage.setItem(MODEL_KEY, id);
  } catch {
    // ignore
  }
}

export function titleFrom(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 48 ? `${clean.slice(0, 46).trimEnd()}…` : clean || "New conversation";
}
