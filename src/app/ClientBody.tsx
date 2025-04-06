"use client";

import { useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
    
    document.body.style.transition = "background-color 0.3s ease-in-out, color 0.3s ease-in-out";
  }, []);

  return (
    <ThemeProvider defaultTheme="light">
      <body className="antialiased bg-background" suppressHydrationWarning>
        {children}
      </body>
    </ThemeProvider>
  );
}
