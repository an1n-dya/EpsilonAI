import { Header } from "@/components/header";
import { ChatInterface } from "@/components/chat/chat-interface";

export default function ChatPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1">
        <ChatInterface />
      </div>
    </main>
  );
}
