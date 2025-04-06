"use client";

import React, { useEffect, useRef } from "react";

interface BubbleProps {
  count?: number;
  speed?: number;
  minSize?: number;
  maxSize?: number;
  colors?: string[];
  className?: string;
}

export function BubbleAnimation({
  count = 15, 
  speed = 5,
  minSize = 10,
  maxSize = 60,
  colors = ["from-primary/20 to-accent/20", "from-blue-200/30 to-indigo-200/30", "from-purple-200/30 to-primary/20"],
  className = "",
}: BubbleProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing bubbles
    container.innerHTML = '';

    // Create bubbles
    for (let i = 0; i < count; i++) {
      createBubble(container, speed, minSize, maxSize, colors);
    }

    // Cleanup on unmount
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [count, speed, minSize, maxSize, colors]);

  const createBubble = (
    container: HTMLDivElement,
    speed: number,
    minSize: number,
    maxSize: number,
    colors: string[]
  ) => {
    // Create bubble element
    const bubble = document.createElement('div');
    
    // Randomize bubble properties
    const size = Math.random() * (maxSize - minSize) + minSize;
    const colorIndex = Math.floor(Math.random() * colors.length);
    const positionX = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = (Math.random() * 10 + 10) / speed;
    
    // Apply styles
    bubble.className = `absolute bottom-0 rounded-full bg-gradient-to-tr ${colors[colorIndex]} backdrop-blur-sm opacity-0 animate-bubble`;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${positionX}%`;
    bubble.style.animationDelay = `${delay}s`;
    bubble.style.animationDuration = `${duration}s`;
    
    // Add to container
    container.appendChild(bubble);
    
    // Remove after animation completes
    bubble.addEventListener('animationend', () => {
      bubble.remove();
      createBubble(container, speed, minSize, maxSize, colors);
    });
  };

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}></div>
  );
}
