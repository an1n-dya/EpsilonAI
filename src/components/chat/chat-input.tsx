"use client";

import { useState, type FormEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Mic, Sparkles } from "lucide-react";
import { ModelSelector } from "@/components/model-selector";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [model, setModel] = useState("Epsilon E3");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !inputRef.current?.matches(":focus")) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center px-1">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-200"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-200"
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>
        <ModelSelector onModelChange={handleModelChange} />
      </div>

      <form onSubmit={handleSubmit} className="relative flex items-center group">
        {/* Animated focus ring */}
        <div 
          className={`absolute inset-0 rounded-full transition-all duration-300 ${
            isFocused ? "bg-gradient-to-r from-primary/20 to-accent/20 scale-[1.02] blur-md" : "opacity-0"
          }`}
        ></div>
        
        <Input
          ref={inputRef}
          type="text"
          placeholder="What do you want to know? (Press / to focus)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="chat-input pr-12 z-10 placeholder:text-muted-foreground/70"
          disabled={isLoading}
        />
        
        <Button
          type="submit"
          size="icon"
          className={`absolute right-2 rounded-full transition-all duration-300 z-10 ${
            input.trim() && !isLoading 
              ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
              : "bg-transparent text-muted-foreground"
          }`}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          ) : (
            input.trim() ? <Send className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
