"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Mic } from "lucide-react";
import { ModelSelector } from "@/components/model-selector";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [model, setModel] = useState("Epsilon E3");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput("");
    }
  };

  const handleModelChange = (selectedModel: string) => {
    setModel(selectedModel);
    // In a real app, this would update the API requests to use the selected model
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center px-1">
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
            <Mic className="h-4 w-4" />
          </Button>
        </div>
        <ModelSelector onModelChange={handleModelChange} />
      </div>

      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Input
          type="text"
          placeholder="What do you want to know?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="chat-input pr-12"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 rounded-full bg-transparent hover:bg-secondary"
          disabled={!input.trim() || isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
