"use client";

import { Info } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { createContext, type ReactNode, useCallback, useContext, useRef, useState } from "react";

type Toast = { id: number; message: ReactNode };

const ToastContext = createContext<(message: ReactNode) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(0);

  const push = useCallback((message: ReactNode) => {
    const id = ++next.current;
    setToasts((all) => [...all.slice(-2), { id, message }]);
    window.setTimeout(() => setToasts((all) => all.filter((t) => t.id !== id)), 3600);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex flex-col items-center gap-2 px-4"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.9, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 8, scale: 0.96, filter: "blur(6px)" }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="glass glass-thick flex max-w-md items-center gap-2.5 rounded-full py-2.5 pr-5 pl-3.5 text-[13.5px] text-ink"
              data-glass
            >
              <Info className="size-4 text-tide" aria-hidden />
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
