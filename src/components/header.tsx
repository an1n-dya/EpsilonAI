"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300 backdrop-blur-md",
        scrolled 
          ? "border-blue-100 dark:border-blue-900/30 bg-white/80 dark:bg-background/80 shadow-lg" 
          : "border-transparent bg-white/50 dark:bg-background/50"
        )}
      >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 logo-container">
            <div className="bg-black dark:bg-white flex items-center justify-center rounded-lg w-8 h-8 overflow-hidden relative">
              <span className="text-white dark:text-black font-bold text-xl animate-pulse-slow">ε</span>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 opacity-60"></div>
            </div>
            <span className="logo font-medium bg-clip-text text-transparent bg-gradient-to-r from-foreground to-accent">Epsilon</span>
          </Link>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink href="/chat">Chat</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          
          <div className="flex items-center gap-2 ml-4">
            <ThemeToggle />
            
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              asChild
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 rounded-full font-medium text-sm shadow-lg hover:shadow-accent/20 transition-all duration-300 hover:-translate-y-1 glow-button"
              asChild
            >
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="text-muted-foreground"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-t border-border/50 animate-fadeIn">
          <div className="flex flex-col p-4 space-y-4">
            <MobileNavLink href="/chat" onClick={() => setMobileMenuOpen(false)}>Chat</MobileNavLink>
            <MobileNavLink href="/about" onClick={() => setMobileMenuOpen(false)}>About</MobileNavLink>
            <MobileNavLink href="/blog" onClick={() => setMobileMenuOpen(false)}>Blog</MobileNavLink>
            
            <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                className="w-full justify-center text-muted-foreground"
                asChild
              >
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
              </Button>
              <Button
                className="w-full justify-center bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full"
                asChild
              >
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="relative text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium py-1"
    >
      {children}
      <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-accent transform scale-x-0 transition-transform duration-300 origin-left hover:scale-x-100"></span>
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link 
      href={href} 
      className="text-foreground py-2 px-4 hover:bg-accent/10 rounded-md transition-colors duration-200"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
