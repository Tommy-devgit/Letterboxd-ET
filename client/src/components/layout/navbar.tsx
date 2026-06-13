"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Film, User, BookOpen, List, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/explore", label: "Films", icon: Film },
  { href: "/diary", label: "Diary", icon: BookOpen },
  { href: "/watchlist", label: "Watchlist", icon: Heart },
  { href: "/lists", label: "Lists", icon: List },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
            onClick={() => setMenuOpen(false)}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-background font-bold text-sm">
              ET
            </div>
            <span className="hidden sm:block font-semibold text-foreground text-sm tracking-wide">
              Letterboxd<span className="text-accent">-ET</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  pathname === href || pathname.startsWith(href + "/")
                    ? "text-foreground bg-surface"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="p-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Link>

            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <User className="h-4 w-4" />
                  Sign in
                </Link>
              </Button>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-surface">
          <nav className="flex flex-col py-2 px-4">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  pathname === href
                    ? "text-foreground bg-surface-raised"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface-raised"
                )}
                onClick={() => setMenuOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-border">
              <Link
                href="/login"
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-surface-raised transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Sign in
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
