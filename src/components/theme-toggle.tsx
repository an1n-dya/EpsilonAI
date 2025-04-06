"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="rounded-full transition-all duration-300 hover:bg-secondary"
        aria-label="Toggle theme"
      >
        <Sun 
          size={18} 
          className="transition-transform duration-500 rotate-0 scale-100 dark:rotate-90 dark:scale-0 theme-toggle-icon theme-toggle-icon-sun" 
        />
        <Moon 
          size={18} 
          className="absolute transition-transform duration-500 rotate-90 scale-0 dark:rotate-0 dark:scale-100 theme-toggle-icon theme-toggle-icon-moon" 
        />
      </Button>
    </div>
  );
}
