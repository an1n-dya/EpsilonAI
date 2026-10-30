import type { ModelId } from "@/lib/models";

export type Source = { title: string; url: string };

export type MessageStatus = "thinking" | "streaming" | "done" | "stopped";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  model?: ModelId;
  /** 0–1, or null when a confidence score doesn't apply. */
  confidence?: number | null;
  sources?: Source[];
  reasoning?: string[];
  /** How many reasoning steps have been revealed so far. */
  stepsShown?: number;
  status?: MessageStatus;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: ModelId;
  messages: Message[];
};

export type Reply = {
  content: string;
  confidence: number | null;
  sources: Source[];
  reasoning: string[];
};
