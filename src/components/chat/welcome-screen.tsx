"use client";

import { Button } from "@/components/ui/button";
import { Search, Brain, BarChart2, Image, Code } from "lucide-react";

export function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 text-center px-4">
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome to Epsilon.</h1>
        <p className="text-xl text-muted-foreground">How can I help you today?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-4xl w-full">
        <ToolButton icon={<Search size={18} />} label="Research" />
        <ToolButton icon={<Brain size={18} />} label="Brainstorm" />
        <ToolButton icon={<BarChart2 size={18} />} label="Analyze Data" />
        <ToolButton icon={<Image size={18} />} label="Create images" />
        <ToolButton icon={<Code size={18} />} label="Code" />
      </div>

      <div className="text-sm text-muted-foreground mt-4">
        By messaging Epsilon, you agree to our <a href="/terms" className="underline">Terms</a> and <a href="/privacy" className="underline">Privacy Policy</a>
      </div>
    </div>
  );
}

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
}

function ToolButton({ icon, label }: ToolButtonProps) {
  return (
    <Button variant="outline" className="tool-button flex flex-row items-center justify-center h-10 gap-2 border-border/50 w-full">
      <span className="text-muted-foreground">{icon}</span>
      <span>{label}</span>
    </Button>
  );
}
