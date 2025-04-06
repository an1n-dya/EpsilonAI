"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ModelSelectorProps {
  onModelChange: (model: string) => void;
}

export function ModelSelector({ onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Epsilon E3");

  const models = ["Epsilon E1", "Epsilon E2", "Epsilon E3"];

  const handleSelect = (model: string) => {
    setSelectedModel(model);
    onModelChange(model);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
      >
        {selectedModel}
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 w-32 rounded-md bg-card/95 backdrop-blur-sm shadow-lg border border-border z-10">
          <div className="py-1">
            {models.map((model) => (
              <button
                key={model}
                onClick={() => handleSelect(model)}
                className={`w-full text-left px-4 py-2 text-sm ${
                  model === selectedModel
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                {model}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
