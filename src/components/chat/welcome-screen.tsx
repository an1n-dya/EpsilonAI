"use client";

import { Button } from "@/components/ui/button";
import { Search, Brain, BarChart2, Image, Code, MessageCircle, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export function WelcomeScreen() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 text-center px-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full filter blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-accent/20 rounded-full filter blur-[100px] animate-pulse-slow" style={{ animationDelay: "1s" }}></div>
        </div>
      </div>
      
      <div className={`transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="mx-auto w-16 h-16 mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full animate-pulse-slow"></div>
          <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">ε</div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-accent to-primary">Welcome to Epsilon.</h1>
        <p className="text-xl text-muted-foreground">How can I help you today?</p>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full transform transition-all duration-700 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <ToolButton icon={<Search size={18} />} label="Research" delay={0} />
        <ToolButton icon={<Brain size={18} />} label="Brainstorm" delay={0.1} />
        <ToolButton icon={<BarChart2 size={18} />} label="Analyze Data" delay={0.2} />
        <ToolButton icon={<Image size={18} />} label="Generate Images" delay={0.3} />
        <ToolButton icon={<Code size={18} />} label="Write Code" delay={0.4} />
        <ToolButton icon={<MessageCircle size={18} />} label="Chat" delay={0.5} />
      </div>

      <div className={`mt-8 transform transition-all duration-700 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <Button 
          className="px-8 py-6 h-auto text-lg rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-accent/20 transition-all duration-300 hover:-translate-y-1"
        >
          <MessageCircle className="mr-2" size={20} />
          Start a new chat
          <Zap className="ml-2" size={20} />
        </Button>
      </div>

      <div className={`text-sm text-muted-foreground mt-4 transform transition-all duration-700 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        By messaging Epsilon, you agree to our <a href="/terms" className="underline hover:text-accent transition-colors">Terms</a> and <a href="/privacy" className="underline hover:text-accent transition-colors">Privacy Policy</a>
      </div>
    </div>
  );
}

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  delay: number;
}

function ToolButton({ icon, label, delay }: ToolButtonProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button 
      variant="outline" 
      className={`tool-button flex flex-row items-center justify-center h-12 gap-2 border-border/50 w-full bg-card/50 backdrop-blur-sm relative overflow-hidden transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <span className="text-accent">{icon}</span>
      <span className="font-medium">{label}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-accent/0 to-primary/0 hover:from-primary/10 hover:via-accent/10 hover:to-primary/10 transition-all duration-300"></div>
    </Button>
  );
}
