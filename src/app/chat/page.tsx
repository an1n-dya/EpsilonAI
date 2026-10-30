import type { Metadata } from "next";
import { ChatApp } from "@/components/chat/chat-app";

export const metadata: Metadata = {
  title: "Chat",
  description: "Talk to Epsilon. Every answer shows its reasoning, sources and confidence.",
};

export default function ChatPage() {
  return <ChatApp />;
}
