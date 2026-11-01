"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/brand/logo";
import { LensRow } from "@/components/glass/lens-row";
import { useLiquidLens } from "@/components/glass/use-liquid-lens";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Chat" },
  { href: "/about", label: "About" },
];

const spring = { type: "spring", stiffness: 480, damping: 34, mass: 0.8 } as const;

export function Nav() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lens = useLiquidLens<HTMLElement>({ radius: 999, bezel: 16, strength: 16, blur: 10 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the sheet on navigation and on Escape.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on route change
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // The export uses trailing slashes ("/about/"), the links don't.
  const route = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const active = LINKS.find((l) => l.href === route)?.href ?? null;
  const lit = hovered ?? active;

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-4">
      <nav
        ref={lens.ref}
        aria-label="Main"
        data-glass
        className={cn(
          "glass flex h-14 w-full max-w-[880px] items-center justify-between rounded-full pr-2 pl-4 [transition:--g-fill-top_.5s,--g-fill-bottom_.5s]",
          scrolled && "[--g-fill-top:rgb(18_20_28/.55)] [--g-fill-bottom:rgb(12_13_19/.6)]",
        )}
      >
        {lens.filter}
        <Link href="/" aria-label="Epsilon home" className="rounded-full">
          <Wordmark />
        </Link>

        <LensRow active={lit} className="hidden md:block">
          <ul className="flex items-center py-1" onPointerLeave={() => setHovered(null)}>
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  data-lens-key={link.href}
                  aria-current={active === link.href ? "page" : undefined}
                  onPointerEnter={() => setHovered(link.href)}
                  onFocus={() => setHovered(link.href)}
                  onBlur={() => setHovered(null)}
                  className={cn(
                    "block rounded-full px-[1.15rem] py-2 text-[14px] font-medium transition-colors duration-300",
                    lit === link.href ? "text-ink" : "text-ink-3 hover:text-ink-2",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </LensRow>

        <div className="hidden items-center gap-1.5 md:flex">
          <Button href="/login" variant="ghost" size="sm">
            Sign in
          </Button>
          <Button href="/signup" variant="luminous" size="sm">
            Get started
          </Button>
        </div>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-full text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={open ? "x" : "menu"}
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={spring}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, scale: 0.92, y: -12, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, y: -8, filter: "blur(8px)" }}
            transition={spring}
            style={{ transformOrigin: "top right" }}
            data-glass
            className="glass glass-thick absolute inset-x-3 top-[4.5rem] rounded-[28px] p-2 md:hidden"
          >
            <ul>
              {LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.04 * i + 0.05 } }}
                >
                  <Link
                    href={link.href}
                    aria-current={active === link.href ? "page" : undefined}
                    className={cn(
                      "flex h-12 items-center rounded-2xl px-4 text-[16px] font-medium",
                      active === link.href ? "bg-white/[0.07] text-ink" : "text-ink-2",
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-2 grid grid-cols-2 gap-2 border-hairline border-t p-2 pt-4">
              <Button href="/login" size="md">
                Sign in
              </Button>
              <Button href="/signup" variant="luminous" size="md">
                Get started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
