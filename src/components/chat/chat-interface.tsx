"use client";

import { useState, useRef, useEffect } from "react";
import { ChatInput } from "./chat-input";
import { WelcomeScreen } from "./welcome-screen";
import { MessageSquare, Bot } from "lucide-react";

type MessageRole = "user" | "assistant";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingIndex]);

  const handleSendMessage = (message: string) => {
    // In a real implementation, this would send the message to an API
    setIsLoading(true);

    // Add user message to chat
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response with typing effect
    setTimeout(() => {
      const aiResponse = "I'm a simulated Epsilon AI response. In a real implementation, I would be powered by an Epsilon model.";
      
      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: aiResponse
      };

      setMessages((prev) => [...prev, aiMessage]);
      simulateTyping(aiResponse);
    }, 800);
  };

  const simulateTyping = (text: string) => {
    setTypingIndex(0);
    
    const typingInterval = setInterval(() => {
      setTypingIndex(prev => {
        if (prev >= text.length) {
          clearInterval(typingInterval);
          setIsLoading(false);
          return prev;
        }
        return prev + 1;
      });
    }, 15); // Adjust speed of typing
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full filter blur-[100px]"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-accent/20 rounded-full filter blur-[100px]"></div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 pb-0 scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <div className="space-y-6 py-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } mb-4`}
              >
                {message.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center mr-2 shadow-lg">
                    <Bot size={16} className="text-accent" />
                  </div>
                )}
                
                <div
                  className={
                    message.role === "user"
                      ? "message-bubble-user"
                      : "message-bubble-assistant"
                  }
                >
                  {message.role === "assistant" && index === messages.length - 1 && isLoading
                    ? message.content.substring(0, typingIndex)
                    : message.content
                  }
                  {message.role === "assistant" && index === messages.length - 1 && isLoading && typingIndex < message.content.length && (
                    <span className="inline-block w-1 h-4 bg-accent ml-1 animate-pulse"></span>
                  )}
                </div>
                
                {message.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center ml-2 shadow-lg">
                    <MessageSquare size={16} className="text-primary" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && messages.length === 0 && (
              <div className="flex justify-start mb-4">
                <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center mr-2 shadow-lg">
                  <Bot size={16} className="text-accent" />
                </div>
                <div className="message-bubble-assistant">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
