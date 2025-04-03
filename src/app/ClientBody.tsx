"use client";

import { useEffect } from "react";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Set dark mode and remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.documentElement.classList.add('dark');
    document.body.className = "antialiased";
  }, []);

  return (
    <body className="antialiased dark:bg-background" suppressHydrationWarning>
      {children}
    </body>
  );
}
